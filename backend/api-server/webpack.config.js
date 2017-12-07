// webpack --config backend/api-server/webpack.config.js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  context: __dirname,
  target: 'node',
  entry: './aws-lambda-handler.js',
  externals: [
    function(context, request, callback) {
      if ('aws-sdk' === request) {
        return callback(null, 'commonjs aws-sdk');
      }
      callback();
    },
  ],
  plugins: [new UglifyJsPlugin()],
  output: {
    path: __dirname + '/../../build',
    filename: './aws-lambda-handler.min.js',
  },
};
