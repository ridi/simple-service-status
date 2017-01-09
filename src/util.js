/**
 * Util functions
 *
 * @since 1.0.0
 */

const JWT = require('jsonwebtoken');
const moment = require('moment');
const config = require('./config/server.config');
const crypto = require('crypto');

/**
 * Set pads at the front of the string.
 * @param {string} str
 * @param {string} padStr
 * @param {number} num
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
 * @param {Object} account
 *    - {string} username - username for login
 *    - {string} role - user's role
 *    - {number} exp - timestamp indicates expiration date
 *    - {string} ip - client ip address
 * @param {number} ttl - time to live in millisecond
 * @returns {*}
 */
exports.generateToken = (account, ttl) => JWT.sign({
  username: account.username,
  role: account.role,
  exp: new Date().getTime() + (ttl || config.auth.tokenTTL),
  ip: account.ip,
}, process.env.SECRET_KEY || config.auth.secretKey);

/**
 * Compare password from database with password user input
 * The password on database is always generated from '[username]:[password]' string. That improves password's security.
 * @param {Object} credential - user inputs
 *    - {string} username
 *    - {string} password
 * @param {string} dbPassword - digested password string from database
 * @returns {boolean}
 */
exports.comparePassword = (credential, dbPassword) => {
  const hmac = crypto.createHmac('sha256', process.env.SECRET_KEY || config.auth.secretKey);
  hmac.update(`${credential.username}:${credential.password}`);
  return hmac.digest('hex') === dbPassword;
};

/**
 * Extract current logged-in user information from request
 * If there's no lagged-in user, it will return false.
 * @param request
 * @returns {boolean|Object}
 */
exports.getCurrentUser = (request) => {
  if (request.auth.isAuthenticated) {
    return request.auth.credentials;
  }
  return false;
};

/**
 * Get client IP address
 *
 * Will return 127.0.0.1 when testing locally
 * Useful when you need the user ip for geolocation or serving localized content
 *
 * @param request
 * @returns {string} ip
 */
exports.getClientIp = (request) => {
  // the ipAddress we return
  let ipAddress;

  // workaround to get real client IP
  // most likely because our app will be behind a [reverse] proxy or load balancer
  const clientIp = request.headers['x-client-ip'];
  const forwardedForAlt = request.headers['x-forwarded-for'];
  const realIp = request.headers['x-real-ip'];

  // more obsure ones below
  const clusterClientIp = request.headers['x-cluster-client-ip'];
  const forwardedAlt = request.headers['x-forwarded'];
  const forwardedFor = request.headers['forwarded-for'];
  const forwarded = request.headers['forwarded'];

  // remote address check
  const reqConnectionRemoteAddress = request.connection ? request.connection.remoteAddress : null;
  const reqSocketRemoteAddress = request.socket ? request.socket.remoteAddress : null;
  const reqConnectionSocketRemoteAddress = (request.connection && request.connection.socket) ? request.connection.socket.remoteAddress : null;
  const reqInfoRemoteAddress = request.info ? request.info.remoteAddress : null;

  if (clientIp) {
    // x-client-ip
    ipAddress = clientIp;
  } else if (forwardedForAlt) {
    // x-forwarded-for
    // (typically when your node app is behind a load-balancer (eg. AWS ELB) or proxy)
    //
    // x-forwarded-for may return multiple IP addresses in the format:
    // "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // source: http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html
    const forwardedIps = forwardedForAlt.split(',');
    ipAddress = forwardedIps[0];
  } else if (realIp) {
    // x-real-ip
    // (default nginx proxy/fcgi)
    // alternative to x-forwarded-for, used by some proxies
    ipAddress = realIp;
  } else if (clusterClientIp) {
    // x-cluster-client-ip
    // (Rackspace LB and Riverbed's Stingray)
    // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
    // https://splash.riverbed.com/docs/DOC-1926
    ipAddress = clusterClientIp;
  } else if (forwardedAlt) {
    // x-forwarded
    ipAddress = forwardedAlt;
  } else if (forwardedFor) {
    // forwarded-for
    ipAddress = forwardedFor;
  } else if (forwarded) {
    // forwarded
    ipAddress = forwarded;
  } else if (reqConnectionRemoteAddress) {
    // remote address checks
    ipAddress = reqConnectionRemoteAddress;
  } else if (reqSocketRemoteAddress) {
    ipAddress = reqSocketRemoteAddress;
  } else if (reqConnectionSocketRemoteAddress) {
    ipAddress = reqConnectionSocketRemoteAddress;
  } else if (reqInfoRemoteAddress) {
    ipAddress = reqInfoRemoteAddress;
  } else {
    // return null if we cannot find an address
    ipAddress = null;
  }

  return ipAddress;
};

