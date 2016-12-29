const Model = require('./Model');

// FIXME remove it!
const types = [
  { label: '서버 문제', value: 'serviceFailure' },
  { label: '정기 점검', value: 'routineInspection' },
];

const typesMap = {
  serverFailure: types[0],
  routineInspection: types[1],
};

class StatusType extends Model {
  find(value) {
    if (!value) {
      return Promise.resolve(types);
    }
    return Promise.resolve(typesMap[value]);
  }

  save(type) {
    types.push(type);
    return Promise.resolve();
  }
}

module.exports = new StatusType();
