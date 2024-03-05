<!--
 * @Editor: chenqy
 * @Description: 
 * @Date: 2023-04-07 18:16:32
 * @LastEditors: Chenqy
 * @LastEditTime: 2024-03-05 09:20:26
-->
# monaco-editor-block
monaco-editor-block 为monaco-editor的块状元素扩充插件
### 使用步骤
1. 导入monaco-editor-block.js
2. 创建monaco实列
3. 初始化monaco-editor-block
4. 如需要创建块状元素调用monaco-editor-block的addCode方法
### 使用代码
``` javascript
  import { MonacoBlock } from "./dist/monacoBlock";
  import * as monaco from "monaco-editor";

  let monacoEditor = monaco.editor.create(document.querySelector(".root"), {
    value: "test",
    automaticLayout: true, 
    theme: "vs",
    unicodeHighlight: {
      invisibleCharacters: false, // 隐藏零宽字符特殊显示
    },
  });
  const monacoBlock = new MonacoBlock(monacoEditor, monaco);
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
