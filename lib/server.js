/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO 1 minute caching (query=>key)
 */

const path = require('path');

const vision = require('vision');
const inert = require('inert');
const HapiAuthJwt2 = require('hapi-auth-jwt2');
const HapiReactViews = require('hapi-react-views');
const HapiError = require('hapi-error');

const Hapi = require('hapi');

const apiRouter = require('./router/api-router');
const baseRouter = require('./router/ui-router');
const User = require('./model/User');

// For JSX transpiling
require('babel-register')({ presets: ['react', 'es2015'] });
require('babel-polyfill');

const server = new Hapi.Server();
const errorConfig = {
  templateName: 'error',
  statusCodes: {
    401: {
      redirect: '/login',
    },
  },
};

server.connection({ port: process.env.PORT || 8080 });
server.register([
  vision,
  inert,
  HapiAuthJwt2,
  { register: HapiError, options: errorConfig },
], (err) => {
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
    engines: {
      jsx: HapiReactViews,
    },
    relativeTo: __dirname,
    path: 'views',
    compileOptions: {
      layoutPath: path.join(__dirname, 'views'),
      layout: 'layout',
    },
  });

  // for static assets
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: 'public',
        listing: false,
      },
    },
  });
  server.route({
    method: 'GET',
    path: '/assets/bootstrap/{param*}',
    handler: {
      directory: {
        path: 'node_modules/bootstrap/dist',
        listing: false,
      },
    },
  });
  server.route(apiRouter);
  server.route(baseRouter);

  // Start the server
  server.start((serverErr) => {
    if (serverErr) {
      throw serverErr;
    }
    console.log('Server running at:', server.info.uri);
  });
});

