import MonacoBlock from "./monacoBlock/monacoBlock";
import * as monaco from "monaco-editor";
let oldValue = "";
let monacoBlock = null;
let monacoEditor = null;
const init = () => {
  monacoEditor = monaco.editor.create(document.querySelector(".root"), {
    language: "javascript",
    value: oldValue, // 编辑器初始显示文字
    automaticLayout: true, // 自动布局
    theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
    unicodeHighlight: {
      invisibleCharacters: false, // 隐藏零宽字符特殊显示
    },
  });
  // console.log(monacoEditor)
  monacoBlock = new MonacoBlock(monacoEditor, {
    blockClassName: "editor-custom-block",
    cancelJsDiagnostics: true, // 取消 t/js 代码诊断
    cancelJsCompletionItems: true, //取消 t/js 代码提示
    hideZeroCode: true, // 隐藏零宽字符特殊样式

    deleteBlockCode: (codes) => {
      console.log("deleteBlockCode", codes);
    },
    customBlockStyle: (blockWord) => {
      console.log(`customBlockStyle:`, blockWord);
      return {
        inlineClassName:
          blockWord === "块状代码一"
            ? "editor-custom-block"
            : "editor-custom-blue",
        stickiness:
          monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      };
    },
  });
};
init();

window.monaco = monaco;

const handleAddVar = (code) => {
  monacoBlock.addCode(code);
};

const addBtn = () => {
  let btn = document.createElement("button");
  btn.innerText = "添加块状代码(样式一)";
  btn.onclick = () => {
    handleAddVar(`块状代码一`);
  };

  let btn1 = document.createElement("button");
  btn1.innerText = "添加块状代码(样式二)";
  btn1.onclick = () => {
    handleAddVar(`块状代码二`);
  };

  let btn2 = document.createElement("button");
  btn2.innerText = "添加普通代码";
  btn2.onclick = () => {
    handleAddVar({
      code: "普通代码",
      isNormal: true,
    });
  };

  let btn3 = document.createElement("button");
  btn3.innerText = "一次性添加多个块状代码";
  btn3.onclick = () => {
    handleAddVar({
      code: "\n{@阳光呐@}明媚，而我在{@垃圾堆@}\n怎么可能你真的会来找我",
      isNormal: true,
    });
  };

  let btn4 = document.createElement("button");
  btn4.innerText = "获取值";
  btn4.onclick = () => {
    const { value, blockValue } = monacoBlock.getCode();
    console.log(`获取值：${value}`);
    console.log(`带块状信息的值：${blockValue}`);
    oldValue = blockValue;
  };

  let btn5 = document.createElement("button");
  btn5.innerText = "复现获取后的值";
  btn5.onclick = () => {
    monacoBlock.destroy();
    setTimeout(() => {
      init();
    }, 1000);
  };

  document.body.append(btn);
  document.body.append(btn1);
  document.body.append(btn2);
  document.body.append(btn3);
  document.body.append(btn4);
  document.body.append(btn5);
};
addBtn();
