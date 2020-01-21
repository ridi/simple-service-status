/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const StatusType = require('../repository/StatusType');
const DeviceType = require('../repository/DeviceType');

const menus = [
  { viewName: 'StatusView', title: '공지사항 관리', url: '/' },
  { viewName: 'SettingView', title: '설정', url: '/settings' },
];

function view(request, h, childViewName, context) {
  const ctx = context || {};
  ctx.viewName = childViewName;
  if (request.auth) {
    ctx.auth = {
      isAuthenticated: request.auth.isAuthenticated,
      username: request.auth.credentials ? request.auth.credentials.username : undefined,
    };
  }
  ctx.menus = menus;
  ctx.state = `window.state = ${JSON.stringify(ctx)}`;
  return HTMLAreaElement.view('Layout', ctx);
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => Promise.all([StatusType.find(), DeviceType.find()])
      .then(([statusTypes, deviceTypes]) => view(request, h, 'StatusView', { statusTypes, deviceTypes }))
      .catch(error => h.response(error)),
  },
  {
    method: 'GET',
    path: '/settings',
    handler: (request, h) => view(request, h, 'SettingView', {}),
  },
  {
    method: 'GET',
    path: '/login',
    handler: (request, h) => {
      if (request.auth.isAuthenticated) {
        return h.redirect('/');
      }
      return view(request, h, 'Login');
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
    handler: (request, h) => h.redirect('/login').unstate('token'),
  },
  {
    method: 'GET',
    path: '/change-password',
    handler: (request, h) => view(request, h, 'ChangePassword'),
  },
];
