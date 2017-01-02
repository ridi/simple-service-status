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
const HapiError = require('hapi-error');

const apiRouter = require('./router/api-router');
const baseRouter = require('./router/ui-router');
const User = require('./repository/User');

const config = require('./config/server.config');

// For JSX transpiling
require('babel-register');
require('babel-polyfill');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || config.defaults.port });

// TODO request-error event를 받는 방식으로 변경하기
const errorConfig = {
  templateName: 'Error',
  statusCodes: {
    401: { redirect: config.url.loginUI },
  },
};

const plugins = [
  { register: vision },
  { register: inert },
  { register: HapiAuthJwt2 },
  { register: HapiError, options: errorConfig },
];

exports.addPlugin = (pluginSetting) => {
  plugins.push(pluginSetting);
};

exports.start = (extraRoutes) => {
  server.register(plugins, (err) => {
    if (err) {
      throw err;
    }

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.SECRET_KEY || config.auth.secretKey,
      validateFunc(decoded, request, callback) {
        if (decoded.exp < new Date().getTime()) {
          // expired token
          return callback(null, false);
        }
        User.find(decoded.username)
          .then(account => callback(null, !!account))
          .catch(() => callback(null, false));
      },
      verifyOptions: { algorithms: ['HS256'] },
    });

    server.auth.default('jwt');

    server.views({
      engines: { jsx: HapiReactViews },
      relativeTo: __dirname,
      path: config.directory.component,
    });

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

    // Start the server
    server.start((serverErr) => {
      if (serverErr) {
        throw serverErr;
      }
      console.log('Server running at:', server.info.uri);
    });
  });
};
