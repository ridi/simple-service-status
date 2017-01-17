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
 * @returns {*}
 */
exports.formatDates = (model, formatString) => {
  if (model instanceof Array) {
    for (let i = 0; i < model.length; i++) {
      model[i] = exports.formatDates(model[i], formatString);
    }
  } else if (model instanceof Date || model instanceof moment) {
    return exports.formatDate(model, formatString);
  } else if (model instanceof Object) {
    const keys = Object.keys(model);
    for (let i = 0; i < keys.length; i++) {
      model[keys[i]] = exports.formatDates(model[keys[i]], formatString);
    }
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
