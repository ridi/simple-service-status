/**
 * Entry point for development
 */

// Load local environments
require('node-env-file')(`${__dirname}/.env`);

const path = require('path');
const appServer = require('./src/server');

const express = require('express');

const Webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const AssetsWebpackPlugin = require('assets-webpack-plugin');

const webpackConfig = require('./webpack.dev.config');

const H2O2 = require('h2o2');

const webpackServer = express();

const compiler = new Webpack(webpackConfig);

webpackServer.use(webpackDevMiddleware(compiler, {
  publicPath: 'http://localhost:8080/public/build',
  noInfo: false,
  quite: false,
  stats: {
    colors: true,
  },
}));

webpackServer.use(webpackHotMiddleware(compiler));

webpackServer.listen(3000, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Webpack dev server listening at localhost:3000');

  appServer.addPlugin({ register: H2O2 });

  appServer.start([
    { method: 'GET', path: '/public/build/{path*}', handler: { proxy: { host: 'localhost', port: 3000, passThrough: true } } },
  ]);
});
