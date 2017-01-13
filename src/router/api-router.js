/**
 * Service API router
 *
 * @since 1.0.0
 */

const Joi = require('joi');
const Status = require('./../repository/Status');
const User = require('./../repository/User');
const config = require('../config/server.config').url;
const util = require('../common/util');
const RidiError = require('../common/Error');

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
      User.find({ username: request.payload.username }).then((account) => {
        if (!account || account.length === 0 || !util.comparePassword(request.payload, account[0].password)) {
          return reply(new RidiError(RidiError.Types.AUTH_INVALID_PARAMS));
        }
        const token = util.generateToken(Object.assign({}, account[0], { ip: clientIP }));
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
        filter = {
          $or: [
            { endTime: { $gt: new Date() } },
            { startTime: { $exists: false }, endTime: { $exists: false } },
          ],
        };
      } else if (request.query.filter === 'expired') {
        filter = { endTime: { $lte: new Date() } };
      }
      Promise.all([
        Status.find(filter, { isActivated: -1, startTime: 1, endTime: 1 }, request.query.skip, request.query.limit),
        Status.count(filter),
      ]).then(([list, totalCount]) => {
        reply({
          data: util.formatDates(list),
          totalCount,
        });
      }).catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          filter: Joi.any().valid('current', 'expired'),
          skip: Joi.number(),
          limit: Joi.number(),
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
        .then(result => reply({ data: result }))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          deviceType: Joi.string(),
          deviceVersion: Joi.string().regex(/^[0-9A-Za-z.*-]+$/),
          appVersion: Joi.string().regex(/^[0-9A-Za-z.*-]+$/),
        },
      },
      auth: false,
    },
  },
  {
    method: 'POST',
    path: `${config.statusApiPrefix}`,
    handler: (request, reply) => {
      const status = Object.assign({}, request.payload);
      if (status.startTime && status.endTime) {
        status.startTime = new Date(Date.parse(status.startTime));
        status.endTime = new Date(Date.parse(status.endTime));
      }
      Status.add(status)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        payload: {
          startTime: Joi.string().isoDate(),
          endTime: Joi.string().isoDate(),
          deviceTypes: Joi.array().items(Joi.string()).required(),
          deviceSemVersion: Joi.string().regex(/^(([*>=<]{1,2}[0-9A-Za-z.-]*[\s]*)[\s|]*)+$/).required(),
          appSemVersion: Joi.string().regex(/^(([*>=<]{1,2}[0-9A-Za-z.-]*[\s]*)[\s|]*)+$/).required(),
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
      const status = Object.assign({}, request.payload);
      if (status.startTime && status.endTime) {
        status.startTime = new Date(Date.parse(status.startTime));
        status.endTime = new Date(Date.parse(status.endTime));
      }
      Status.update(request.params.statusId, status)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusId: Joi.string().required(),
        },
        payload: {
          startTime: Joi.string().isoDate(),
          endTime: Joi.string().isoDate(),
          deviceTypes: Joi.array().items(Joi.string()).required(),
          deviceSemVersion: Joi.string().regex(/^(([*>=<]{1,2}[0-9A-Za-z.-]*[\s]*)[\s|]*)+$/).required(),
          appSemVersion: Joi.string().regex(/^(([*>=<]{1,2}[0-9A-Za-z.-]*[\s]*)[\s|]*)+$/).required(),
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
];
