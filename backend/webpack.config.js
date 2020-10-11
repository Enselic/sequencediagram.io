// webpack --config backend/webpack.config.js

const path = require("path");
const nodeExternals = require("webpack-node-externals");

const commonConf = {
  context: __dirname,
  target: "node",
  externals: [nodeExternals()],
};
module.exports = [
  Object.assign({}, commonConf, {
    entry: "./api-server-localhost.js",
    output: {
      path: path.join(process.cwd(), process.env.BACKEND_BUILD_DIR),
      filename: process.env.BACKEND_BUILD_FILENAME,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: require.resolve("babel-loader"),
          options: {
            compact: true,
          },
        },
      ],
    },
  }),
  Object.assign({}, commonConf, {
    entry: "./aws-lambda-handler.js",
    output: {
      libraryTarget: "commonjs2",
      path: path.join(process.cwd(), process.env.BACKEND_BUILD_DIR),
      filename: process.env.AWS_LAMBDA_HANDLER_BUILD_FILENAME,
    },
  }),
];
