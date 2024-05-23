# monaco-editor-block

monaco-editor-block 为 monaco-editor 的块状元素扩充插件

## 使用步骤

1. 导入 monaco-editor-block.js
2. 创建 monaco 实列
3. 初始化 monaco-editor-block
4. 如需要创建块状元素调用 monaco-editor-block 的 addCode 方法

## API
### 实例化参数
let monacoEditor = new MonacoBlock(editor, options)

1. editor[monaco 实例]
2. options[Object]
   1. options.blockClassName[String] 块状元素的类名
   2. options.cancelJsDiagnostics[Boolean] 取消 t/js 代码诊断
   3. options.cancelJsCompletionItems[Boolean] 取消 t/js 代码提示
   4. options.hideZeroCode[Boolean] 隐藏零宽字符特殊样式
   5. options.deleteBlockCode[Function] 删除块状提供的回调
      1. 参数为添加块状元素内容。 ps: 若添加参数为对象此参数就为对象, 否则为字符串
   6. options.customBlockStyle[Function] 自定义块状样式回调
      1. 同上

### 方法
#### 【addcode】 添加代码
monacoEditor.addcode(content, type)

1. content[String|Object]
  1. 为字符串时,该值就为添加的块状元素内容
  2. 为对象时
    1. content.code[String] 该值就为添加的块状元素内容
    2. content.isNormal[Boolean] 添加方式  ps: 为了方便一次性添加多个块状代码, 在content.isNormal 为 true 时, 字符串中有{@ @}包裹的内容也会被解析成块状元素
      1. true：内容为块状元素
      2. false：内容为普通文本
2. type[String] 添加位置
   1. focus 焦点处添加代码
   2. end 末尾添加代码
#### 【getCode】 获取编辑器内容
const {value, blockValue} = monacoEditor.getCode()
1. value[String] 不带块状信息的字符串
2. blockValue[String] 带块状信息的字符串
#### 【clear】 清空编辑器
monacoEditor.clear()
#### 【destroy】 销毁编辑器
monacoEditor.destroy()
#### 【getAllBlockMessage】 获取所有块状信息
monacoEditor.getAllBlockMessage()
## 使用代码

```javascript
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
  const monacoBlock = new MonacoBlock(monacoEditor, {
    cancelJsDiagnostics: true, // 取消 t/js 代码诊断})
    }
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
