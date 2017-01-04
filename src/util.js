/**
 * Util functions
 *
 * @since 1.0.0
 */

const JWT = require('jsonwebtoken');
const moment = require('moment');
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
  ip: account.ip,
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

/**
 * Get client IP address
 *
 * Will return 127.0.0.1 when testing locally
 * Useful when you need the user ip for geolocation or serving localized content
 *
 * @param req
 * @returns {string} ip
 */
exports.getClientIp = (req) => {
  // the ipAddress we return
  let ipAddress;

  // workaround to get real client IP
  // most likely because our app will be behind a [reverse] proxy or load balancer
  const clientIp = req.headers['x-client-ip'];
  const forwardedForAlt = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];

  // more obsure ones below
  const clusterClientIp = req.headers['x-cluster-client-ip'];
  const forwardedAlt = req.headers['x-forwarded'];
  const forwardedFor = req.headers['forwarded-for'];
  const forwarded = req.headers['forwarded'];

  // remote address check
  const reqConnectionRemoteAddress = req.connection ? req.connection.remoteAddress : null;
  const reqSocketRemoteAddress = req.socket ? req.socket.remoteAddress : null;
  const reqConnectionSocketRemoteAddress = (req.connection && req.connection.socket) ? req.connection.socket.remoteAddress : null;
  const reqInfoRemoteAddress = req.info ? req.info.remoteAddress : null;

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

exports.toLocalDate = (date, utcOffset) => {
  return moment(date).utcOffset(typeof utcOffset === 'undefined' ? 9 : utcOffset);
};

exports.formatDate = (date, formatString, utcOffset) => {
  return exports.toLocalDate(date, utcOffset).format(formatString);
};
