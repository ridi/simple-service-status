/**
 * Hapi middleware for handling errors
 *
 * @since 1.0.0
 */

const RidiError = require('../common/Error');

const defaultOptions = Object.freeze({
  apiPrefix: '/api',
  errorView: 'error',
});

const register = (server, opts, next) => {
  const options = Object.assign({}, defaultOptions, opts);

  // options.apiPrefix
  server.on('request-error', () => {
    // TODO
    console.error(arguments);
  });

  server.ext('onPreResponse', (request, reply) => {
    const path = request.path;
    const statusCode = request.response.statusCode || request.response.output.statusCode;

    if (statusCode !== 200) {
      const responseObj = { code: request.response.errorCode, message: request.response.message };
      if (path.includes(options.apiPrefix)) {
        // API
        switch (statusCode) {
          case 400:
            if (request.response.data.name === 'ValidationError') {
              return reply({
                code: RidiError.Types.BAD_REQUEST_INVALID.code,
                message: RidiError.Types.BAD_REQUEST_INVALID.message({ message: request.response.message }),
              });
            } else {
              return reply(responseObj).code(statusCode);
            }
          case 401:
          case 403:
            return reply(responseObj).unstate('token').code(statusCode);
          case 500:
            if (!responseObj.code) {
              responseObj.code = RidiError.Types.SERVER.code;
            }
            return reply(responseObj).code(statusCode);
          default:
            return reply(responseObj).code(statusCode);
        }
      } else {
        // UI
        switch (statusCode) {
          case 401:
          case 403:
            return reply.redirect(`/login?redirect=${request.path || '/'}`).unstate('token');
          case 500:
            return reply.view(options.errorView, responseObj).code(statusCode);
          default:
            break;
        }
      }
    }
    return reply.continue();
  });

  next();
};

register.attributes = {
  name: 'hapi-error-handler',
  version: '1.0.0',
};

module.exports = register;
