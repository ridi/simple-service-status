/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const URL = require('url');

const User = require('./../model/User');
const Status = require('./../model/Status');
const util = require('./../util');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => Status.findAll({ isActivated: -1, startTime: -1, endTime: -1 })
      .then(items => reply.view('list', {
        items,
        columns: ['deviceType', 'deviceVersion', 'appVersion', 'startTime', 'endTime', 'type', 'contents', 'isActivated'],
        auth: request.auth
      }))

      .catch(error => reply.view('error', {
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
      return reply.view('login');
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
        return reply.view('login', { errorMessage: 'Missing username or password' });
      }
      const account = User.find(request.payload.username);
      // TODO PASSWORD 암호화
      if (!account || account.password !== request.payload.password) {
        return reply.view('login', { errorMessage: 'Invalid username or password' });
      }
      const redirectUrl = URL.parse(request.info.referrer, true).query.redirect;
      return reply()
        .state('token', util.generateToken(account), { path: '/', ttl: 24 * 60 * 60 * 1000, isSecure: false })
        .redirect(redirectUrl || '/');
    },
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/logout',
    handler: (request, reply) => reply.redirect('/').unstate('token'),
  },
];

