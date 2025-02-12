/*
 * @Version: 0.46.0
 */
export default class MonacoBlock {
  decorationsCollection = null; // 块状元素装饰器
  firstSelection = null;
  isMac = /macintosh|mac os x/i.test(navigator.userAgent);

  constructor(editor, options = {}) {
    this.editor = editor;
    this.selectionBlock = null; // 选中的块状元素数据

    const defaultOptions = {
      cancelJsDiagnostics: true, // 取消j/ts语义校验
      cancelJsCompletionItems: true // 取消j/ts提示
    };
    this.options = Object.assign({}, defaultOptions, options);
    this.init();
  }

  _setOptions(isDestroy = false) {
    const { cancelJsDiagnostics, cancelJsCompletionItems } = this.options;
    if (cancelJsDiagnostics) {
      window.window.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: !isDestroy,
        noSyntaxValidation: !isDestroy
      });
    }
    if (cancelJsCompletionItems) {
      window.monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
        completionItems: isDestroy
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

    this.editor.onDidChangeCursorSelection(this.handleChangeCursorSelection.bind(this));

    this.editor.onMouseDown(() => {
      setTimeout(() => {
        this.firstSelection = this.editor.getPosition();
      }, 50);
    });
    this.editor.onMouseUp(() => {
      setTimeout(() => {
        this.firstSelection = null;
        const selection = this.editor.getSelection();
        this.selectionBlock = this.handleIsIndecorationRange(selection, true, true, true);
      }, 50);
    });
    // 监听ctrl+v/ctrl+z/ctrl+y
    this.editor.onKeyDown((e) => {
      const ck = this.isMac ? e.metaKey : e.ctrlKey;
      if (ck && (e.keyCode === 56 || e.keyCode === 52 || e.keyCode === 55)) {
        setTimeout(() => {
          this.handleParseZero2decoration();
        }, 50);
      } else if (e.keyCode === 1 || e.keyCode === 20) {
        if (this.editor.hasTextFocus()) {
          e.preventDefault();
          e.stopPropagation();
          this.handleResetBackspace(e.keyCode === 20);
        }
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
    if (!this.editor.hasTextFocus()) return;
    const { lineNumber, column } = this.editor.getPosition();
    const selection = this.editor.getSelection();
    const { endColumn, endLineNumber, startColumn, startLineNumber } = selection;
    let deleteElement = {};
    let hasBlock = false;
    // 判断是否为选中删除
    if (startLineNumber === endLineNumber && startColumn === endColumn) {
      deleteElement = this.handleIsIndecorationRange(selection, isDelete, true);
    } else {
      deleteElement = this.handleIsIndecorationRange(selection, false, true, true);
    }
    if (!deleteElement) {
      if (isDelete) {
        deleteElement = {
          lineNumbers: [startLineNumber, endLineNumber],
          columns: [startColumn, endColumn === startColumn ? endColumn + 1 : endColumn]
        };
      } else {
        deleteElement = {
          lineNumbers: [startLineNumber, endLineNumber],
          columns: [startColumn === endColumn ? startColumn - 1 : startColumn, endColumn]
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
            code: this._utilGetDecorationInRangeData(range),
            range
          });
          i++;
        }
        this.options?.deleteBlockCode?.(deleteCodes);
      }
      hasBlock = true;
    }

    this.editor.executeEdits("", [
      {
        range: new window.monaco.Range(deleteElement.lineNumbers[0], deleteElement.columns[0], deleteElement.lineNumbers[1], deleteElement.columns[1]),
        text: "",
        forceMoveMarkers: true // 取消选中状态
      }
    ]);
    // 删除decoration数据
    if (hasBlock) {
      this.handleParseZero2decoration();
    }
    // 检查光标是否需要换行
    if (column === 1 && lineNumber !== 1) {
      const focusLineMaxColums = this.editor.getModel().getLineMaxColumn(lineNumber) - 1;
      this.editor.executeEdits("", [
        {
          range: new window.monaco.Range(lineNumber - 1, this.editor.getModel().getLineMaxColumn(lineNumber - 1), lineNumber, 0),
          text: "",
          forceMoveMarkers: true // 取消选中状态
        }
      ]);
      this.editor.setPosition({
        lineNumber: lineNumber - 1,
        column: this.editor.getModel().getLineMaxColumn(lineNumber - 1) - focusLineMaxColums
      });
    }
  }
  // 监听光标移动事件
  handleChangeCursorSelection({ selection, source, oldSelections }) {
    const validSource = ["mouse", "keyboard"];
    if (this.decorationsCollection && validSource.includes(source)) {
      const isSingle = !this.firstSelection;
      // 目标decoration位置信息
      let targetPosition = null;
      // 找出当先区域是否含有块状元素
      targetPosition = this.handleIsIndecorationRange(selection);

      // 非选中模式
      if (isSingle) {
        if (!targetPosition) return;
        const [left, right] = targetPosition.columns;
        const { startColumn: currentPositionColumn, startLineNumber: currentLineNumber } = selection;
        const { startLineNumber: oldLineNumber, startColumn: oldColumn } = oldSelections[0];
        // 利用鼠标移动焦点
        if (source === "mouse") {
          // 如果有块状元素重新光标移动逻辑
          let range = {
            lineNumber: currentLineNumber,
            column: (left + right) / 2 > currentPositionColumn ? left : right
          };
          this.editor.setPosition(range);
        } else {
          // 键盘移动横向光标
          if (oldLineNumber === currentLineNumber) {
            const direction = currentPositionColumn > oldColumn ? right : left;
            let range = {
              lineNumber: currentLineNumber,
              column: direction
            };

            this.editor.setPosition(range);
          } else {
            let range = {
              lineNumber: currentLineNumber,
              column: (left + right - 1) / 2 > currentPositionColumn ? left : right
            };
            this.editor.setPosition(range);
          }
        }
      } else {
        const { positionLineNumber, positionColumn } = selection;
        const { lineNumber: firstLineNumber, column: firstPositionColumn } = this.firstSelection;
        // 移动方向
        const directionRight =
          positionLineNumber > firstLineNumber || (positionLineNumber === firstLineNumber && positionColumn > firstPositionColumn);
        if (!targetPosition) {
          targetPosition = {
            columns: [selection.positionColumn, selection.positionColumn]
          };
        }
        // 向右选
        if (directionRight) {
          this.editor.setSelection({
            endColumn: targetPosition.columns[1],
            endLineNumber: positionLineNumber,
            startColumn: firstPositionColumn,
            startLineNumber: firstLineNumber
          });
        } else {
          // 向左选
          this.editor.setSelection({
            endColumn: firstPositionColumn,
            endLineNumber: firstLineNumber,
            startColumn: targetPosition.columns[0],
            startLineNumber: positionLineNumber
          });
        }
      }
    }
  }
  /**
   * @description: 当前光标所在位置是否处于某个decoration内
   * @param {window.monaco.Position} position 光标位置
   * @param {Boolean} prevClosure 是否为前闭合区间
   * @param {Boolean} afterClosure 是否为后闭合区间
   * @param {Boolean} reverse 找出position内的块状
   * @return {window.monaco.Position/window.monaco.Selection} decoration位置信息
   */

  handleIsIndecorationRange(position, prevClosure = false, afterClosure = false, reverse = false) {
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
          const { endColumn, endLineNumber, startColumn, startLineNumber } = position;
          if (position.containsRange(range)) {
            if (!data) {
              data = {
                lineNumbers: [startLineNumber, endLineNumber],
                columns: [startColumn, endColumn],
                index: [i],
                ranges: [range]
              };
            } else {
              data.index.push(i);
              data.ranges.push(range);
            }
          }
          i++;
        } else {
          if (line === position.positionLineNumber && position.positionColumn >= startColumn && position.positionColumn < endColumn) {
            return {
              lineNumbers: [line, line],
              columns: [range.startColumn, range.endColumn],
              index: [i],
              ranges: [range]
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
  _utilGetDecorationInRangeData(range) {
    return this.editor
      .getModel()
      .getValueInRange(range)
      .replace(/\u200b/g, "");
  }
  // 解析零宽字符为装饰器
  handleParseZero2decoration() {
    const editPosition = this.editor.getModel().findMatches(/\u200b[\s\S]+?\u200b/, false, true);
    if (editPosition.length) {
      let decorations = [];
      for (let i = 0; i < editPosition.length; i++) {
        const range = editPosition[i].range;
        const blockCode = this._utilGetDecorationInRangeData(range);
        // 设置装饰器
        decorations.push({
          range: range,
          options: this.handleDecorationOption(blockCode)
        });
      }
      if (this.decorationsCollection) {
        this.decorationsCollection.set(decorations);
      } else {
        this.decorationsCollection = this.editor.createDecorationsCollection(decorations);
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
      decorationOption.description = code;
    } else {
      decorationOption = {
        inlineClassName: blockClassName || "editor-custom-block",
        stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, // 边缘输入时不进行装饰
        description: code
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
  // 获取所有的块状位置信息
  getAllBlockMessage() {
    this.handleParseZero2decoration();
    return this.decorationsCollection.getRanges();
  }
  /**
   * @description: 添加代码
   * @param {string|Object} insertContent 添加的内容
   *   @param {Boolean} isNormal 是否为普通文本
   *   @param {String}  code 块状代码
   *
   * @param {string} type 添加方式  参考值：[focus, end]
   * @return {*}
   */
  addCode(insertContent, type = "focus") {
    let code = insertContent?.code || insertContent;
    if (code && this.editor) {
      let range = null;
      if (type === "focus") {
        let selection = this.editor.getSelection();
        range = new window.monaco.Range(selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
      } else {
        const maxLine = this.editor.getModel().getLineCount();
        range = new window.monaco.Range(maxLine + 1, 1, maxLine + 1, 1);
      }
      let op = {
        range: range,
        text: code,
        forceMoveMarkers: true // 取消选中状态
      };
      // 直接追加普通文本
      if (insertContent?.isNormal) {
        // 若添加代码时有选中的其他代码块【onDidChangeModelContent】会处理该逻辑
        if (!this.selectionBlock) {
          // 处理需要转义的代码块元素
          const hasBlockCode = (code.match(/{@[\s\S]+?@}/) || []).length;
          if (hasBlockCode) {
            op.text = code.replace(/{@([\s\S]+?)@}/g, "\u200b$1\u200b");
          }
          this.editor.executeEdits("", [op]);
          if (hasBlockCode) {
            this.handleParseZero2decoration();
          } else {
            this.handleFixBlockEdge(range);
          }
        }
      } else {
        op.text = `\u200b${op.text}\u200b`;
        const decorationRange = [range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn + op.text.length];
        this.editor.executeEdits("", [op]);
        if (this.decorationsCollection) {
          if (!this.selectionBlock) {
            const isBesideBlock = this.handleFixBlockEdge(range);
            if (!isBesideBlock) {
              this.decorationsCollection.append([
                {
                  range: new window.monaco.Range(...decorationRange),
                  options: this.handleDecorationOption(insertContent)
                }
              ]);
            }
          }
        } else {
          this.decorationsCollection = this.editor.createDecorationsCollection([
            {
              range: new window.monaco.Range(...decorationRange),
              options: this.handleDecorationOption(insertContent)
            }
          ]);
        }
      }

      this.editor.focus();
    }
  }
  // 获取编辑器内容
  getCode() {
    let value = this.editor.getValue();
    return {
      value: value.replace(/\u200b/g, ""),
      blockValue: value
    };
  }
  // 清空编辑器
  clear() {
    this.editor.setValue("");
    this.decorationsCollection = null;
  }
  destroy() {
    this._setOptions(true);
    this.editor?.dispose?.();
  }
}
