/**
 * Auth util functions
 *
 * @since 1.0.0
 */

const JWT = require('jsonwebtoken');
const config = require('./../config/server.config.js');
const crypto = require('crypto');

/**
 * Generate auth token
 * @param {Object} account
 *    - {string} username - username for login
 *    - {string} role - user's role
 *    - {number} exp - timestamp indicates expiration date
 *    - {string} ip - client ip address
 * @param {number} ttl - time to live in millisecond
 * @returns {*}
 */
exports.generateToken = (account, ttl = config.auth.tokenTTL) => JWT.sign({
  username: account.username,
  role: account.role,
  exp: new Date().getTime() + ttl,
  ip: account.ip,
}, process.env.SECRET_KEY || config.auth.secretKey);

/**
 * Encrypt user password
 * @param {Object} credential - user inputs
 *    - {string} username
 *    - {string} password
 * @returns {string}
 */
exports.encryptPassword = (credential) => {
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY || config.auth.secretKey);
  hmac.update(`${credential.username}:${credential.password}`);
  return hmac.digest('hex');
};

/**
 * Compare password from database with password user input
 * The password on database is always generated from '[username]:[password]' string. That improves password's security.
 * @param {Object} credential - user inputs
 *    - {string} username
 *    - {string} password
 * @param {string} dbPassword - digested password string from database
 * @returns {boolean}
 */
exports.comparePassword = (credential, dbPassword) => exports.encryptPassword(credential) === dbPassword;
