
'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const co = require('co');
const Status = require('./lib/Status');
const mongorito = require('mongorito');

const server = new Hapi.Server();
server.connection({ port: ~~process.env.PORT || 8000 });

let handlers = {
    getStatus: (request, reply) => {
        Status
            .get(request.params.deviceType, request.params.deviceVersion, request.params.appVersion)
            .then(function (result) {
                console.log(result);
                reply(result);
            }).catch(function (err) {
                reply(err);
            });
    },
    addStatus: (request, reply) => {
        Status
            .save(request.params)
            .then(function (result) {
                reply(result);
            }).catch(function (err) {
                reply(err);
            });
    },
    test: (request, reply) => {
        Status
            .test()
            .then(function (result) {
                reply(result);
            }).catch(function (err) {
            reply(err);
        });
    }
};

let validators = {
    checkStatus: {
        query: {
            deviceType: Joi.string().required(),
            deviceVersion: Joi.string().regex(/^[0-9\.\*]+$/).required(),
            appVersion: Joi.string().regex(/^[0-9\.\*]+$/).required()
        }
    },
    addStatus: {
        params: {

        }
    }
};

server.route({method: 'GET', path: '/status', handler: handlers.getStatus, config: {validate: validators.getStatus}});
server.route({method: 'GET', path: '/test', handler: handlers.test});
server.route({method: 'POST', path: '/status', handler: handlers.addStatus, config: {validate: validators.addStatus}});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});