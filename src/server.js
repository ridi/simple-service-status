/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO 1 minute caching (query=>key)
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

// For JSX transpiling
require('babel-register');
require('babel-polyfill');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8080 });

const errorConfig = {
  templateName: 'Error',
  statusCodes: {
    401: { redirect: '/login' },
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
      key: process.env.SECRET_KEY || 'secretkey',
      validateFunc(decoded, request, callback) {
        if (!User.find(decoded.username)) {
          return callback(null, false);
        }
        return callback(null, true);
      },
      verifyOptions: { algorithms: ['HS256'] },
    });

    server.auth.default('jwt');

    server.views({
      engines: { jsx: HapiReactViews },
      relativeTo: __dirname,
      path: 'component',
    });

    // for static assets
    server.route({
      method: 'GET',
      path: '/public/assets/{param*}',
      handler: {
        directory: {
          path: 'public',
          listing: false,
        },
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