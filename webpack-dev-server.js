/**
 * Entry point for development
 */

// Load local environments
require('node-env-file')(`${__dirname}/.env`);

const appServer = require('./src/server');
const express = require('express');
const Webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.dev.config');
const H2O2 = require('h2o2');
const logger = require('winston');

const webpackServer = express();

const compiler = new Webpack(webpackConfig);

const config = require('./src/config/server.config');

webpackServer.use(webpackDevMiddleware(compiler, {
  publicPath: `http://${config.defaults.host}:${config.defaults.port}${config.build.publicUrlPrefix}/`,
  noInfo: false,
  quite: false,
  stats: {
    colors: true,
  },
}));

webpackServer.use(webpackHotMiddleware(compiler));

webpackServer.listen(config.build.webpackServerPort, (err) => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.log(`Webpack dev server listening at ${config.defaults.host}:${config.build.webpackServerPort}`);

  appServer.addPlugin({ register: H2O2 });

  appServer.start([
    {
      method: 'GET',
      path: `${config.build.publicUrlPrefix}/{path*}`,
      handler: {
        proxy: {
          host: config.defaults.host,
          port: config.build.webpackServerPort,
          passThrough: true,
        },
      },
      config: {
        auth: false,
      },
    },
  ]);
});
