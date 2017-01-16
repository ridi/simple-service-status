/* global jest describe test expect beforeAll afterAll */

const fs = require('fs');
// Load local environments
if (fs.existsSync(`${__dirname}/../.env`)) {
  require('node-env-file')(`${__dirname}/../.env`);
}

const Server = require('../src/server');
const User = require('../src/repository/User');
const Status = require('../src/repository/Status');
const config = require('../src/config/server.config');
const util = require('../src/common/util');
const moment = require('moment');

jest.dontMock('console');

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

  test('login success', () => {
    return serverPromise.then((server) => {
      return server.inject({ url, method: 'POST', payload: user1 }).then((response) => {
        expect(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        expect(payload).toBeDefined();
        expect(payload.success).toBe(true);
      });
    });
  });

  test('login fail', () => {
    return serverPromise.then((server) => {
      return server.inject({ url, method: 'POST', payload: { username: 'testuser', password: 'no-testuser' } }).then((response) => {
        expect(response.statusCode).toBe(401);
        const payload = JSON.parse(response.payload);
        expect(payload).toBeDefined();
        expect(payload.success).toBe(false);
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

const statusDataToBeAdded = {
  type: 'routineInspection',
  device_types: ['android', 'ios'],
  contents: 'routineInspection-added1',
  is_activated: true,
  device_sem_version: '*',
  app_sem_version: '*',
  start_time: moment().format(),
  end_time: moment().add(2, 'hours').format(),
};

const statusDataToBeUpdated = {
  type: 'routineInspection',
  device_types: ['paper', 'ios'],
  contents: 'routineInspection-added1-updated1',
  is_activated: true,
  device_sem_version: '>=1.2.3',
  app_sem_version: '>=4.5.6 || =1.2.3',
  start_time: moment().format(),
  end_time: moment().add(3, 'hours').format(),
};

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

  describe('status CRUD', () => {
    const url = config.url.statusApiPrefix;

    test('add status', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url,
          method: 'POST',
          payload: statusDataToBeAdded,
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].contents).toBe(statusDataToBeAdded.contents);
          statusDataToBeAdded.id = payload.data[0].id;
        });
      });
    });

    test('update status', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusDataToBeAdded.id}`,
          method: 'PUT',
          payload: statusDataToBeUpdated,
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(statusDataToBeAdded.id);
          return payload;
        }).then(payload => Status.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result.length).toBe(1);
            expect(result[0].contents).toBe(statusDataToBeUpdated.contents);
            expect(result[0].deviceTypes).toEqual(statusDataToBeUpdated.device_types);
            expect(result[0].deviceSemVersion).toBe(statusDataToBeUpdated.device_sem_version);
            expect(result[0].appSemVersion).toBe(statusDataToBeUpdated.app_sem_version);
            expect(moment(result[0].startTime).format()).toBe(statusDataToBeUpdated.start_time);
            expect(moment(result[0].endTime).format()).toBe(statusDataToBeUpdated.end_time);
          });
      });
    });

    test('deactivate status', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusDataToBeAdded.id}/deactivate`,
          method: 'PUT',
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(statusDataToBeAdded.id);
          return payload;
        }).then(payload => Status.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result.length).toBe(1);
            expect(result[0].isActivated).toBe(false);
          });
      });
    });

    test('activate status', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusDataToBeAdded.id}/activate`,
          method: 'PUT',
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(statusDataToBeAdded.id);
          return payload;
        }).then(payload => Status.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result.length).toBe(1);
            expect(result[0].isActivated).toBe(true);
          });
      });
    });

    test('remove status', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusDataToBeAdded.id}`,
          method: 'DELETE',
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(statusDataToBeAdded.id);
        });
      });
    });
  });
});
