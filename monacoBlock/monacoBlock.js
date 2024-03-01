/*
 * @Version: 0.46.0
 */
export default class MonacoBlock {
  decorationsCollection = null; // 块状元素装饰器
  firstSelection = null;
  isMac = /macintosh|mac os x/i.test(navigator.userAgent);

  constructor(editor, monaco, options = {}) {
    this.editor = editor;
    this.monaco = monaco;
    this.selectionBlock = null; // 选中的块状元素数据

    const defaultOptions = {
      cancelJsDiagnostics: true, // 取消j/ts语义校验
      cancelJsCompletionItems: true, // 取消j/ts提示
    };
    this.options = Object.assign({}, defaultOptions, options);
    this.init();
  }

  _setOptions(isDestroy = false) {
    const { cancelJsDiagnostics, cancelJsCompletionItems } = this.options;
    if (cancelJsDiagnostics) {
      this.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
        {
          noSemanticValidation: !isDestroy,
          noSyntaxValidation: !isDestroy,
        }
      );
    }
    if (cancelJsCompletionItems) {
      this.monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
        completionItems: isDestroy,
      });
    }
  }
  init() {
    this._setOptions();
    const _this = this;
    // 处理选中了块状元素，输入非backspace/delete键后，内容被删除，但是块状元素本身还存留问题。
    const changeValue = (interval = 50) => {
      let timer = null;
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          if (_this.selectionBlock) {
            _this.handleParseZero2decoration();
            _this.selectionBlock = {};
          }
          timer = null;
        }, interval);
      };
    };
    this.editor.onDidChangeModelContent(changeValue());

    this.editor.onDidChangeCursorSelection(
      this.handleChangeCursorSelection.bind(this)
    );

    this.editor.onMouseDown(() => {
      setTimeout(() => {
        this.firstSelection = this.editor.getPosition();
      }, 50);
    });
    this.editor.onMouseUp(() => {
      setTimeout(() => {
        this.firstSelection = null;
        const selection = this.editor.getSelection();
        this.selectionBlock = this.handkeIsIndecorationRange(
          selection,
          true,
          true,
          true
        );
      }, 50);
    });
    // 重写删除事件
    this.editor.addAction({
      id: "backspace",
      label: "backspace",
      keybindings: [this.monaco.KeyCode.Backspace],
      run: () => this.handleResetBackspace.bind(this)(),
    });
    this.editor.addAction({
      id: "delete",
      label: "delete",
      keybindings: [this.monaco.KeyCode.Delete],
      run: () => this.handleResetBackspace.bind(this)(true),
    });
    // 监听ctrl+v/ctrl+z/ctrl+y
    this.editor.onKeyDown(({ metaKey, ctrlKey, keyCode }) => {
      const ck = this.isMac ? metaKey : ctrlKey;
      if (ck && (keyCode === 56 || keyCode === 52 || keyCode === 55)) {
        setTimeout(() => {
          this.handleParseZero2decoration();
        }, 50);
      }
    });
    this.handleParseZero2decoration();
  }
  /**
   * @description: 删除逻辑
   * @param {Boolean} isDelete 是否为delete键删除
   * @return {*}
   */
  handleResetBackspace(isDelete = false) {
    const { lineNumber, column } = this.editor.getPosition();
    const selection = this.editor.getSelection();
    const { endColumn, endLineNumber, startColumn, startLineNumber } =
      selection;
    let deleteElement = {};
    let hasBlock = false;
    // 判断是否为选中删除
    if (startLineNumber === endLineNumber && startColumn === endColumn) {
      deleteElement = this.handkeIsIndecorationRange(selection, isDelete, true);
    } else {
      deleteElement = this.handkeIsIndecorationRange(
        selection,
        false,
        true,
        true
      );
    }
    if (!deleteElement) {
      if (isDelete) {
        deleteElement = {
          lineNumbers: [startLineNumber, endLineNumber],
          columns: [
            startColumn,
            endColumn === startColumn ? endColumn + 1 : endColumn,
          ],
        };
      } else {
        deleteElement = {
          lineNumbers: [startLineNumber, endLineNumber],
          columns: [
            startColumn === endColumn ? startColumn - 1 : startColumn,
            endColumn,
          ],
        };
      }
    } else {
      // 删除块状元素
      if (this.options.deleteBlockCode) {
        let i = 0;
        let deleteCodes = [];
        while (i < deleteElement.ranges.length || 0) {
          const range = deleteElement.ranges[i];
          deleteCodes.push({
            code: this.editor
              .getModel()
              .getValueInRange(range)
              .replace(/\u200b/g, ""),
            range,
          });
          i++;
        }
        this.options?.deleteBlockCode?.(deleteCodes);
      }
      hasBlock = true;
    }

    this.editor.executeEdits("", [
      {
        range: new monaco.Range(
          deleteElement.lineNumbers[0],
          deleteElement.columns[0],
          deleteElement.lineNumbers[1],
          deleteElement.columns[1]
        ),
        text: "",
        forceMoveMarkers: true, // 取消选中状态
      },
    ]);
    // 删除decoration数据
    if (hasBlock) {
      this.handleParseZero2decoration();
    }
    // 检查光标是否需要换行
    if (column === 1 && lineNumber !== 1) {
      const focusLineMaxColums =
        this.editor.getModel().getLineMaxColumn(lineNumber) - 1;
      this.editor.executeEdits("", [
        {
          range: new monaco.Range(
            lineNumber - 1,
            this.editor.getModel().getLineMaxColumn(lineNumber - 1),
            lineNumber,
            0
          ),
          text: "",
          forceMoveMarkers: true, // 取消选中状态
        },
      ]);
      this.editor.setPosition({
        lineNumber: lineNumber - 1,
        column:
          this.editor.getModel().getLineMaxColumn(lineNumber - 1) -
          focusLineMaxColums,
      });
    }
  }
  // 监听光标移动事件
  handleChangeCursorSelection({ selection, source, oldSelections }) {
    const validSource = ["mouse", "keyboard"];
    if (this.decorationsCollection && validSource.includes(source)) {
      const isSingle = !this.firstSelection;
      // 目标decoration位置信息
      let targetPosition = {};
      // 找出当先区域是否含有块状元素
      targetPosition = this.handkeIsIndecorationRange(selection);
      // 非选中模式
      if (isSingle) {
        // 如果有块状元素重新光标移动逻辑
        if (targetPosition) {
          const [left, right] = targetPosition.columns;
          const { column: currentPositionColum, lineNumber } =
            this.editor.getPosition();
          // 利用鼠标移动焦点
          if (source === "mouse") {
            let range = {
              lineNumber,
              column: (left + right) / 2 > currentPositionColum ? left : right,
            };
            this.editor.setPosition(range);
          } else {
            const direction =
              selection.endColumn > oldSelections[0].endColumn
                ? "toRight"
                : "toLeft";
            let range = {
              lineNumber: lineNumber,
              column: direction === "toRight" ? right : left,
            };
            this.editor.setPosition(range);
          }
        }
      } else {
        const { positionLineNumber, positionColumn } = selection;
        const { lineNumber: firstLineNumber, column: firstPositionColumn } =
          this.firstSelection;
        // 移动方向
        const directionRight =
          positionLineNumber > firstLineNumber ||
          (positionLineNumber === firstLineNumber &&
            positionColumn > firstPositionColumn);
        if (!targetPosition) {
          targetPosition = {
            columns: [selection.positionColumn, selection.positionColumn],
          };
        }
        // 向右选
        if (directionRight) {
          this.editor.setSelection({
            endColumn: targetPosition.columns[1],
            endLineNumber: positionLineNumber,
            startColumn: this.firstSelection.column,
            startLineNumber: this.firstSelection.lineNumber,
          });
        } else {
          // 向左选
          this.editor.setSelection({
            endColumn: firstPositionColumn,
            endLineNumber: firstLineNumber,
            startColumn: targetPosition.columns[0],
            startLineNumber: positionLineNumber,
          });
        }
      }
    }
  }
  /**
   * @description: 当前光标所在位置是否处于某个decoration内
   * @param {Monaco.Position} position 光标位置
   * @param {Boolean} prevClosure 是否为前闭合区间
   * @param {Boolean} afterClosure 是否为后闭合区间
   * @param {Boolean} reverse 找出position内的区间
   * @return {Monaco.Position/Monaco.Selection} decoration位置信息
   */

  handkeIsIndecorationRange(
    position,
    prevClosure = false,
    afterClosure = false,
    reverse = false
  ) {
    if (this.decorationsCollection) {
      const decorationPosition = this.decorationsCollection.getRanges();
      let i = 0;
      let data = null;
      while (i < decorationPosition.length) {
        const range = decorationPosition[i];
        const line = range.startLineNumber;
        const startColumn = range.startColumn + +!prevClosure;
        const endColumn = range.endColumn + +afterClosure;
        if (reverse) {
          const { endColumn, endLineNumber, startColumn, startLineNumber } =
            position;
          const {
            endColumn: rEndColumn,
            endLineNumber: rEndLineNumber,
            startColumn: rStartColumn,
            startLineNumber: rStartLineNumber,
          } = range;
          if (
            startLineNumber <= rStartLineNumber &&
            endLineNumber >= rEndLineNumber &&
            startColumn <= rStartColumn &&
            endColumn >= rEndColumn
          ) {
            if (!data) {
              data = {
                lineNumbers: [startLineNumber, endLineNumber],
                columns: [startColumn, endColumn],
                index: [i],
                ranges: [range],
              };
            } else {
              data.index.push(i);
              data.ranges.push(range);
            }
          }
          i++;
        } else {
          if (
            line === position.positionLineNumber &&
            position.positionColumn >= startColumn &&
            position.positionColumn < endColumn
          ) {
            return {
              lineNumbers: [line, line],
              columns: [range.startColumn, range.endColumn],
              index: [i],
              ranges: [range],
            };
          } else {
            i++;
          }
        }
      }
      return data;
    } else {
      return null;
    }
  }
  // 解析零宽字符为装饰器
  handleParseZero2decoration() {
    const editPosition = this.editor
      .getModel()
      .findMatches(/\u200b[\s\S]+?\u200b/, false, true);
    if (editPosition.length) {
      let decorations = [];
      for (let i = 0; i < editPosition.length; i++) {
        const range = editPosition[i].range;
        const blockCode = this.editor
          .getModel()
          .getValueInRange(range)
          .replace(/\u200b/g, "");
        // 设置装饰器
        decorations.push({
          range: range,
          options: this.handleDecorationOption(blockCode),
        });
      }
      if (this.decorationsCollection) {
        this.decorationsCollection.set(decorations);
      } else {
        this.decorationsCollection =
          this.editor.createDecorationsCollection(decorations);
      }
    }
  }
  // 元素装饰器设置
  handleDecorationOption(code) {
    const { blockClassName, customBlockStyle } = this.options;
    let decorationOption = {};
    if (customBlockStyle) {
      // 自定义样式
      decorationOption = customBlockStyle(code);
    } else {
      decorationOption = {
        inlineClassName: blockClassName || "editor-custom-block",
        stickiness:
          monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, // 边缘输入时不进行装饰
      };
    }
    return decorationOption;
  }
  // 处理给光标在块状代码边界时追加代码问题
  handleFixBlockEdge(range) {
    const hasBlock = this.editor.getDecorationsInRange(range).length;
    if (hasBlock) {
      this.handleParseZero2decoration();
    }
    return hasBlock;
  }
  /**
   * @description: 添加代码
   * @param {string|Object} insertContent 添加的内容
   * @param {string} type 添加方式  参考值：[focus, end]
   * @return {*}
   */
  addCode(insertContent, type = "focus") {
    let code = insertContent?.code || insertObj;
    if (code && this.editor) {
      let range = null;
      if (type === "focus") {
        let selection = this.editor.getSelection();
        range = new monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn
        );
      } else {
        const maxLine = this.editor.getModel().getLineCount();
        range = new monaco.Range(maxLine + 1, 1, maxLine + 1, 1);
      }
      let op = {
        range: range,
        text: code,
        forceMoveMarkers: true, // 取消选中状态
      };
      // 直接追加普通文本
      if (insertContent?.isNormal) {
        // 若添加代码时有选中的其他代码块【onDidChangeModelContent】会处理该逻辑
        if (!this.selectionBlock) {
          // 处理需要转义的代码块元素
          const hasBlockCode = (code.match(/{@[\s\S]+?@}/) || []).length;
          if (hasBlockCode) {
            op.text = code.replace(/{@([\s\S]+?)@}/, "\u200b$1\u200b");
          }
          this.editor.executeEdits("", [op]);
          if (hasBlockCode) {
            this.handleParseZero2decoration();
          } else {
            this.handleFixBlockEdge(range);
          }
        }
      } else {
        // 块状元素处理[添加\200c零宽是为了处理光标在块状边界时添加代码会和前面的块状代码融合]
        op.text = `\u200b${op.text}\u200b`;
        const decorationRange = [
          range.startLineNumber,
          range.startColumn,
          range.startLineNumber,
          range.startColumn + op.text.length,
        ];
        this.editor.executeEdits("", [op]);
        if (this.decorationsCollection) {
          // 同上
          if (!this.selectionBlock) {
            const idBesideBlock = this.handleFixBlockEdge(range);
            if (!idBesideBlock) {
              this.decorationsCollection.append([
                {
                  range: new monaco.Range(...decorationRange),
                  options: this.handleDecorationOption(code),
                },
              ]);
            }
          }
        } else {
          this.decorationsCollection = this.editor.createDecorationsCollection([
            {
              range: new monaco.Range(...decorationRange),
              options: this.handleDecorationOption(code),
            },
          ]);
        }
      }

      this.editor.focus();
    }
  }
  // 获取所有的块状位置信息
  getAllBlockMessage() {
    this.handleParseZero2decoration();
    return this.decorationsCollection.getRanges();
  }
  // 隐藏零宽字符特殊提示
  hiddenZeroTip() {
    this.editor.updateOptions({
      unicodeHighlight: {
        invisibleCharacters: false,
      }, // 隐藏零宽字符特殊显示
    });
  }
  destroy() {
    this._setOptions(true);
  }
}
