const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, args) => {
  const isProduction = args.mode === "production";
  const entry = isProduction ? env.entry : "index.js";
  let option = {
    entry: path.resolve(__dirname, entry),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "monacoBlock.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },
  };
  if (isProduction) {
    option.plugins = [new CleanWebpackPlugin()];
    option.optimization = {
      usedExports: false,
    };
    option.output.library = {
      name: 'MonacoBlock', // 指定库名称
      type: 'umd', // 输出的模块化格式， umd 表示允许模块通过 CommonJS、AMD 或作为全局变量使用。
      export: 'default' // 指定将入口文件的默认导出作为库暴露。
    };
    option.output.globalObject = "window"
  } else {
    option.plugins = [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
      }),
      new MonacoWebpackPlugin(),
    ];
    option.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
    });
    option.devServer = {
      compress: true,
      port: 8888,
      open: true,
    };
  }
  return option;
};
