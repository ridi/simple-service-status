/**
 * StatusType Service API router
 *
 * @since 1.0.0
 */

const Joi = require('joi');
const StatusType = require('./../repository/StatusType');
const config = require('../config/server.config').url;
const dateUtil = require('../common/date-util');
const SSSError = require('../common/Error');

module.exports = [
  {
    method: 'GET',
    path: `${config.statusTypeApiPrefix}`,
    handler: (request, h) => {
      StatusType.find().then((list) => {
        h.response({
          data: dateUtil.formatDates(list),
          totalCount: list.length,
        });
      }).catch(err => h.response(err));
    },
  },
  {
    method: 'POST',
    path: `${config.statusTypeApiPrefix}`,
    handler: (request, h) => {
      const statusType = Object.assign({}, request.payload);
      StatusType.find({ value: statusType.value })
        .then((result) => {
          if (result && result.length > 0) {
            throw new SSSError(SSSError.Types.CONFLICT, { value: statusType.value });
          }
          return true;
        })
        .then(() => StatusType.add(statusType))
        .then(result => h.response(result))
        .catch(err => h.response(err));
    },
    config: {
      validate: {
        payload: {
          label: Joi.string().required(),
          value: Joi.string().required(),
          template: Joi.string().allow(''),
        },
      },
    },
  },
  {
    method: 'PUT',
    path: `${config.statusTypeApiPrefix}/{statusTypeId}`,
    handler: (request, h) => {
      const statusType = Object.assign({}, request.payload);
      let unset;
      if (!statusType.template) {
        unset = { template: 1 };
        delete statusType.template;
      }
      StatusType.find({ value: statusType.value })
        .then((result) => {
          if (result && result.length > 0 && request.params.statusTypeId !== result[0]._id) {
            throw new SSSError(SSSError.Types.CONFLICT, { value: statusType.value });
          }
          return true;
        })
        .then(() => StatusType.update(request.params.statusTypeId, statusType, unset))
        .then(result => h.response(result))
        .catch(err => h.response(err));
    },
    config: {
      validate: {
        params: {
          statusTypeId: Joi.string().required(),
        },
        payload: {
          label: Joi.string().required(),
          value: Joi.string().required(),
          template: Joi.string().allow(''),
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: `${config.statusTypeApiPrefix}/{statusTypeId}`,
    handler: (request, h) => {
      StatusType.remove(request.params.statusTypeId)
        .then(result => h.response(result))
        .catch(err => h.response(err));
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
