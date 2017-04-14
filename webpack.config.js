/**
 * Build configuration for client source bundling using Webpack
 */
const { resolve } = require('path');
const webpack = require('webpack');

const config = require('./src/config/server.config');

const commonConfig = {
  context: resolve(__dirname, config.build.sourceDirectory),
  devtool: 'source-map',
  entry: config.build.clientEntry,
  output: {
    filename: config.build.clientOutputJsFileName,
    path: resolve(__dirname, config.build.clientOutputDirectoryName),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.jsx?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /(\.scss|\.css)$/,
        use: ['style-loader', 'css-loader?modules?sourceMap', 'sass-loader'],
      },
    ],
  },
  node: {
    dns: 'mock',
    net: 'mock',
  },
};

const webpackConfig = Object.assign({}, commonConfig);

if (process.env.NODE_ENV === 'development') {
  webpackConfig.devtool = 'cheap-module-eval-source-map';
  webpackConfig.output.publicPath = `${config.url.publicPrefix}/`;

  webpackConfig.entry = [
    'react-hot-loader/patch',
    // activate HMR for React

    `webpack-dev-server/client?http://0.0.0.0:${config.build.webpackServerPort}/`,
    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint

    'webpack/hot/only-dev-server',
    // bundle the client for hot reloading
    // only- means to only hot reload for successful updates

    config.build.clientEntry,
    // the entry point of our app
  ];
  webpackConfig.plugins =  [
    new webpack.HotModuleReplacementPlugin(),
    // enable HMR globally
    new webpack.NamedModulesPlugin(),
    // prints more readable module names in the browser console on HMR updates
  ];
}

module.exports = webpackConfig;
