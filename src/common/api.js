/**
 * Client SDK for using server's APIs
 *
 * @since 1.0.0
 */

const Axios = require('axios');
const config = require('../config/server.config');
const util = require('./common-util');

const axios = Axios.create({
  baseURL: config.url.apiPrefix,
  transformRequest: [data => JSON.stringify(util.camel2snakeObject(data))],
  transformResponse: [data => util.snake2camelObject(JSON.parse(data))],
});
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

/**
 * Try to login
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
 * @returns {Promise}
 */
exports.login = data => axios.post('/login', data);

/**
 * Change user password
 * @param {object} data
 * @returns {Promise}
 */
exports.changePassword = data => axios.put('/passwords', data);

/**
 * Get status list
 * @param {string} filter - filter name: 'current' or 'expired'
 * @param {number} skip - numbers of records to be skipped
 * @param {number} limit - numbers of records to be returned
 * @returns {Promise}
 */
exports.getStatus = (filter, skip, limit) => axios.get('/status', { params: { filter, skip, limit } });

/**
 * Add a status
 * @param {Object} data
 * @param {string} data.type
 * @param {Array} data.deviceTypes
 * @param {string} data.startTime (ISO 8601 format)
 * @param {string} data.endTime (ISO 8601 format)
 * @param {string} data.contents
 * @param {boolean} data.isActivated
 * @param {string} data.deviceSemVersion
 * @param {string} data.appSemVersion
 * @returns {Promise}
 */
exports.addStatus = data => axios.post('/status', data);

/**
 * Update a status
 * @param {string} statusId
 * @param {Object} data
 * @param {string} data.type
 * @param {Array} data.deviceTypes
 * @param {string} data.startTime (ISO 8601 format)
 * @param {string} data.endTime (ISO 8601 format)
 * @param {string} data.contents
 * @param {boolean} data.isActivated
 * @param {string} data.deviceSemVersion
 * @param {string} data.appSemVersion
 * @returns {Promise}
 */
exports.updateStatus = (statusId, data) => axios.put(`/status/${statusId}`, data);

/**
 * Remove a status
 * @param {string} statusId
 * @returns {Promise}
 */
exports.removeStatus = statusId => axios.delete(`/status/${statusId}`);

/**
 * Activate a status
 * @param {string} statusId
 * @returns {Promise}
 */
exports.activateStatus = statusId => axios.put(`/status/${statusId}/activate`);

/**
 * Deactivate a status
 * @param {string} statusId
 * @returns {Promise}
 */
exports.deactivateStatus = statusId => axios.put(`/status/${statusId}/deactivate`);

/**
 * Get status type list
 * @returns {Promise}
 */
exports.getStatusTypes = () => axios.get('/status-types');

/**
 * Add a status type
 * @param {Object} data
 * @param {string} data.label
 * @param {string} data.value
 * @param {string} data.template
 * @returns {Promise}
 */
exports.addStatusType = data => axios.post('/status-types', data);

/**
 * Update a status type
 * @param {string} statusTypeId
 * @param {Object} data
 * @param {string} data.label
 * @param {string} data.value
 * @param {string} data.template
 * @returns {Promise}
 */
exports.updateStatusType = (statusTypeId, data) => axios.put(`/status-types/${statusTypeId}`, data);

/**
 * Remove a status type
 * @param {string} statusTypeId
 * @returns {Promise}
 */
exports.removeStatusType = statusTypeId => axios.delete(`/status-types/${statusTypeId}`);

/**
 * Get device type list
 * @returns {Promise}
 */
exports.getDeviceTypes = () => axios.get('/device-types');

/**
 * Add a device type
 * @param {Object} data
 * @param {string} data.label
 * @param {string} data.value
 * @returns {Promise}
 */
exports.addDeviceType = data => axios.post('/device-types', data);

/**
 * Update a device type
 * @param {string} deviceTypeId
 * @param {Object} data
 * @param {string} data.label
 * @param {string} data.value
 * @returns {Promise}
 */
exports.updateDeviceType = (deviceTypeId, data) => axios.put(`/device-types/${deviceTypeId}`, data);

/**
 * Remove a device type
 * @param {string} deviceTypeId
 * @returns {Promise}
 */
exports.removeDeviceType = deviceTypeId => axios.delete(`/device-types/${deviceTypeId}`);