/**
 * Format all dates in the received model
 * @param {Array|Date|Object} model
 * @param {string} [formatString]
 * @returns {*}
 */
exports.formatDates = (model, formatString) => {
  if (model instanceof Array) {
    for (let i = 0; i < model.length; i++) {
      model[i] = exports.formatDates(model[i], formatString);
    }
  } else if (model instanceof Date || model instanceof moment) {
    return exports.formatDate(model, formatString);
  } else if (model instanceof Object) {
    const keys = Object.keys(model);
    for (let i = 0; i < keys.length; i++) {
      model[keys[i]] = exports.formatDates(model[keys[i]], formatString);
    }
  }
  return model;
};

/**
 * Localize date
 * @param {Date} date
 * @param {number} [utcOffset]
 * @returns {moment}
 */
exports.toLocalDate = (date, utcOffset) => {
  return moment(date).utcOffset(typeof utcOffset === 'undefined' ? 9 : utcOffset);
};

/**
 * Format date to string
 * @param {Date} date
 * @param {string} [formatString]
 * @param {number} [utcOffset]
 * @returns {string}
 */
exports.formatDate = (date, formatString, utcOffset) => {
  return exports.toLocalDate(date, utcOffset).format(formatString);
};

/**
 * Parse below "limited" formatted Semantic Version to an array for UI expression
 *  - equals: "=2.3", "=2", "=4.3.3"
 *  - range: ">=1.2.3 <3.0", ">=1.2.3", "<3.0.0"  (only permitted gte(>=) and lt(<) for ranges)
 *  - all: "*"
 *  - mixed (by OR): ">=1.2.3 <3.0.0 || <0.1.2 || >=5.1"
 * @param {string} conditionString
 * @return {Array}
 */
const regex = /([>=<]{1,2})([0-9a-zA-Z\-.]+)*/g;
exports.parseSemVersion = (semVerString) => {
  if (!semVerString) {
    return [{ comparator: '*' }];   // default
  }
  const conditions = semVerString.split('||').map(cond => cond.trim());  // OR 연산을 기준으로 분리
  const result = [];
  conditions.forEach((cond) => {
    if (cond.startsWith('*')) {
      result.push({ comparator: '*' });
    } else if (cond.startsWith('>=') || cond.startsWith('<')) {
      const resultItem = { comparator: '~' };
      let execResult;
      while ((execResult = regex.exec(cond)) !== null) {
        if (execResult[1] === '>=') {
          resultItem.versionStart = execResult[2];
        } else if (execResult[1] === '<') {
          resultItem.versionEnd = execResult[2];
        }
      }
      if (resultItem.versionStart || resultItem.versionEnd) {
        result.push(resultItem);
      }
    } else if (cond.startsWith('=')) {
      let execResult;
      if ((execResult = regex.exec(cond)) !== null) {
        result.push({ comparator: '=', version: execResult[2] });
      }
    }
  });
  return result;
};

/**
 * Stringify parsed version conditions to SemVer representation
 * @param {Array} parsedConditions
 * @return {string}
 */
exports.stringifySemVersion = (parsedConditions) => {
  const result = parsedConditions.map((cond) => {
    switch (cond.comparator) {
      case '*':
        return '*';
      case '=':
        return `=${cond.version}`;
      case '~':
        return `${cond.versionStart ? `>=${cond.versionStart}` : ''} ${cond.versionEnd ? `<${cond.versionEnd}` : ''}`;
      default:
        return '';
    }
  });
  if (result.includes('*')) {
    return '*';
  }
  return result.filter(cond => !!cond).join(' || ').trim();
};
