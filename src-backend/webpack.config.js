// source local.env.sh ; npx webpack --mode production --config src-backend/webpack.config.js

const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = [
  {
    context: __dirname,
    target: "node",
    externals: [nodeExternals()],
    entry: "./backend-api-aws-lambda-function.js",
    output: {
      libraryTarget: "commonjs2",
      path: path.join(process.cwd(), process.env.BACKEND_BUILD_DIR),
      filename: process.env.AWS_LAMBDA_HANDLER_BUILD_FILENAME,
    },
    plugins: [new ZipPlugin()],
  },
];
