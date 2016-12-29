/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const URL = require('url');

const User = require('./../repository/User');
const Status = require('./../repository/Status');
const StatusType = require('../repository/StatusType');

const util = require('./../util');

function view(reply, childViewName, context) {
  const ctx = context || {};
  ctx.childComponentName = childViewName;
  ctx.state = `window.state = ${JSON.stringify(ctx)}`;
  return reply.view('Layout', ctx);
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => Promise.all([
      Status.findAll({ isActivated: -1, startTime: -1, endTime: -1 }),
      StatusType.find(),
    ]).then(([items, statusTypes]) => {
      const context = {
        items,
        statusTypes,
        auth: {
          isAuthenticated: request.auth.isAuthenticated,
          username: request.auth.credentials.username,
        },
      };
      return view(reply, 'StatusList', context);
    }).catch(error => reply.view('Error', {
      error,
      auth: request.auth,
    })),
  },
  {
    method: 'GET',
    path: '/login',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/');
      }
      return view(reply, 'Login');
    },
    config: {
      auth: { mode: 'try' },
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: (request, reply) => {
      if (!request.payload.username || !request.payload.password) {
        return reply.view('Login', { errorMessage: 'Missing username or password' });
      }
      User.find(request.payload.username).then((account) => {
        // TODO PASSWORD 암호화
        if (!account || account.password !== request.payload.password) {
          return view(reply, 'Login', { errorMessage: 'Invalid username or password' });
        }
        const redirectUrl = URL.parse(request.info.referrer, true).query.redirect;
        return reply()
          .state('token', util.generateToken(account), { path: '/', ttl: 24 * 60 * 60 * 1000, isSecure: false })
          .redirect(redirectUrl || '/');
      });
    },
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/logout',
    handler: (request, reply) => reply.redirect('/login').unstate('token'),
  },
];

