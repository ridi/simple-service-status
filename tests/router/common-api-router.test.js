/** global: jest */
/* global jest describe test expect beforeAll afterAll jasmine */

const fs = require('fs');
// Load local environments
if (fs.existsSync(`${__dirname}/../../.env`)) {
  require('node-env-file')(`${__dirname}/../../.env`);
}
process.env.PORT = 9000;

const Server = require('../../src/server');
const User = require('../../src/repository/User');
const config = require('../../src/config/server.config.js');

jest.dontMock('console');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;  // 10s

const serverPromise = Server.start();

const user1 = {
  username: 'testuser',
  password: 'testuser',
  isTemporary: false,
};

const validPassword = 'valid-password';
const shortPassword = 'short';

describe('User', () => {
  let id;
  const loginUrl = `${config.url.apiPrefix}/login`;
  const changePasswordUrl = `${config.url.apiPrefix}/passwords`;

  beforeAll(() => User.add(user1).then((result) => {
    id = result.data[0]._id;
  }));

  test('login success', () => {
    return serverPromise.then((server) => {
      return server.inject({ url: loginUrl, method: 'POST', payload: user1 }).then((response) => {
        expect(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        expect(payload).toBeDefined();
        expect(payload.success).toBe(true);
      });
    });
  });

  test('login fail', () => {
    return serverPromise.then((server) => {
      return server.inject({
        url: loginUrl,
        method: 'POST',
        payload: { username: user1.username, password: `no-${user1.password}` }
      }).then((response) => {
        expect(response.statusCode).toBe(401);
        const payload = JSON.parse(response.payload);
        expect(payload).toBeDefined();
        expect(payload.success).toBe(false);
       });
    });
  });

  test('change password', () => {
    return serverPromise.then((server) => {
      return server.inject({
        url: changePasswordUrl,
        method: 'PUT',
        payload: { password: validPassword },
        credentials: { username: 'testuser' },
      }).then((response) => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  test('change password without authentication', () => {
    return serverPromise.then((server) => {
      return server.inject({ url: changePasswordUrl, method: 'PUT', payload: { password: shortPassword } })
        .then((response) => {
          expect(response.statusCode).toBe(401);
        });
    });
  });

  test('change password with invalid password', () => {
    return serverPromise.then((server) => {
      return server.inject({
        url: changePasswordUrl,
        method: 'PUT',
        payload: { password: shortPassword },
        credentials: { username: 'testuser' },
      }).then((response) => {
        expect(response.statusCode).toBe(400);
      });
    });
  });

  afterAll(() => User.remove(id));
});
