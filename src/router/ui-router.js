/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const Status = require('./../repository/Status');
const StatusType = require('../repository/StatusType');
const DeviceType = require('../repository/DeviceType');
const util = require('../util');

const menus = [
  { viewName: 'StatusList', title: '공지사항 관리', url: '/' },
  { viewName: 'Settings', title: '설정', url: '/settings' },
];

function view(request, reply, childViewName, context) {
  const ctx = context || {};
  ctx.viewName = childViewName;
  if (request.auth) {
    ctx.auth = {
      isAuthenticated: request.auth.isAuthenticated,
      username: request.auth.credentials ? request.auth.credentials.username : undefined,
    };
  }
  ctx.state = `window.state = ${JSON.stringify(ctx)}`;
  ctx.menus = menus;
  return reply.view('Layout', ctx);
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => Promise.all([
      Status.find({ endTime: { $gt: new Date() } }, { endTime: -1, startTime: -1, isActivated: -1 }, 0, 10),
      Status.count({ endTime: { $gt: new Date() } }),
      StatusType.find(),
      DeviceType.find(),
    ]).then(([items, totalCount, statusTypes, deviceTypes]) => view(request, reply, 'StatusList', { items: util.formatDates(items), totalCount, statusTypes, deviceTypes }))
      .catch(error => view(request, reply, 'Error', { error })),
  },
  {
    method: 'GET',
    path: '/settings',
    handler: (request, reply) => Promise.all([
      StatusType.find(),
      DeviceType.find(),
    ]).then(([statusTypes, deviceTypes]) => view(request, reply, 'Settings', { statusTypes, deviceTypes }))
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

