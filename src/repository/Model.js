/**
 * Abstract Model class interacting with MongoDB
 *
 * @since 1.0.0
 */

const config = require('../config/server.config');

const url = process.env.MONGODB_URI || config.defaults.mongoDBUrl;

const co = require('co');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

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
    const self = this;
    return co(function* () {
      const db = yield MongoClient.connect(url);
      const collection = db.collection(self.collection);
      const result = yield fn.call(self, collection);
      yield db.close();
      return result;
    }).catch((err) => {
      console.error(err);
      throw err;
    });
  }

  find(params, sort) {
    return this.runQuery(collection => collection.find(params || {}).sort(sort || {}).toArray());
  }

  save(model) {
    if (model._id) {
      model._id = ObjectID(model._id);
    }
    return this.runQuery(collection => collection.save(model));
  }
}

module.exports = Model;
