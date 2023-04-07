import { MonacoBlock } from "./dist/monacoBlock";
import * as monaco from "monaco-editor";

let monacoEditor = monaco.editor.create(document.querySelector(".root"), {
  value: "test", // 编辑器初始显示文字
  automaticLayout: true, // 自动布局
  theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
});
const monacoBlock = new MonacoBlock(monacoEditor, monaco);
monacoBlock.hiddenZeroTip();
window.monaco = monaco;
console.log(monacoBlock);
const handleAddVar = () => {
  const code = "我是块状变量";
  monacoBlock.addCode(code);
};

const addBtn = () => {
  let btn = document.createElement("button");
  btn.innerText = "添加块状变量";
  btn.onclick = handleAddVar;
  document.body.append(btn);
};
addBtn();
