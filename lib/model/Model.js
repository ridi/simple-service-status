/**
 * Abstract Model class interacting with MongoDB
 *
 * @since 1.0.0
 */

'use strict';

const url = process.env.MONGODB_URI || 'mongodb://localhost';

const co = require('co');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

/**
 * @class
 * @classdesc basic interactions with selected collection
 */
class Model {

    constructor(collection) {
        if (new.target === Model) {
            throw new TypeError('Cannot construct Model instances directly');
        }

        this.collection = collection || this.constructor.name.toLowerCase();
    }

    runQuery(fn) {
        var self = this;
        return co(function* () {
            var db = yield MongoClient.connect(url);
            var collection = db.collection(self.collection);
            var result = yield fn.call(this, collection);
            yield db.close();
            return result;
        }).catch(function (err) {
            console.error(err);
            throw err;
        });
    }

    find(params) {
        return this.runQuery(function* (collection) {
            return collection.find(params || {}).toArray();
        });
    }

    save(model) {
        return this.runQuery(function* (collection) {
            return collection.insertOne(model);
        });
    }
}

module.exports = Model;