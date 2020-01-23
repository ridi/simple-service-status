/**
 * Hapi middleware for handling errors
 *
 * @since 1.0.0
 */

const SSSError = require('../common/Error');

const defaultOptions = Object.freeze({
  apiPrefix: '/api',
  errorView: 'error',
});

const generateErrorResponseBody = request => ({
  code: request.response.errorCode,
  message: request.response.message,
  success: false,
});

/* eslint no-param-reassign: ["error", { "props": false }] */
const onSuccess = (request, h, options) => {
  const { path, response } = request;
  if (path.includes(options.apiPrefix)) {
    const responseObj = response.source || {};
    responseObj.success = true;
    response.source = responseObj;
  }
  return null;
};

const onApiError = (request, h, statusCode) => {
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 400:
      if (request.response.data && request.response.data.name === 'ValidationError') {
        responseBody.code = SSSError.Types.BAD_REQUEST_INVALID.code;
        responseBody.message = SSSError.Types.BAD_REQUEST_INVALID.message({ message: request.response.message });
      }
      break;
    case 401:
    case 403:
      h.unstate('token');
      break;
    case 500:
      if (!responseBody.code) {
        responseBody.code = SSSError.Types.SERVER.code;
      }
      break;
    default:
  }
  return h.response(responseBody).code(statusCode).takeover();
};

const onUIError = (request, h, options, statusCode) => {
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 401:
    case 403:
      return h.redirect(`/login?redirect=${request.path || '/'}`).unstate('token');
    case 404:
    case 500:
      responseBody.statusCode = statusCode;
      return h.view(options.errorView, responseBody).code(statusCode);
    default:
      return null;
  }
};

const onError = (request, h, options, statusCode) => {
  const isApi = request.path.includes(options.apiPrefix);
  return isApi ? onApiError(request, h, statusCode) : onUIError(request, h, options, statusCode);
};

const register = (server, opts) => {
  const options = Object.assign({}, defaultOptions, opts);
  server.ext('onPreResponse', (request, h) => {
    const statusCode = request.response.statusCode || request.response.output.statusCode;
    const response = (statusCode === 200) ? onSuccess(request, h, options) : onError(request, h, options, statusCode);
    return response || h.continue;
  });
};

module.exports = {
  register,
  name: 'hapi-error-handler',
  version: '1.0.0',
};
