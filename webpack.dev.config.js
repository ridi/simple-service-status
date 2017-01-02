const path = require('path');
const Webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./src/config/server.config').build;

module.exports = {
  entry: [
    config.entry,
    config.webpackEntry,
  ],
  devtool: 'cheap-module-eval-source-map',
  output: {
    path: path.join(__dirname, `/${config.outputDirectoryName}`),
    filename: config.outputJsFileName,
    publicPath: `${config.publicUrlPrefix}/`,
    hotUpdateChunkFilename: config.hotUpdateChunkFileName,
    hotUpdateMainFilename: config.hotUpdateMainFileName,
  },
  plugins: [
    new Webpack.optimize.OccurenceOrderPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new AssetsPlugin({
      filename: config.webpackAssetsFileName,
      path: `./${config.webpackAssetsDirName}`,
      prettyPrint: true,
    }),
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoErrorsPlugin(),
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
      }
    ],
  },
};
