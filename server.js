/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO 1 minute caching (query=>key)
 * // TODO findAll, save => authentication
 */

'use strict';

const Hapi = require('hapi');
const hapiAuthCookie = require('hapi-auth-cookie');

const apiRouter = require('./lib/server-api');
const baseRouter = require('./lib/server-auth');

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8080 });

server.register(hapiAuthCookie, (err) => {
    if (err) {
        throw err;
    }

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
    server.app.cache = cache;

    server.auth.strategy('session', 'cookie', true, {
        password: 'password-should-be-32-characters',
        cookie: 'sid-example',
        redirectTo: '/login',
        isSecure: false,
        validateFunc: function (request, session, callback) {

            cache.get(session.sid, (err, cached) => {

                if (err) {
                    return callback(err, false);
                }

                if (!cached) {
                    return callback(null, false);
                }

                return callback(null, true, cached.account);
            });
        }
    });

    server.route(apiRouter);
    server.route(baseRouter);

    // Start the server
    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});

