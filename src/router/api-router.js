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
      if (process.env.ALLOWED_IP && !process.env.ALLOWED_IP.includes(request.info.remoteAddress)) {
        console.warn(`[Auth] This client IP is not allowed.: ${request.info.remoteAddress}`);
        return reply(new RidiError(RidiError.Types.FORBIDDEN_IP_ADDRESS, { remoteAddress: request.info.remoteAddress }));
      }
      if (!request.payload.username || !request.payload.password) {
        return reply(new RidiError(RidiError.Types.AUTH_MISSING_PARAMS));
      }
      User.find(request.payload.username).then((account) => {
        // TODO PASSWORD 암호화
        if (!account || account.password !== request.payload.password) {
          return reply(new RidiError(RidiError.Types.AUTH_INVALID_PARAMS));
        }
        const token = util.generateToken(Object.assign({}, account, { ip: request.info.remoteAddress }));
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
      Status.findAll({ endTime: -1, startTime: -1, isActivated: -1 })
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${config.statusApiPrefix}/check`,
    handler: (request, reply) => {
      Status.find(request.query.deviceType || '*', request.query.deviceVersion || '*', request.query.appVersion || '*')
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          deviceType: Joi.string(),
          deviceVersion: Joi.string().regex(/^[0-9A-Za-z.*]+$/),
          appVersion: Joi.string().regex(/^[0-9A-Za-z.*]+$/),
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
          startTime: Joi.string().regex(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}$/).required(),
          endTime: Joi.string().regex(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}$/).required(),
          deviceType: Joi.array().items(Joi.string()).required(),
          deviceVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\dA-Za-z]{1,5}/)).required(),
          appVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\dA-Za-z]{1,5}/)).required(),
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
          startTime: Joi.string().regex(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}$/).required(),
          endTime: Joi.string().regex(/^[\d]{4}-[\d]{2}-[\d]{2} [\d]{2}:[\d]{2}$/).required(),
          deviceType: Joi.array().items(Joi.string()).required(),
          deviceVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\dA-Za-z]{1,5}/)).required(),
          appVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\dA-Za-z]{1,5}/)).required(),
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
