/**
 * Util functions
 *
 * @since 1.0.0
 */

'use strict';

/**
 * Set pads at the front of the string.
 * @param str
 * @param padStr
 * @param num
 * @returns {*}
 */
exports.padStart = (str, padStr, num) => {
    if (padStr.length >= num) {
        return padStr;
    }
    return (padStr.repeat(num) + str).slice(-num);
};