/**
 * Status model
 *
 * @since 1.0.0
 */

const Model = require('./Model');
const semver = require('semver');

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
        && self._isSatisfiedVersion(result.deviceSemVersion, deviceVersion)
        && self._isSatisfiedVersion(result.appSemVersion, appVersion)
    ));
  }

  _isSatisfiedVersion(conditions, versionToCompare) {
    if (!conditions || versionToCompare === '*') {
      return true;
    }
    return semver.satisfies(versionToCompare, conditions);
  }
}

module.exports = new Status();
