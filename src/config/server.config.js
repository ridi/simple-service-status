/**
 * Configurations for server
 *
 * @author kyungmi.k@ridi.com
 * @since 1.0.0
 */

const path = require('path');

const API_CONTEXT = 'api';
const API_VERSION = 1;

const DEV_SERVER_PORT = 8080;
const WEBPACK_SERVER_PORT = 3000;

const configs = {
  defaults: {
    host: 'localhost',
    port: DEV_SERVER_PORT,
    mongoDBUrl: 'mongodb://localhost',
  },
  auth: {
    secretKey: 'secretKey',
    tokenTTL: 24 * 60 * 60 * 1000,    // in millisecond
  },
  directory: {
    component: 'component',
    public: 'public',
  },
  url: {
    publicPrefix: '/public/assets',
    apiPrefix: `/${API_CONTEXT}/v${API_VERSION}`,
    statusApiPrefix: `/${API_CONTEXT}/v${API_VERSION}/status`,
    loginUI: '/login',
  },
  build: {
    entry: './src/client.js',
    webpackEntry: `webpack-hot-middleware/client?path=http://0.0.0.0:${WEBPACK_SERVER_PORT}/__webpack_hmr&timeout=10000`,
    webpackServerPort: WEBPACK_SERVER_PORT,
    webpackAssetsFileName: 'webpack-assets.json',
    webpackAssetsDirName: '',
    outputDirectoryName: 'public',
    outputJsFileName: 'client.bundle.js',
    outputCssFileName: 'client.bundle.css',
    publicUrlPrefix: '/public/build',
    hotUpdateChunkFileName: 'hot-update.js',
    hotUpdateMainFileName: 'hot-update.json',
  },
};

module.exports = configs;
