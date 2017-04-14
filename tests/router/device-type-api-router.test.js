/** global: jest */
/* global jest describe test expect beforeAll afterAll jasmine */

// Load local environments
require('dotenv').config();
process.env.PORT = 9003;

const Server = require('../../src/server');
const DeviceType = require('../../src/repository/DeviceType');
const config = require('../../src/config/server.config.js');

jest.dontMock('console');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;  // 10s

const serverPromise = Server.start();

const deviceTypeToBeAdded = {
  label: 'TestLabel',
  value: 'TestValue',
};

const deviceTypeToBeAdded2 = {
  label: 'TestLabel2',
  value: 'TestValue2',
};

describe('deviceType', () => {
  describe('device type CRUD', () => {
    const url = config.url.deviceTypeApiPrefix;

    test('add device type', () => {
      return serverPromise.then((server) => {
        const add1 = server.inject({
          url,
          method: 'POST',
          payload: deviceTypeToBeAdded,
          credentials: { username: 'admin' },
        });
        const add2 = server.inject({
          url,
          method: 'POST',
          payload: deviceTypeToBeAdded2,
          credentials: { username: 'admin' },
        });
        return Promise.all([add1, add2]).then(([response1, response2]) => {
          expect(response1.statusCode).toBe(200);
          const payload1 = JSON.parse(response1.payload);
          expect(payload1.data[0].label).toBe(deviceTypeToBeAdded.label);
          expect(payload1.data[0].value).toBe(deviceTypeToBeAdded.value);
          deviceTypeToBeAdded.id = payload1.data[0].id;

          expect(response2.statusCode).toBe(200);
          const payload2 = JSON.parse(response2.payload);
          expect(payload2.data[0].label).toBe(deviceTypeToBeAdded2.label);
          expect(payload2.data[0].value).toBe(deviceTypeToBeAdded2.value);
          deviceTypeToBeAdded2.id = payload2.data[0].id;
        });
      });
    });

    test('add duplicated device type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url,
          method: 'POST',
          payload: {
            label: deviceTypeToBeAdded.label,
            value: deviceTypeToBeAdded.value,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(409);
        });
      });
    });

    test('get device type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url,
          method: 'GET',
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data.length).toBeGreaterThanOrEqual(2);
          expect(payload.data).toContainEqual(deviceTypeToBeAdded);
          expect(payload.data).toContainEqual(deviceTypeToBeAdded2);
        });
      });
    });

    test('update device type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${deviceTypeToBeAdded2.id}`,
          method: 'PUT',
          payload: {
            label: `${deviceTypeToBeAdded2.label}-updated`,
            value: `${deviceTypeToBeAdded2.value}-updated`,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(deviceTypeToBeAdded2.id);
          return payload;
        }).then(payload => DeviceType.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result.length).toBe(1);
            expect(result[0].label).toBe(`${deviceTypeToBeAdded2.label}-updated`);
            expect(result[0].value).toBe(`${deviceTypeToBeAdded2.value}-updated`);
          });
      });
    });

    test('update duplicate device type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${deviceTypeToBeAdded2.id}`,
          method: 'PUT',
          payload: {
            label: deviceTypeToBeAdded.label,
            value: deviceTypeToBeAdded.value,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(409);
        });
      });
    });

    test('remove device type', () => {
      return serverPromise.then((server) => {
        const remove1 = server.inject({
          url: `${url}/${deviceTypeToBeAdded.id}`,
          method: 'DELETE',
          credentials: { username: 'admin' },
        });
        const remove2 = server.inject({
          url: `${url}/${deviceTypeToBeAdded2.id}`,
          method: 'DELETE',
          credentials: { username: 'admin' },
        });

        return Promise.all([remove1, remove2]).then(([response1, response2]) => {
          expect(response1.statusCode).toBe(200);
          const payload1 = JSON.parse(response1.payload);
          expect(payload1.success).toBe(true);
          expect(payload1.data[0].id).toBe(deviceTypeToBeAdded.id);

          expect(response2.statusCode).toBe(200);
          const payload2 = JSON.parse(response2.payload);
          expect(payload2.success).toBe(true);
          expect(payload2.data[0].id).toBe(deviceTypeToBeAdded2.id);
        });
      });
    });
  });
});
