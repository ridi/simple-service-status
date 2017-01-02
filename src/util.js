/**
 * Util functions
 *
 * @since 1.0.0
 */

const JWT = require('jsonwebtoken');
const config = require('./config/server.config');

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
 * @param ttl time to live in millisecond
 * @returns {*}
 */
exports.generateToken = (account, ttl) => JWT.sign({
  id: account.id,
  username: account.username,
  role: account.role,
  exp: new Date().getTime() + (ttl || config.auth.tokenTTL),
}, process.env.SECRET_KEY || config.auth.secretKey);

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
