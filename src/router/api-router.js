/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO findAll, save => authentication
 */

const API_PREFIX = '/api/v1/status';

const Joi = require('joi');
const Status = require('./../repository/Status');

module.exports = [
  {
    method: 'GET',
    path: API_PREFIX,
    handler: (request, reply) => {
      Status.find(request.query.deviceType || '*', request.query.deviceVersion || '*', request.query.appVersion || '*')
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        query: {
          deviceType: Joi.string().required(),
          deviceVersion: Joi.string().regex(/^[0-9.*]+$/).required(),
          appVersion: Joi.string().regex(/^[0-9.*]+$/).required(),
        },
      },
      auth: false,
    },
  },
  {
    method: 'POST',
    path: API_PREFIX,
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
          deviceVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\d\w]{1,5}/)).required(),
          appVersion: Joi.array().items(Joi.string().regex(/[*<>=]{1,2}/), Joi.string().regex(/[\d\w]{1,5}/)).required(),
          type: Joi.string().required(),
          contents: Joi.string(),
          isActivated: Joi.boolean().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${API_PREFIX}/test`,
    handler: (request, reply) => {
      Status.test()
        .then(result => reply(result))
        .catch(err => reply(err));
    },
  },
];
