/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const uuid = require('uuid/v4');

// FIXME remove it!
const users = {
    admin: {
        id: 'admin',
        password: 'admin',
        name: 'admin',
        role: 'WRITE'
    }
};

const home = function (request, reply) {
    reply('<html><head><title>Login page</title></head><body><h3>Welcome ' +
        request.auth.credentials.name +
        '!</h3><br/><form method="get" action="/logout">' +
        '<input type="submit" value="Logout">' +
        '</form></body></html>');
};

const login = function (request, reply) {

    if (request.auth.isAuthenticated) {
        return reply.redirect('/');
    }

    let message = '';
    let account = null;

    if (request.method === 'post') {

        if (!request.payload.username ||
            !request.payload.password) {

            message = 'Missing username or password';
        }
        else {
            account = users[request.payload.username];
            if (!account ||
                account.password !== request.payload.password) {

                message = 'Invalid username or password';
            }
        }
    }

    if (request.method === 'get' ||
        message) {

        return reply('<html><head><title>Login page</title></head><body>' +
            (message ? '<h3>' + message + '</h3><br/>' : '') +
            '<form method="post" action="/login">' +
            'Username: <input type="text" name="username"><br>' +
            'Password: <input type="password" name="password"><br/>' +
            '<input type="submit" value="Login"></form></body></html>');
    }

    const sid = String(uuid());
    request.server.app.cache.set(sid, { account: account }, 0, (err) => {

        if (err) {
            reply(err);
        }

        request.cookieAuth.set({ sid: sid });
        return reply.redirect('/');
    });
};

const logout = function (request, reply) {

    request.cookieAuth.clear();
    return reply.redirect('/');
};

module.exports = [
    { method: 'GET', path: '/', config: { handler: home } },
    { method: ['GET', 'POST'], path: '/login', config: { handler: login, auth: { mode: 'try' }, plugins: { 'hapi-auth-cookie': { redirectTo: false } } } },
    { method: 'GET', path: '/logout', config: { handler: logout } }
];