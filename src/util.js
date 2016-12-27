/**
 * Util functions
 *
 * @since 1.0.0
 */

const JWT = require('jsonwebtoken');

/**
 * Set pads at the front of the string.
 * @param str
 * @param padStr
 * @param num
 * @returns {*}
 */
exports.padStart = (str, padStr, num) => {
  if (padStr.length >= num) {
    return padStr;
  }
  return (padStr.repeat(num) + str).slice(-num);
};

/**
 * Generate auth token
 * @param account
 * @param ttl time to live by second
 * @returns {*}
 */
exports.generateToken = (account, ttl) => JWT.sign({
  id: account.id,
  username: account.username,
  role: account.role,
  exp: (new Date().getTime() / 1000) + (ttl || 24 * 60 * 60),
}, process.env.SECRET_KEY || 'secretkey');

/**
 * Extract current logged-in user information from request
 * If there's no lagged-in user, it will return false.
 * @param request
 * @returns {*}
 */
exports.getCurrentUser = (request) => {
  if (request.auth.isAuthenticated) {
    return request.auth.credentials;
  }
  return false;
};
