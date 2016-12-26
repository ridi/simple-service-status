const path = require('path');
const Webpack = require('webpack');
const AssetsWebpackPlugin = require('assets-webpack-plugin');

const WEBPACK_HOT_ENTRY = 'webpack-hot-middleware/client?path=http://0.0.0.0:3000/__webpack_hmr&timeout=10000';

module.exports = {
  entry: {
    app: [
      './lib/client.js',
      WEBPACK_HOT_ENTRY,
    ],
  },
  devtool: 'cheap-module-eval-source-map',
  output: {
    path: path.join(__dirname, '/public'),
    filename: 'client.bundle.js',
    publicPath: '/public/build/',
  },
  plugins: [
    new Webpack.optimize.OccurenceOrderPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new AssetsWebpackPlugin({
      filename: 'webpack-assets.json',
      path: './',
      prettyPrint: true,
    }),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoErrorsPlugin(),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      loaders: ['react-hot', 'babel-loader'],
      exclude: /node_modules/,
    }],
  },
};
