const babelPresetReactApp = require("babel-preset-react-app");

if (process.env.CODE_COVERAGE === "true") {
  babelPresetReactApp.plugins.push(require.resolve("babel-plugin-istanbul"));
}

module.exports = babelPresetReactApp;
