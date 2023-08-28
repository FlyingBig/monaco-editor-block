/*
 * @Editor: chenqy
 * @Description:
 * @Date: 2023-04-07 15:52:39
 * @LastEditors: Chenqy
 * @LastEditTime: 2023-07-28 11:30:26
 */
import MonacoBlock from "./monacoBlock/monacoBlock";
import * as monaco from "monaco-editor";

let monacoEditor = monaco.editor.create(document.querySelector(".root"), {
  value: "test", // 编辑器初始显示文字
  automaticLayout: true, // 自动布局
  theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
});
const monacoBlock = new MonacoBlock(monacoEditor, monaco);
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
  }
   monacoEditor.executeEdits("", [op]);
};
const addBtn = () => {
  let btn = document.createElement("button");
  btn.innerText = "添加块状变量0";
  btn.onclick = handleAddVar.bind(null, { code: `\u200c\u200c\u200c性别`, id: "sex0" });
  let btn1 = document.createElement("button");
  btn1.innerText = "添加块状变量1";
  btn1.onclick = jj.bind(null, { code: "性别", id: "sex1" });
  document.body.append(btn);
  document.body.append(btn1);
};
addBtn();
