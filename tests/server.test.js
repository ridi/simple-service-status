/* global describe test expect beforeAll afterAll */

// Load local environments
require('node-env-file')(`${__dirname}/../.env`);
const Server = require('../src/server');
const Status = require('../src/repository/Status');
const config = require('../src/config/server.config');

const serverPromise = Server.start();

const statusDataForAllVersion = {
  type: 'routineInspection',
  deviceTypes: ['android'],
  contents: 'routineInspection-test1',
  isActivated: true,
  deviceSemVersion: '*',
  appSemVersion: '*',
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 3600),
};

const statusDataForRangedVersion = {
  type: 'routineInspection',
  deviceTypes: ['android'],
  contents: 'routineInspection-test2',
  isActivated: true,
  deviceSemVersion: '>=1.2.3 || < 3.2.1',
  appSemVersion: '>=1.2.3 || < 3.2.1',
  startTime: new Date(),
  endTime: new Date(new Date().getTime() + 3600),
};

const check = {
  deviceType: 'android',
  deviceVersion: '1.2.2',
  appVersion: '3.3.3',
};

describe('status CRUD', () => {
  let id;
  const url = `${config.url.statusApiPrefix}/check?device_type=${check.deviceType}&device_version=${check.deviceVersion}&app_version=${check.appVersion}`;

  describe('checkStatus', () => {
    beforeAll(() => Status.add(statusDataForAllVersion).then((result) => {
      id = result.data[0]._id;
    }));

    test('checkStatus', () => {
      return serverPromise.then((server) => {
        return server.inject({ url }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload).toBeDefined();
          expect(payload.length).toBeGreaterThan(0);
          expect(payload.some(item => statusDataForAllVersion.contents === item.contents)).toBeTruthy();
          expect(payload.some(item => statusDataForRangedVersion.contents === item.contents)).toBeFalsy();
        });
      });
    });

    afterAll(() => Status.remove(id));
  });
});
