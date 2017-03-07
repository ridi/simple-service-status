/**
 * Common Service API router
 *
 * @since 1.0.0
 */

const Joi = require('joi');
const User = require('./../repository/User');
const config = require('../config/server.config').url;
const util = require('../common/common-util');
const authUtil = require('../common/auth-util');
const NotifierError = require('../common/Error');
const logger = require('winston');

module.exports = [
  {
    method: 'POST',
    path: `${config.apiPrefix}/login`,
    handler: (request, reply) => {
      const clientIP = util.getClientIp(request);
      if (process.env.ALLOWED_IP && !process.env.ALLOWED_IP.includes(clientIP)) {
        logger.warn(`[Auth] This client IP is not allowed.: ${clientIP}`);
        return reply(new NotifierError(NotifierError.Types.FORBIDDEN_IP_ADDRESS, { remoteAddress: clientIP }));
      }
      if (!request.payload.username || !request.payload.password) {
        return reply(new NotifierError(NotifierError.Types.AUTH_MISSING_PARAMS));
      }
      return User.find({ username: request.payload.username }).then((account) => {
        if (!account || account.length === 0 || !authUtil.comparePassword(request.payload, account[0].password)) {
          return reply(new NotifierError(NotifierError.Types.AUTH_INVALID_PARAMS));
        }
        const token = authUtil.generateToken(Object.assign({}, account[0], { ip: clientIP }));
        return reply().state('token', token);
      });
    },
    config: {
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: `${config.apiPrefix}/passwords`,
    handler: (request, reply) => User.updatePassword(request.auth.credentials.username, request.payload.password)
      .then(result => reply(result))
      .catch(err => reply(err)),
    config: {
      validate: {
        payload: {
          password: Joi.string().min(8).required(),
        },
      },
    },
  },
];
