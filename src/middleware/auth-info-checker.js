/**
 * Hapi middleware for checking authentication info
 *
 * @since 1.0.0
 */

const URL_CHANGE_PASSWORD = 'change-password';

const defaultOptions = Object.freeze({
  excludeUrlPatterns: [],
});

const register = (server, opts, next) => {
  const options = Object.assign({}, defaultOptions, opts);
  options.excludeUrlPatterns.push(new RegExp(`/${URL_CHANGE_PASSWORD}`));
  server.ext('onPostAuth', (request, reply) => {
    const isApi = request.path.includes(options.apiPrefix);
    const isExcludedUrl = options.excludeUrlPatterns.some(pattern => pattern.test(request.path));
    const isTemporaryUser = request.auth && request.auth.credentials && request.auth.credentials.isTemporary;
    if (!isApi && !isExcludedUrl && isTemporaryUser) {
      return reply.redirect(`/${URL_CHANGE_PASSWORD}?redirect=${request.path || '/'}`);
    }
    return reply.continue();
  });
  next();
};

register.attributes = {
  name: 'hapi-auth-info-checker',
  version: '1.0.0',
};

module.exports = register;
