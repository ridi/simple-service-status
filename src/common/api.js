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
 *    - {string} username
 *    - {string} password
 */
exports.login = data => axios.post('/login', data);

/**
 *
 * @param data
 */
exports.changePassword = data => axios.put('/passwords', data);

/**
 * Get status list
 * @param {string} filter - filter name: 'current' or 'expired'
 * @param {number} skip - numbers of records to be skipped
 * @param {number} limit - numbers of records to be returned
 */
exports.getStatus = (filter, skip, limit) => axios.get('/status', { params: { filter, skip, limit } });

/**
 * Add a status
 * @param {Object} data
 *    - {string} type
 *    - {Array} deviceTypes
 *    - {string} startTime (ISO 8601 format)
 *    - {string} endTime (ISO 8601 format)
 *    - {string} contents
 *    - {boolean} isActivated
 *    - {string} deviceSemVersion
 *    - {string} appSemVersion
 */
exports.addStatus = data => axios.post('/status', data);

/**
 * Update a status
 * @param {string} statusId
 * @param {Object} data
 *    - {string} type
 *    - {Array} deviceTypes
 *    - {string} startTime (ISO 8601 format)
 *    - {string} endTime (ISO 8601 format)
 *    - {string} contents
 *    - {boolean} isActivated
 *    - {string} deviceSemVersion
 *    - {string} appSemVersion
 */
exports.updateStatus = (statusId, data) => axios.put(`/status/${statusId}`, data);

/**
 * Remove a status
 * @param {string} statusId
 */
exports.removeStatus = statusId => axios.delete(`/status/${statusId}`);

/**
 * Activate a status
 * @param {string} statusId
 */
exports.activateStatus = statusId => axios.put(`/status/${statusId}/activate`);

/**
 * Deactivate a status
 * @param {string} statusId
 */
exports.deactivateStatus = statusId => axios.put(`/status/${statusId}/deactivate`);

/**
 * Get status type list
 */
exports.getStatusTypes = () => axios.get('/status-types');

/**
 * Add a status type
 * @param {Object} data
 *    - {string} label
 *    - {string} value
 *    - {string} template
 */
exports.addStatusType = data => axios.post('/status-types', data);

/**
 * Update a status type
 * @param {string} statusTypeId
 * @param {Object} data
 *    - {string} label
 *    - {string} value
 *    - {string} template
 */
exports.updateStatusType = (statusTypeId, data) => axios.put(`/status-types/${statusTypeId}`, data);

/**
 * Remove a status type
 * @param {string} statusTypeId
 */
exports.removeStatusType = statusTypeId => axios.delete(`/status-types/${statusTypeId}`);

/**
 * Get device type list
 */
exports.getDeviceTypes = () => axios.get('/device-types');

/**
 * Add a device type
 * @param {Object} data
 *    - {string} label
 *    - {string} value
 */
exports.addDeviceType = data => axios.post('/device-types', data);

/**
 * Update a device type
 * @param {string} deviceTypeId
 * @param {Object} data
 *    - {string} label
 *    - {string} value
 */
exports.updateDeviceType = (deviceTypeId, data) => axios.put(`/device-types/${deviceTypeId}`, data);

/**
 * Remove a device type
 * @param {string} deviceTypeId
 */
exports.removeDeviceType = deviceTypeId => axios.delete(`/device-types/${deviceTypeId}`);
