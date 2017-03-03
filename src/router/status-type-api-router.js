/**
 * StatusType Service API router
 *
 * @since 1.0.0
 */

const Joi = require('joi');
const StatusType = require('./../repository/StatusType');
const config = require('../config/server.config').url;
const dateUtil = require('../common/date-util');
const logger = require('winston');

module.exports = [
  {
    method: 'GET',
    path: `${config.statusTypeApiPrefix}`,
    handler: (request, reply) => {
      StatusType.find().then((list) => {
        reply({
          data: dateUtil.formatDates(list),
          totalCount: list.length,
        });
      }).catch(err => reply(err));
    },
  },
  {
    method: 'POST',
    path: `${config.statusTypeApiPrefix}`,
    handler: (request, reply) => {
      const statusType = Object.assign({}, request.payload);
      StatusType.add(statusType)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        payload: {
          label: Joi.string().required(),
          value: Joi.string().required(),
          template: Joi.string(),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: `${config.statusTypeApiPrefix}/{statusTypeId}`,
    handler: (request, reply) => {
      const statusType = Object.assign({}, request.payload);
      let unset;
      if (!statusType.template) {
        unset = { template: 1 };
      }

      StatusType.update(request.params.statusTypeId, statusType, unset)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusTypeId: Joi.string().required(),
        },
        payload: {
          label: Joi.string().required(),
          value: Joi.string().required(),
          template: Joi.string(),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: `${config.statusTypeApiPrefix}/{statusTypeId}`,
    handler: (request, reply) => {
      StatusType.remove(request.params.statusTypeId)
        .then(result => reply(result))
        .catch(err => reply(err));
    },
    config: {
      validate: {
        params: {
          statusTypeId: Joi.string().required(),
        },
      },
    },
  },
];
