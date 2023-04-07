# monaco-editor-block
monaco-editor-block 为monaco-editor的块状元素扩充插件
### 使用步骤
1. 导入monaco-editor-block.js
2. 创建monaco实列
3. 初始化monaco-editor-block
4. 如需要创建块状元素调用monaco-editor-block的addCode方法
### 额外方式
  1. hiddenZeroTip: 隐藏零宽字符在monaco中的特殊样式
  2. 若需要修改块状元素的样式，在项目中直接覆盖.editor-custom-block的样式即可
### 使用代码
``` javascript
  import { MonacoBlock } from "./dist/monacoBlock";
  import * as monaco from "monaco-editor";

  let monacoEditor = monaco.editor.create(document.querySelector(".root"), {
    value: "test",
    automaticLayout: true, 
    theme: "vs",
  });
  const monacoBlock = new MonacoBlock(monacoEditor, monaco);
  monacoBlock.hiddenZeroTip(); 
  const handleAddVar = () => {
    const code = "我是块状变量";
    // 添加块状元素
    monacoBlock.addCode(code);
  };

  const addBtn = () => {
    let btn = document.createElement("button");
    btn.innerText = "添加块状变量";
    btn.onclick = handleAddVar;
    document.body.append(btn);
  };
  addBtn();
```
### 本地运行查看效果
1. npm i
2. npm run serve
3. click btn
