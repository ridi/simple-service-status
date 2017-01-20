/**
 * Server main
 *
 * @since 1.0.0
 *
 */

const Hapi = require('hapi');

const vision = require('vision');
const inert = require('inert');
const HapiAuthJwt2 = require('hapi-auth-jwt2');
const HapiReactViews = require('hapi-react-views');
const HapiErrorHandler = require('./middleware/error-handler');
const HapiTransformer = require('./middleware/transformer');
const HapiAuthChecker = require('./middleware/auth-info-checker');

const apiRouter = require('./router/api-router');
const baseRouter = require('./router/ui-router');
const User = require('./repository/User');
const DeviceType = require('./repository/DeviceType');
const StatusType = require('./repository/StatusType');

const config = require('./config/server.config');
const NotifierError = require('./common/Error');

const util = require('./common/common-util');
const logger = require('winston');

// For JSX transpiling
require('babel-register');
require('babel-polyfill');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || config.defaults.port });

server.state('token', {
  ttl: config.auth.tokenTTL,
  isSecure: process.env.USE_HTTPS && process.env.USE_HTTPS === 'true',
  path: '/',
});

const plugins = [
  { register: vision },
  { register: inert },
  { register: HapiAuthJwt2 },
  { register: HapiErrorHandler, options: { apiPrefix: config.url.apiPrefix, errorView: 'Error' } },
  { register: HapiAuthChecker,
    options: {
      excludeUrlPatterns: [new RegExp(`^${config.url.apiPrefix}`), new RegExp('^/logout')],
    },
  },
  { register: HapiTransformer, options: { apiPrefix: config.url.apiPrefix } },
];

const _setAuthStrategy = () => {
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.SECRET_KEY || config.auth.secretKey,
    validateFunc: (decoded, request, callback) => {
      // Check token IP address
      const clientIP = util.getClientIp(request);
      if (clientIP !== decoded.ip) {
        logger.warn(`[Auth] This client IP is matched with token info.: decoded.ip => ${decoded.ip}, client IP => ${clientIP}`);
        return callback(new NotifierError(NotifierError.Types.AUTH_TOKEN_INVALID), false);
      }
      // Check token expiration
      if (decoded.exp < new Date().getTime()) {
        logger.warn(`[Auth] This auth token is expired.: decoded.exp => ${decoded.exp}, now => ${new Date().getTime()}`);
        return callback(new NotifierError(NotifierError.Types.AUTH_TOKEN_EXPIRED), false);
      }
      return User.find({ username: decoded.username })
        .then((accounts) => {
          if (!accounts || accounts.length === 0) {
            logger.warn(`[Auth] This account is not exist.: ${decoded.username}`);
            return callback(new NotifierError(NotifierError.Types.AUTH_USER_NOT_EXIST, { username: decoded.username }), false);
          }
          return callback(null, true, accounts[0]);
        })
        .catch((e) => {
          logger.error(`[DB] DB error occurred: ${e.message}`);
          callback(new NotifierError(NotifierError.Types.DB), false);
        });
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt');
};

const _setViewEngine = () => {
  server.views({
    engines: { jsx: HapiReactViews },
    relativeTo: __dirname,
    path: config.directory.component,
  });
};

const _setRoutes = (extraRoutes) => {
  // for static assets
  server.route({
    method: 'GET',
    path: `${config.url.publicPrefix}/{param*}`,
    handler: {
      directory: {
        path: config.directory.public,
        listing: false,
      },
    },
    config: {
      auth: false,
    },
  });
  server.route(apiRouter);
  server.route(baseRouter);
  if (extraRoutes) {
    server.route(extraRoutes);
  }
};

const _setInitalData = () => {
  let promises = [];
  return Promise.all([User.count(), DeviceType.count(), StatusType.count()])
    .then(([userCount, deviceTypeCount, statusTypeCount]) => {
      if (userCount === 0) {
        promises = promises.concat(config.initialData.users.map(user => User.add(user)));
      }
      if (deviceTypeCount === 0) {
        promises = promises.concat(config.initialData.deviceTypes.map(dt => DeviceType.add(dt)));
      }
      if (statusTypeCount === 0) {
        promises = promises.concat(config.initialData.statusTypes.map(user => StatusType.add(user)));
      }
    })
    .then(() => Promise.all(promises))
    .then(result => logger.log('[SET INITIAL DATA] success: ', result));
};

exports.addPlugin = (pluginSetting) => {
  plugins.push(pluginSetting);
};

exports.start = extraRoutes => server.register(plugins)
    .then(() => {
      _setAuthStrategy();
      _setViewEngine();
      _setRoutes(extraRoutes);
    })
    .then(() => _setInitalData())
    .then(() => server.start())
    .then(() => {
      logger.log('Server running at:', server.info.uri);
      return server;
    })
    .catch((error) => { throw error; });
