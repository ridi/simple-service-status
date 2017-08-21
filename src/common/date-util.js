/**
 * Date Util functions
 *
 * @since 1.0.0
 */

const moment = require('moment');

/**
 * Format all dates in the received model
 * @param {Array|Date|Object} model
 * @param {string} [formatString]
 * @param {number} [utcOffset]
 * @returns {*}
 */
exports.formatDates = (model, formatString, utcOffset) => {
  if (model instanceof Array) {
    return model.map(item => exports.formatDates(item, formatString, utcOffset));
  } else if (model instanceof Date || model instanceof moment) {
    return exports.formatDate(model, formatString, utcOffset);
  } else if (model instanceof Object) {
    const result = {};
    Object.keys(model).forEach((key) => { result[key] = exports.formatDates(model[key], formatString, utcOffset); });
    return result;
  }
  return model;
};

/**
 * Localize date
 * @param {Date} date
 * @param {number} [utcOffset]
 * @returns {moment}
 */
exports.toLocalDate = (date, utcOffset) => moment(date).utcOffset(typeof utcOffset === 'undefined' ? 9 : utcOffset);

/**
 * Format date to string
 * @param {Date} date
 * @param {string} [formatString]
 * @param {number} [utcOffset]
 * @returns {string}
 */
exports.formatDate = (date, formatString, utcOffset) => exports.toLocalDate(date, utcOffset).format(formatString);
