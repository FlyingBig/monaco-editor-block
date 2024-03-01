/*
 * @Editor: chenqy
 * @Description:
 * @Date: 2023-04-07 15:52:39
 * @LastEditors: Chenqy
 * @LastEditTime: 2024-03-01 17:54:38
 */
import MonacoBlock from "./monacoBlock/monacoBlock";
import * as monaco from "monaco-editor";

let monacoEditor = monaco.editor.create(document.querySelector(".root"), {
  language: "javascript",
  value: "test", // 编辑器初始显示文字
  automaticLayout: true, // 自动布局
  theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
});
const monacoBlock = new MonacoBlock(monacoEditor, monaco, {
  blockClassName: "editor-custom-block",
  deleteBlockCode: (codes) => {
    console.log(codes);
  },
  customBlockStyle: (blockWord) => {
    console.log(blockWord);
    return {
      inlineClassName:
        blockWord === "性别" ? "editor-custom-red" : "editor-custom-blue",
      stickiness:
        monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    };
  },
});
console.log(monacoEditor, monacoBlock);

monacoBlock.hiddenZeroTip();
window.monaco = monaco;

const handleAddVar = (code) => {
  monacoBlock.addCode(code);
};
const jj = () => {
  let selection = monacoEditor.getSelection();
  const range = new monaco.Range(
    selection.startLineNumber,
    selection.startColumn,
    selection.endLineNumber,
    selection.endColumn
  );
  let op = {
    range: range,
    text: "()",
    forceMoveMarkers: true, // 取消选中状态
  };
  monacoEditor.executeEdits("", [op]);
};
const addBtn = () => {
  let btn = document.createElement("button");
  btn.innerText = "添加块状变量0";
  btn.onclick = () => {
    handleAddVar({ code: `性别` });
  };
  let btn1 = document.createElement("button");
  btn1.innerText = "添加块状变量1";
  btn1.onclick = () => {
    handleAddVar({ code: "年龄" });
  };
  document.body.append(btn);
  document.body.append(btn1);
};
addBtn();
