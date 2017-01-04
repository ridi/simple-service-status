/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const Status = require('./../repository/Status');
const StatusType = require('../repository/StatusType');
const util = require('../util');

function view(request, reply, childViewName, context) {
  const ctx = context || {};
  ctx.childComponentName = childViewName;
  if (request.auth) {
    ctx.auth = {
      isAuthenticated: request.auth.isAuthenticated,
      username: request.auth.credentials ? request.auth.credentials.username : undefined,
    };
  }
  ctx.state = `window.state = ${JSON.stringify(ctx)}`;
  return reply.view('Layout', ctx);
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => Promise.all([
      Status.find({ endTime: { $gt: new Date() } }, { endTime: -1, startTime: -1, isActivated: -1 }),
      StatusType.find(),
    ]).then(([items, statusTypes]) => view(request, reply, 'StatusList', { items: util.formatDates(items), statusTypes }))
      .catch(error => view(request, reply, 'Error', { error })),
  },
  {
    method: 'GET',
    path: '/login',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/');
      }
      return view(request, reply, 'Login');
    },
    config: {
      auth: {
        mode: 'try',
      },
    },
  },
  {
    method: 'GET',
    path: '/logout',
    handler: (request, reply) => reply.redirect('/login').unstate('token'),
  },
];

