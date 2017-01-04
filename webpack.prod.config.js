const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./src/config/server.config').build;

module.exports = {
  entry: config.entry,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, `/${config.outputDirectoryName}`),
    filename: config.outputJsFileName,
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new ExtractTextPlugin(config.outputCssFileName, { allChunks: true }),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: ['react-hot', 'babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass?sourceMap'),
      },
    ],
  },
  node: {
    dns: 'mock',
    net: 'mock',
  },
};
