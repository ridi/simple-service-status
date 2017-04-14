/**
 * Entry point
 */
import { resolve } from 'path';
import logger from 'winston';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import H2O2 from 'h2o2';
import server from './server';
import webpackConfig from '../webpack.config';
import config from './config/server.config';

if (process.env.NODE_ENV === 'development') {
  // IN DEVELOPMENT

  new WebpackDevServer(Webpack(webpackConfig), {
    hot: true,
    contentBase: resolve(__dirname, `${config.build.clientOutputDirectoryName}`),
    publicPath: `http://${config.defaults.host}:${config.build.webpackServerPort}${config.url.publicPrefix}/`,
    headers: { 'Access-Control-Allow-Origin': '*' },
  }).listen(config.build.webpackServerPort, config.defaults.host, (err) => {
    if (err) {
      logger.error(err);
      return;
    }
    logger.log(`Webpack dev server listening at ${config.defaults.host}:${config.build.webpackServerPort}`);

    server.addPlugin({ register: H2O2 });

    server.start([
      {
        method: 'GET',
        path: `${config.url.publicPrefix}/{path*}`,
        handler: {
          proxy: { host: config.defaults.host, port: config.build.webpackServerPort, passThrough: true },
        },
        config: { auth: false },
      },
    ]);
  });
} else {
  // IN PRODUCTION
  server.start([
    {
      method: 'GET',
      path: `${config.url.publicPrefix}/{path*}`,
      handler: {
        directory: { path: config.directory.public, listing: true },
      },
      config: { auth: false },
    }
  ]);
}
