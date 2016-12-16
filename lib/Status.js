/**
 * Created by kyungmi.k on 2016. 12. 16..
 */
const co = require('co');
const mongorito = require('mongorito');
const MongoModel = mongorito.Model;
const url = 'mongodb://kyungmi:kyungmi@ds133438.mlab.com:33438/heroku_c0c40vst';

class Status extends MongoModel {}

function _runQuery (fn) {
   return co(function* () {
        yield mongorito.connect(url);
        let result = yield fn();
        yield mongorito.disconnect();
        return yield result;
    }).catch(function (err) {
        console.error(err);
        throw err;
    });
}

function _padStart(str, padStr, num) {
    if (padStr.length >= num) {
        return padStr;
    }
    return (padStr.repeat(num) + str).slice(-num);
}

function _compareVersion(version, userVersion) {
    if (!version instanceof Array && version.length === 0) {
        return false;
    }
    if (version[0] === '*' || userVersion === '*') {
        return true;
    }
    if (version.length === 4) {
        let comparator = version[0];
        let versionStr = _padStart(version[1], '0', 5) + _padStart(version[2], '0', 5) + _padStart(version[3], '0', 5);
        let split = userVersion.split('.');
        let userVersionStr = _padStart(split[0], '0', 5) + _padStart(split[1], '0', 5) + _padStart(split[2], '0', 5);
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

exports.get = function (deviceType, deviceVersion, appVersion) {
    return _runQuery(Status.find.bind(Status))
        .then((results) => {
            return results.filter(function(result) {
                return (result.deviceType.includes(deviceType)
                    && _compareVersion(result.deviceVersion, deviceVersion)
                    && _compareVersion(result.appVersion, appVersion));
            });
        });
};


exports.save = function (status) {
    let s = new Status(status);
    return _runQuery(s.save.bind(s));
};

exports.test = function () {
    let s = new Status({
        deviceType: ['Android'],
        deviceVersion: ['>', 3, 1, 0],
        appVersion: ['<', 2, 7, 1],
        startTime: new Date(),
        endTime: new Date(),
        type: 'serviceFailure',
        contents: ''
    });
    return _runQuery(s.save.bind(s));
};