/**
 * Status model
 *
 * @since 1.0.0
 */

const Model = require('./Model');
const semver = require('semver');
const Cache = require('node-cache');

const cache = new Cache({ stdTTL: 60, checkperiod: 30 });

class Status extends Model {

  find(query, sort, skip, limit) {
    return super.find(query, sort, skip, limit);
  }

  findWithCache(query) {
    return Promise.resolve().then(() => {
      const list = cache.get('status');
      if (list === undefined) {
        return this.find(query).then(((result) => {
          cache.set('status', result);
          return result;
        }));
      }
      return list;
    });
  }

  findWithComparators(deviceType, deviceVersion, appVersion) {
    const self = this;
    const now = new Date();
    return this.findWithCache({
      $or: [
        { startTime: { $lte: now }, endTime: { $gt: now }, isActivated: true },
        { startTime: { $exists: false }, endTime: { $exists: false }, isActivated: true },
      ],
    }).then(results => results.filter(
      result => result.deviceTypes.includes(deviceType)
        && self._isSatisfiedVersion(result.deviceSemVersion, deviceVersion)
        && self._isSatisfiedVersion(result.appSemVersion, appVersion)
    ));
  }

  add(model) {
    return super.add(model).then((result) => {
      cache.del('status');
      return result;
    });
  }

  update(id, model) {
    return super.update(id, model).then((result) => {
      cache.del('status');
      return result;
    });
  }

  remove(id) {
    return super.remove(id).then((result) => {
      cache.del('status');
      return result;
    });
  }

  _isSatisfiedVersion(conditions, versionToCompare) {
    if (!conditions || versionToCompare === '*') {
      return true;
    }
    return semver.satisfies(versionToCompare, conditions);
  }
}

module.exports = new Status();
