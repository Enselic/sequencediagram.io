// webpack --config backend/webpack.config.js

const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  target: 'node',
  entry: './api-server-localhost.js',
  externals: [nodeExternals()],
  output: {
    path: path.join(process.cwd(), process.env.BACKEND_BUILD_DIR),
    filename: process.env.BACKEND_BUILD_FILENAME,
  },
};
