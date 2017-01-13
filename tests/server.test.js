/* global describe test expect beforeAll afterAll */

// Load local environments
require('node-env-file')(`${__dirname}/../.env`);
const Server = require('../src/server');
const User = require('../src/repository/User');
const Status = require('../src/repository/Status');
const config = require('../src/config/server.config');

const serverPromise = Server.start();

const user1 = {
  username: 'testuser',
  password: 'testuser',
};

describe('User', () => {
  let id;
  const url = `${config.url.apiPrefix}/login`;

  beforeAll(() => User.add(user1).then((result) => {
    id = result.data[0]._id;
  }));

  test('login', () => {
    return serverPromise.then((server) => {
      return server.inject({ url, method: 'POST', payload: user1 }).then((response) => {
        expect(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        expect(payload).toBeDefined();
        expect(payload.success).toBe(true);
      });
    });
  });

  afterAll(() => User.remove(id));
});

const statusDataForAllVersion = {
  type: 'routineInspection',
  deviceTypes: ['android', 'ios'],
  contents: 'routineInspection-test1',
  isActivated: true,
  deviceSemVersion: '*',
  appSemVersion: '*',
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 3600000),
};

const statusDataForRangedVersion = {
  type: 'routineInspection',
  deviceTypes: ['android'],
  contents: 'routineInspection-test2',
  isActivated: true,
  deviceSemVersion: '>=1.2.3 < 3.2.1',
  appSemVersion: '>=1.2.3 < 3.2.1',
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 3600000),
};

const check1 = { deviceType: 'android', deviceVersion: '1.2.2', appVersion: '3.3.3' };
const check2 = { deviceType: '*', deviceVersion: '*', appVersion: '*' };
const check3 = { deviceType: 'paper', deviceVersion: '1.2.3', appVersion: '3.4.5' };
const check4 = { deviceType: '*', deviceVersion: 'invalid-version', appVersion: 'invalid-version' };

describe('status', () => {
  describe('checkStatus', () => {
    let ids = [];

    const makeUrl = check => `${config.url.statusApiPrefix}/check?device_type=${check.deviceType}&device_version=${check.deviceVersion}&app_version=${check.appVersion}`;

    beforeAll(() => {
      return Promise.all([
        Status.add(statusDataForAllVersion),
        Status.add(statusDataForRangedVersion),
      ]).then((results) => {
        ids = results.map(result => result.data[0]._id);
      });
    });

    test('matches one', () => {
      return serverPromise.then((server) => {
        return server.inject({ url: makeUrl(check1) }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data).toBeDefined();
          expect(payload.data.length).toBeGreaterThan(0);
          expect(payload.data.some(item => statusDataForAllVersion.contents === item.contents)).toBeTruthy();
          expect(payload.data.some(item => statusDataForRangedVersion.contents === item.contents)).toBeFalsy();
        });
      });
    });

    test('matches all', () => {
      return serverPromise.then((server) => {
        return server.inject({ url: makeUrl(check2) }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data).toBeDefined();
          expect(payload.data.length).toBeGreaterThanOrEqual(2);
          expect(payload.data.some(item => statusDataForAllVersion.contents === item.contents)).toBeTruthy();
          expect(payload.data.some(item => statusDataForRangedVersion.contents === item.contents)).toBeTruthy();
        });
      });
    });

    test('matches nothing', () => {
      return serverPromise.then((server) => {
        return server.inject({ url: makeUrl(check3) }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data).toBeDefined();
          expect(payload.data.some(item => statusDataForAllVersion.contents === item.contents)).toBeFalsy();
          expect(payload.data.some(item => statusDataForRangedVersion.contents === item.contents)).toBeFalsy();
        });
      });
    });

    test('invalid version', () => {
      return serverPromise.then((server) => {
        return server.inject({ url: makeUrl(check4) }).then((response) => {
          expect(response.statusCode).toBe(400);
          const payload = JSON.parse(response.payload);
          expect(payload.code).toBe(400100);
          expect(payload.success).toBe(false);
        });
      });
    });

    afterAll(() => Promise.all(ids.map(id => Status.remove(id))));
  });
});
