/* global describe test expect beforeAll afterAll */

const util = require('../../src/common/date-util');
const moment = require('moment');

const datesObjects = [
  {
    param: { date1: moment('2012-04-03T22:33:00+09:00') },
    expected: { date1: '2012-04-03T22:33:00+09:00' },
    expected2: { date1: '2012-04-03T21:33:00+08:00' },
    expected3: { date1: '2012-04-03 21' },
  },
  {
    param: [moment('2012-04-03T22:33:00+09:00')],
    expected: ['2012-04-03T22:33:00+09:00'],
    expected2: ['2012-04-03T21:33:00+08:00'],
    expected3: ['2012-04-03 21'],
  },
  {
    param: 'string',
    expected: 'string',
    expected2: 'string',
    expected3: 'string',
  },
  {
    param: [
      { date1: moment('2016-03-23T10:00:00+08:00'), date2: [moment('2016-03-23T10:00:00+08:00')] },
      { date3: 'string', date4: [moment('2016-03-23T10:00:00+08:00')] },
    ],
    expected: [
      { date1: '2016-03-23T11:00:00+09:00', date2: ['2016-03-23T11:00:00+09:00'] },
      { date3: 'string', date4: ['2016-03-23T11:00:00+09:00'] },
    ],
    expected2: [
      { date1: '2016-03-23T10:00:00+08:00', date2: ['2016-03-23T10:00:00+08:00'] },
      { date3: 'string', date4: ['2016-03-23T10:00:00+08:00'] },
    ],
    expected3: [
      { date1: '2016-03-23 10', date2: ['2016-03-23 10'] },
      { date3: 'string', date4: ['2016-03-23 10'] },
    ]
  },
];

test('formatDates', () => {
  return Promise.all(datesObjects.map((obj) => {
    expect(util.formatDates(obj.param)).toEqual(obj.expected);
    expect(util.formatDates(obj.param, undefined, 8)).toEqual(obj.expected2);
    expect(util.formatDates(obj.param, 'YYYY-MM-DD HH', 8)).toEqual(obj.expected3);
    return Promise.resolve();
  }));
});

