/**
 * Status model
 *
 * @since 1.0.0
 */

'use strict';

const utils = require('./Util');
const Model = require('./Model');

class Status extends Model {
    _compareVersion(version, userVersion) {
        if (!version instanceof Array && version.length === 0) {
            return false;
        }
        if (version[0] === '*' || userVersion === '*') {
            return true;
        }
        if (version.length === 4) {
            let comparator = version[0];
            let versionStr = utils.padStart(version[1], '0', 5) + utils.padStart(version[2], '0', 5) + utils.padStart(version[3], '0', 5);
            let split = userVersion.split('.');
            let userVersionStr = utils.padStart(split[0], '0', 5) + utils.padStart(split[1], '0', 5) + utils.padStart(split[2], '0', 5);
            switch(comparator) {
                case '<':
                    return userVersionStr < versionStr;
                case '<=':
                    return userVersionStr <= versionStr;
                case '>':
                    return userVersionStr > versionStr;
                case '>=':
                    return userVersionStr >= versionStr;
                case '=':
                    return userVersionStr === versionStr;
                default:
                    return false;
            }
        }
        return false;
    }

    find(deviceType, deviceVersion, appVersion) {
        let self = this;
        return super.find().then((results) => {
            console.log(results);
            return results.filter(function(result) {
                return (result.deviceType.includes(deviceType)
                && self._compareVersion(result.deviceVersion, deviceVersion)
                && self._compareVersion(result.appVersion, appVersion));
            });
        });
    }

    save(status) {
        return super.save(status);
    }

    test() {
        return this.save({
            deviceType: ['Android'],
            deviceVersion: ['>', 3, 1, 0],
            appVersion: ['<', 2, 7, 1],
            startTime: new Date(),
            endTime: new Date(),
            type: 'serviceFailure',
            contents: ''
        });
    }

}

module.exports = new Status();