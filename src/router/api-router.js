/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO 1 minute caching (query=>key)
 */

const Joi = require('joi');
const Status = require('./../repository/Status');
const config = require('../config/server.config').url;

module.exports = [
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
    method: 'GET',
    path: `${config.statusApiPrefix}/test`,
    handler: (request, reply) => {
      Status.test()
        .then(result => reply(result))
        .catch(err => reply(err));
    },
  },
];
