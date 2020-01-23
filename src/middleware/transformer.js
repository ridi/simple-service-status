/**
 * Hapi middleware for transforming contents of request and response
 *
 * @since 1.0.0
 */

const util = require('../common/common-util');

const defaultOptions = Object.freeze({
  apiPrefix: '/api',
});

const register = (server, opts) => {
  const options = Object.assign({}, defaultOptions, opts);
  /* eslint no-param-reassign: ["error", { "props": false }] */
  server.ext('onPostAuth', (request, h) => {
    if (request.query) {
      request.query = util.snake2camelObject(request.query);
    }
    if (request.payload) {
      request.payload = util.snake2camelObject(request.payload);
    }
    return h.continue;
  });

  server.ext('onPreResponse', (request, h) => {
    if (request.path.includes(options.apiPrefix)) {
      return h.response(util.camel2snakeObject(request.response.source));
    }
    return h.continue;
  });
};

module.exports = {
  register,
  name: 'hapi-transform',
  version: '1.0.0',
};
