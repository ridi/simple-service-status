/** global: jest */
/* global jest describe test expect beforeAll afterAll jasmine */

// Load local environments
require('dotenv').config();
process.env.PORT = 9002;

const Server = require('../../src/server');
const StatusType = require('../../src/repository/StatusType');
const config = require('../../src/config/server.config.js');

jest.dontMock('console');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;  // 20s

const serverPromise = Server.start();

const statusTypeToBeAdded = {
  label: 'TestLabel',
  value: 'TestValue',
  template: '<ul><li>first</li><li>second</li><li>third</li></ul>',
};

const statusTypeToBeAdded2 = {
  label: 'TestLabel2',
  value: 'TestValue2',
  template: '<ul><li>first</li><li>second</li><li>third</li></ul>',
};

describe('statusType', () => {
  describe('status type CRUD', () => {
    const url = config.url.statusTypeApiPrefix;

    test('add status type', () => {
      return serverPromise.then((server) => {
        const add1 = server.inject({
          url,
          method: 'POST',
          payload: statusTypeToBeAdded,
          credentials: { username: 'admin' },
        });
        const add2 = server.inject({
          url,
          method: 'POST',
          payload: statusTypeToBeAdded2,
          credentials: { username: 'admin' },
        });
        return Promise.all([add1, add2]).then(([response1, response2]) => {
          expect(response1.statusCode).toBe(200);
          const payload1 = JSON.parse(response1.payload);
          expect(payload1.data[0].template).toBe(statusTypeToBeAdded.template);
          expect(payload1.data[0].label).toBe(statusTypeToBeAdded.label);
          expect(payload1.data[0].value).toBe(statusTypeToBeAdded.value);
          statusTypeToBeAdded.id = payload1.data[0].id;

          expect(response2.statusCode).toBe(200);
          const payload2 = JSON.parse(response2.payload);
          expect(payload2.data[0].template).toBe(statusTypeToBeAdded2.template);
          expect(payload2.data[0].label).toBe(statusTypeToBeAdded2.label);
          expect(payload2.data[0].value).toBe(statusTypeToBeAdded2.value);
          statusTypeToBeAdded2.id = payload2.data[0].id;
        });
      });
    });

    test('add duplicated status type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url,
          method: 'POST',
          payload: {
            label: statusTypeToBeAdded.label,
            value: statusTypeToBeAdded.value,
            template: statusTypeToBeAdded.template,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(409);
        });
      });
    });

    test('get status type', () => {
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
          expect(payload.data).toContainEqual(statusTypeToBeAdded);
          expect(payload.data).toContainEqual(statusTypeToBeAdded2);
        });
      });
    });

    test('update status type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusTypeToBeAdded2.id}`,
          method: 'PUT',
          payload: {
            label: `${statusTypeToBeAdded2.label}-updated`,
            value: `${statusTypeToBeAdded2.value}-updated`,
            template: statusTypeToBeAdded2.template,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(200);
          const payload = JSON.parse(response.payload);
          expect(payload.success).toBe(true);
          expect(payload.data[0].id).toBe(statusTypeToBeAdded2.id);
          return payload;
        }).then(payload => StatusType.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result.length).toBe(1);
            expect(result[0].template).toBe(statusTypeToBeAdded2.template);
            expect(result[0].label).toBe(`${statusTypeToBeAdded2.label}-updated`);
            expect(result[0].value).toBe(`${statusTypeToBeAdded2.value}-updated`);
          });
      });
    });

    test('unset/set template of the status type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusTypeToBeAdded2.id}`,
          method: 'PUT',
          payload: {
            label: `${statusTypeToBeAdded2.label}-updated2`,
            value: `${statusTypeToBeAdded2.value}-updated2`,
          },
          credentials: { username: 'admin' },
        })
          .then((response) => {
            expect(response.statusCode).toBe(200);
            return JSON.parse(response.payload);
          })
          .then(payload => StatusType.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result[0].template).toBeUndefined();
          })
          .then(() => server.inject({
            url: `${url}/${statusTypeToBeAdded2.id}`,
            method: 'PUT',
            payload: {
              label: `${statusTypeToBeAdded2.label}-updated3`,
              value: `${statusTypeToBeAdded2.value}-updated3`,
              template: statusTypeToBeAdded2.template,
            },
            credentials: { username: 'admin' },
          }))
          .then((response) => {
            expect(response.statusCode).toBe(200);
            return JSON.parse(response.payload);
          })
          .then(payload => StatusType.find({ _id: payload.data[0].id }))
          .then((result) => {
            expect(result[0].template).toBe(statusTypeToBeAdded2.template);
          });
      });
    });

    test('update duplicate status type', () => {
      return serverPromise.then((server) => {
        return server.inject({
          url: `${url}/${statusTypeToBeAdded2.id}`,
          method: 'PUT',
          payload: {
            label: statusTypeToBeAdded.label,
            value: statusTypeToBeAdded.value,
          },
          credentials: { username: 'admin' },
        }).then((response) => {
          expect(response.statusCode).toBe(409);
        });
      });
    });

    test('remove status type', () => {
      return serverPromise.then((server) => {
        const remove1 = server.inject({
          url: `${url}/${statusTypeToBeAdded.id}`,
          method: 'DELETE',
          credentials: { username: 'admin' },
        });
        const remove2 = server.inject({
          url: `${url}/${statusTypeToBeAdded2.id}`,
          method: 'DELETE',
          credentials: { username: 'admin' },
        });

        return Promise.all([remove1, remove2]).then(([response1, response2]) => {
          expect(response1.statusCode).toBe(200);
          const payload1 = JSON.parse(response1.payload);
          expect(payload1.success).toBe(true);
          expect(payload1.data[0].id).toBe(statusTypeToBeAdded.id);

          expect(response2.statusCode).toBe(200);
          const payload2 = JSON.parse(response2.payload);
          expect(payload2.success).toBe(true);
          expect(payload2.data[0].id).toBe(statusTypeToBeAdded2.id);
        });
      });
    });
  });
});
