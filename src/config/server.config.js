/**
 * Configurations for server
 *
 * @since 1.0.0
 */

const API_CONTEXT = 'api';
const API_VERSION = 1;

const DEV_SERVER_PORT = 8080;
const WEBPACK_SERVER_PORT = 3000;

const configs = {
  defaults: {
    host: '0.0.0.0',
    port: DEV_SERVER_PORT,
    mongoDBUrl: 'mongodb://localhost',
    mongoDBName: 'db',
  },
  auth: {
    secretKey: 'secretKey',
    tokenTTL: 24 * 60 * 60 * 1000, // in millisecond
  },
  directory: {
    component: 'component',
    public: 'dist/public/',
  },
  url: {
    publicPrefix: '/public/assets',
    apiPrefix: `/${API_CONTEXT}/v${API_VERSION}`,
    statusApiPrefix: `/${API_CONTEXT}/v${API_VERSION}/status`,
    statusTypeApiPrefix: `/${API_CONTEXT}/v${API_VERSION}/status-types`,
    deviceTypeApiPrefix: `/${API_CONTEXT}/v${API_VERSION}/device-types`,
    loginUI: '/login',
  },
  build: {
    sourceDirectory: 'src',
    clientEntry: './client.js',
    serverEntry: 'index.js',
    webpackServerPort: WEBPACK_SERVER_PORT,
    clientOutputDirectoryName: 'dist/public',
    serverOutputDirectoryName: 'dist',
    clientOutputJsFileName: 'client.bundle.js',
  },
  initialData: {
    users: [
      {
        username: 'admin',
        password: 'admin',
        role: 'WRITE',
        isTemporary: true,
      },
    ],
    deviceTypes: [
      { label: 'Android', value: 'android' },
      { label: 'iOS', value: 'ios' },
      { label: 'PAPER', value: 'paper' },
      { label: 'PAPER Lite', value: 'paper_lite' },
      { label: 'PAPER PRO', value: 'paper_pro' },
      { label: 'PC/Mac', value: 'qt' },
    ],
    statusTypes: [
      { label: '서버 문제', value: 'serviceFailure' },
      { label: '정기 점검', value: 'routineInspection' },
    ],
  },
};

module.exports = configs;
