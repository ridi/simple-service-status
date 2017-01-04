/**
 * Status model
 *
 * @since 1.0.0
 */

const utils = require('./../util');
const Model = require('./Model');

class Status extends Model {

  find(query, sort, postFilter) {
    return super.find(query, sort).then((result) => {
      if (typeof postFilter === 'function') {
        return postFilter(result);
      }
      return result;
    });
  }

  findWithComparators(deviceType, deviceVersion, appVersion) {
    const self = this;
    const now = new Date();
    return this.find({
      startTime: { $lte: now },
      endTime: { $gt: now },
      isActivated: true,
    }, {}, results => results.filter(
      result => result.deviceType.includes(deviceType)
        && self._compareVersion(result.deviceVersion, deviceVersion)
        && self._compareVersion(result.appVersion, appVersion)
    ));
  }

  test() {
    return this.save({
      deviceType: ['Android'],
      deviceVersion: ['>', 3, 1, 0],
      appVersion: ['<', 2, 7, 1],
      startTime: new Date(),  // UTC 기준으로 저장됨
      endTime: new Date(new Date().getTime() + (1000 * 3600 * 5)),
      type: 'serviceFailure',
      contents: '',
      isActivated: true,
    });
  }

  _getVersionAsString(version) {
    if (version.length < 3) {
      throw new Error(`Invalid format of version: ${version}`);
    }
    return utils.padStart(version[0], '0', 5) + utils.padStart(version[1], '0', 5) + utils.padStart(version[2], '0', 5);
  }

  _compareVersion(serverVersion, userVersion) {
    if (!(serverVersion instanceof Array) && serverVersion.length === 0) {
      return false;
    }
    if (serverVersion[0] === '*' || userVersion === '*') {
      return true;
    }
    if (serverVersion.length === 4) {
      const comparator = serverVersion[0];
      const serverVersionStr = this._getVersionAsString(serverVersion.slice(1));
      const userVersionStr = this._getVersionAsString(userVersion.split('.'));
      switch (comparator) {
        case '<':
          return userVersionStr < serverVersionStr;
        case '<=':
          return userVersionStr <= serverVersionStr;
        case '>':
          return userVersionStr > serverVersionStr;
        case '>=':
          return userVersionStr >= serverVersionStr;
        case '=':
          return userVersionStr === serverVersionStr;
        default:
          return false;
      }
    }
    return false;
  }
}

module.exports = new Status();
