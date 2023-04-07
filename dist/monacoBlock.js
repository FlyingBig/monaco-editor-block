export class MonacoBlock {
  decorationsCollection = null; // 块状元素装饰器
  firstSelection = null;

  constructor(editor, monaco) {
    this.editor = editor;
    this.monaco = monaco;
    this.init();
  }
  init() {
    this.editor.onDidChangeCursorSelection(
      this.handleChangeCursorSelection.bind(this)
    );
    this.editor.onMouseDown(() => {
      this.firstSelection = this.editor.getPosition();
    });
    this.editor.onMouseUp(() => {
      this.firstSelection = null;
    });
    // 重写删除事件
    this.editor.addCommand(this.monaco.KeyCode.Backspace, () => {
      this.handleResetBackspace.bind(this)();
    });
    this.editor.addCommand(this.monaco.KeyCode.Delete, () => {
      this.handleResetBackspace.bind(this)(true);
    });
    // 重写undo
    this.editor.addCommand(
      this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyZ,
      () => {
        this.editor.getModel()?.undo();
        this.handleParseZero2decoration.bind(this)();
      }
    );
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
    if (!Object.keys(targetPosition).length) {
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
      hasBlock = true;
    }
    this.editor.executeEdits("", [
      {
        range: new this.monaco.Range(
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
      const ranges = this.decorationsCollection.getRanges();
      let decorations = [];
      for (let i = 0, j = ranges.length; i < j; i++) {
        if (!deleteElement.index.includes(i)) {
          const item = ranges[i];
          decorations.push({
            range: new this.monaco.Range(
              item.startLineNumber,
              item.startColumn,
              item.endLineNumber,
              item.endColumn
            ),
            options: this.handleDecorationOption("editor-custom-block"),
          });
        }
      }
      this.decorationsCollection.set(decorations);
    }
    // 检查光标是否需要换行
    if (column === 1 && lineNumber !== 1) {
      this.editor.setPosition({
        lineNumber: lineNumber - 1,
        column: this.editor.getModel().getLineMaxColumn(lineNumber - 1),
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
        if (Object.keys(targetPosition).length) {
          const direction =
            selection.endColumn > oldSelections[0].endColumn
              ? "toRight"
              : "toLeft";
          let range = {
            lineNumber: targetPosition.lineNumbers[0],
            column: targetPosition.columns[direction === "toRight" ? 1 : 0],
          };
          this.editor.setPosition(range);
        }
      } else {
        const { positionLineNumber, positionColumn } = selection;
        const { lineNumber: firstLineNumber, column: firstPositionColumn } =
          this.firstSelection;
        if (!Object.keys(targetPosition).length) {
          targetPosition = {
            columns: [selection.positionColumn, selection.positionColumn],
          };
        }
        if (
          positionLineNumber > firstLineNumber ||
          (positionLineNumber === firstLineNumber &&
            positionColumn > firstPositionColumn)
        ) {
          // 向后选
          this.editor.setSelection({
            endColumn: targetPosition.columns[1],
            endLineNumber: positionLineNumber,
            startColumn: this.firstSelection.column,
            startLineNumber: this.firstSelection.lineNumber,
          });
        } else {
          // 向前选
          this.editor.setSelection({
            endColumn: firstPositionColumn,
            endLineNumber: firstLineNumber,
            startColumn: targetPosition.columns[0],
            startLineNumber: positionLineNumber,
          });
        }
      }
      this.prevPosition = selection;
    }
  }
  /**
   * @description: 当前光标所在位置是否处于某个decoration内
   * @param {this.monaco.Position} position 光标位置
   * @param {Boolean} prevClosure 是否为前闭合区间
   * @param {Boolean} afterClosure 是否为后闭合区间
   * @param {Boolean} reverse 找出position内的区间
   * @return {this.monaco.Position/this.monaco.Selection} decoration位置信息
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
      let data = {};
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
            if (!data.index) {
              data = {
                lineNumbers: [startLineNumber, endLineNumber],
                columns: [startColumn, endColumn],
                index: [i],
              };
            } else {
              data.index.push(i);
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
            };
          } else {
            i++;
          }
        }
      }
      return data;
    } else {
      return {};
    }
  }
  // 解析零宽字符为装饰器
  handleParseZero2decoration() {
    const editPosition = this.editor
      .getModel()
      .findMatches(/\u200b [^ \u200b]+ \u200b/, false, true);
    if (editPosition.length) {
      let decorations = [];
      for (let i = 0; i < editPosition.length; i++) {
        // let { endColumn, endLineNumber, startColumn, startLineNumber } =
        //   editPosition[i].range;
        // 设置装饰器
        decorations.push({
          range: editPosition[i].range,
          options: this.handleDecorationOption("editor-custom-block"),
        });
        this.decorationsCollection =
          this.editor.createDecorationsCollection(decorations);
      }
    }
  }
  // 元素装饰器设置
  handleDecorationOption(className) {
    return {
      inlineClassName: className,
      stickiness:
        monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges, // 边缘输入时不进行装饰
    };
  }
  /**
   * @description: 添加代码
   * @param {string} code 代码串
   * @param {string} type 添加方式  参考值：[focus, end]
   * @return {*}
   */
  addCode(code, type = "focus") {
    if (typeof code !== "string") {
      alert("插入内容须为字符串");
      return;
    }
    if (this.editor) {
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
      // 块状元素处理
      const className = "editor-custom-block";
      op.text = `\u200b ${op.text} \u200b`;
      const decorationRange = [
        range.startLineNumber,
        range.startColumn,
        range.startLineNumber,
        range.startColumn + op.text.length,
      ];
      if (this.decorationsCollection) {
        let decorations = this.decorationsCollection
          .getRanges()
          .map((item, index) => {
            return {
              range: new monaco.Range(
                item.startLineNumber,
                item.startColumn,
                item.endLineNumber,
                item.endColumn
              ),

              options: this.handleDecorationOption(className),
            };
          });
        decorations.push({
          range: new monaco.Range(...decorationRange),
          options: this.handleDecorationOption(className),
        });
        this.editor.executeEdits("", [op]);
        this.decorationsCollection.set(decorations);
      } else {
        this.editor.executeEdits("", [op]);
        this.decorationsCollection = this.editor.createDecorationsCollection([
          {
            range: new monaco.Range(...decorationRange),
            options: this.handleDecorationOption(className),
          },
        ]);
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
}
