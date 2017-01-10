/**
 * Client SDK for using server's APIs
 *
 * @author kyungmi.k
 * @since 1.0.0
 */

const Axios = require('axios');
const config = require('../config/server.config');
const util = require('./util');

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
 * Get status(notification) list
 * @param {string} filter - filter name: 'current' or 'expired'
 * @param {numnber} skip - numbers of records to be skipped
 * @param {number} limit - numbers of records to be returned
 */
exports.getStatus = (filter, skip, limit) => axios.get('/status', { params: { filter, skip, limit } });

/**
 * Add a status(notification)
 * @param {Object} data
 *    - {string} type
 *    - {string} deviceType,
 *    - {string} startTime (ISO 8601 format)
 *    - {string} endTime (ISO 8601 format)
 *    - {string} contents
 *    - {boolean} isActivated
 *    - {string} deviceSemVersion
 *    - {string} appSemVersion
 */
exports.addStatus = data => axios.post('/status', data);

/**
 * Update a status(notification)
 * @param {string} statusId
 * @param {Object} data
 *    - {string} type
 *    - {string} deviceType,
 *    - {string} startTime (ISO 8601 format)
 *    - {string} endTime (ISO 8601 format)
 *    - {string} contents
 *    - {boolean} isActivated
 *    - {string} deviceSemVersion
 *    - {string} appSemVersion
 */
exports.updateStatus = (statusId, data) => axios.put(`/status/${statusId}`, data);

/**
 * Remove a status(notification)
 * @param {string} statusId
 */
exports.removeStatus = statusId => axios.delete(`/status/${statusId}`);

/**
 * Activate a status(notification)
 * @param {string} statusId
 */
exports.activateStatus = statusId => axios.put(`/status/${statusId}/activate`);

/**
 * Deactivate a status(notification)
 * @param {string} statusId
 */
exports.deactivateStatus = statusId => axios.put(`/status/${statusId}/deactivate`);
