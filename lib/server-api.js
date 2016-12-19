/**
 * Service API router
 *
 * @since 1.0.0
 *
 * // TODO findAll, save => authentication
 */

'use strict';

const Joi = require('joi');
const Status = require('./model/Status');

let handlers = {
    getStatus: (request, reply) => {
        Status.find(request.query.deviceType || '*', request.query.deviceVersion || '*', request.query.appVersion || '*')
            .then(function (result) {
                console.log(result);
                reply(result);
            }).catch(function (err) {
            reply(err);
        });
    },
    addStatus: (request, reply) => {
        Status.save(request.params)
            .then(function (result) {
                reply(result);
            }).catch(function (err) {
            reply(err);
        });
    },
    test: (request, reply) => {
        Status.test()
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

module.exports = [
    {method: 'GET', path: '/status', handler: handlers.getStatus, config: {validate: validators.getStatus}},
    {method: 'GET', path: '/test', handler: handlers.test},
    {method: 'POST', path: '/status', handler: handlers.addStatus, config: {validate: validators.addStatus}}
];
