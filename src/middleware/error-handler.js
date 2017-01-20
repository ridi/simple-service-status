/**
 * Hapi middleware for handling errors
 *
 * @since 1.0.0
 */

const NotifierError = require('../common/Error');

const defaultOptions = Object.freeze({
  apiPrefix: '/api',
  errorView: 'error',
});

const generateErrorResponseBody = request => ({
  code: request.response.errorCode,
  message: request.response.message,
  success: false,
});

const getStatusCode = request => request.response.statusCode || request.response.output.statusCode;

/* eslint no-param-reassign: ["error", { "props": false }] */
const onSuccess = (request, reply, options) => {
  const path = request.path;
  if (path.includes(options.apiPrefix)) {
    const responseObj = request.response.source || {};
    responseObj.success = true;
    request.response.source = responseObj;
  }
  return null;
};

const onApiError = (request, reply) => {
  const statusCode = getStatusCode(request);
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 400:
      if (request.response.data && request.response.data.name === 'ValidationError') {
        responseBody.code = NotifierError.Types.BAD_REQUEST_INVALID.code;
        responseBody.message = NotifierError.Types.BAD_REQUEST_INVALID.message({ message: request.response.message });
      }
      return reply(responseBody).code(statusCode);
    case 401:
    case 403:
      return reply(responseBody).unstate('token').code(statusCode);
    case 500:
      if (!responseBody.code) {
        responseBody.code = NotifierError.Types.SERVER.code;
      }
      return reply(responseBody).code(statusCode);
    default:
      return reply(responseBody).code(statusCode);
  }
};

const onUIError = (request, reply, options) => {
  const statusCode = getStatusCode(request);
  const responseBody = generateErrorResponseBody(request);
  switch (statusCode) {
    case 401:
    case 403:
      return reply.redirect(`/login?redirect=${request.path || '/'}`).unstate('token');
    case 404:
    case 500:
      responseBody.statusCode = statusCode;
      return reply.view(options.errorView, responseBody).code(statusCode);
    default:
      return null;
  }
};

const onError = (request, reply, options) => {
  const isApi = request.path.includes(options.apiPrefix);
  return isApi
    ? onApiError(request, reply)
    : onUIError(request, reply, options);
};

const register = (server, opts, next) => {
  const options = Object.assign({}, defaultOptions, opts);
  server.ext('onPreResponse', (request, reply) => {
    const statusCode = request.response.statusCode || request.response.output.statusCode;
    const response = (statusCode === 200)
      ? onSuccess(request, reply, options)
      : onError(request, reply, options);

    if (response) {
      return response;
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
