/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO 1 minute caching (query=>key)
 * // TODO pagination
 */

const Joi = require('joi');
const Status = require('./../repository/Status');
const User = require('./../repository/User');
const config = require('../config/server.config').url;
const util = require('../util');
const RidiError = require('../Error');

module.exports = [
  {
    method: 'POST',
    path: `${config.apiPrefix}/login`,
    handler: (request, reply) => {
      const clientIP = util.getClientIp(request);
      if (process.env.ALLOWED_IP && !process.env.ALLOWED_IP.includes(clientIP)) {
        console.warn(`[Auth] This client IP is not allowed.: ${clientIP}`);
        return reply(new RidiError(RidiError.Types.FORBIDDEN_IP_ADDRESS, { remoteAddress: clientIP }));
      }
      if (!request.payload.username || !request.payload.password) {
        return reply(new RidiError(RidiError.Types.AUTH_MISSING_PARAMS));
      }
      User.find(request.payload.username).then((account) => {
        // TODO PASSWORD 암호화
        if (!account || account.password !== request.payload.password) {
          return reply(new RidiError(RidiError.Types.AUTH_INVALID_PARAMS));
        }
        const token = util.generateToken(Object.assign({}, account, { ip: clientIP }));
        return reply().state('token', token);
      });
    },
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: `${config.statusApiPrefix}`,
    handler: (request, reply) => {
      let filter = {};
      if (request.query.filter === 'current') { // 미래 포함
        filter = { endTime: { $gt: new Date() } };
      } else if (request.query.filter === 'expired') {
        filter = { endTime: { $lte: new Date() } };
      }
      Status.find(filter, { endTime: -1, startTime: -1, isActivated: -1 })
        .then(result => util.formatDates(result))
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          filter: Joi.any().valid('current', 'expired'),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${config.statusApiPrefix}/check`,
    handler: (request, reply) => {
      Status.findWithComparators(request.query.deviceType || '*', request.query.deviceVersion || '*', request.query.appVersion || '*')
        .then(result => util.formatDates(result))
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          deviceType: Joi.string(),
          deviceVersion: Joi.string().regex(/^[\dA-Za-z.*]+$/),
          appVersion: Joi.string().regex(/^[\dA-Za-z.*]+$/),
        },
      },
      auth: false,
    },
  },
  {
    method: 'POST',
    path: `${config.statusApiPrefix}`,
    handler: (request, reply) => {
      request.payload.startTime = new Date(Date.parse(request.payload.startTime));
      request.payload.endTime = new Date(Date.parse(request.payload.endTime));
      Status.save(request.payload)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        payload: {
          startTime: Joi.string().isoDate().required(),
          endTime: Joi.string().isoDate().required(),
          deviceType: Joi.array().items(Joi.string()).required(),
          deviceVersion: Joi.array().items(Joi.string().regex(/^[*<>=]{1,2}$/), Joi.string().regex(/^[\dA-Za-z]{1,5}$/)).required(),
          appVersion: Joi.array().items(Joi.string().regex(/^[*<>=]{1,2}$/), Joi.string().regex(/^[\dA-Za-z]{1,5}$/)).required(),
          type: Joi.string().required(),
          contents: Joi.string(),
          isActivated: Joi.boolean().required(),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: `${config.statusApiPrefix}/{statusId}`,
    handler: (request, reply) => {
      request.payload.startTime = new Date(Date.parse(request.payload.startTime));
      request.payload.endTime = new Date(Date.parse(request.payload.endTime));
      request.payload._id = request.params.statusId;
      Status.save(request.payload)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusId: Joi.string().required(),
        },
        payload: {
          _id: Joi.string().required(),
          startTime: Joi.string().isoDate().required(),
          endTime: Joi.string().isoDate().required(),
          deviceType: Joi.array().items(Joi.string()).required(),
          deviceVersion: Joi.array().items(Joi.string().regex(/^[*<>=]{1,2}$/), Joi.string().regex(/^[\dA-Za-z]{1,5}$/)).required(),
          appVersion: Joi.array().items(Joi.string().regex(/^[*<>=]{1,2}$/), Joi.string().regex(/^[\dA-Za-z]{1,5}$/)).required(),
          type: Joi.string().required(),
          contents: Joi.string(),
          isActivated: Joi.boolean().required(),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: `${config.statusApiPrefix}/{statusId}/{action}`,
    handler: (request, reply) => {
      Status.update(request.params.statusId, { isActivated: request.params.action === 'activate' })
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusId: Joi.string().required(),
          action: Joi.string().valid('activate', 'deactivate').required(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: `${config.statusApiPrefix}/{statusId}`,
    handler: (request, reply) => {
      Status.remove(request.params.statusId)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusId: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${config.statusApiPrefix}/test`,
    handler: (request, reply) => {
      Status.test()
        .then(result => reply(result))
        .catch(err => reply(err));
    },
  },
];
