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

  find(query, sort, skip, limit) {
    return this.runQuery((collection) => {
      const cursor = collection.find(query || {}).sort(sort || {});
      if (typeof skip !== 'undefined' || typeof limit !== 'undefined') {
        cursor.skip(skip).limit(limit);
      }
      return cursor.toArray();
    });
  }

  count(query) {
    return this.runQuery(collection => collection.count(query || {}));
  }

  save(model) {
    if (model._id) {
      model._id = ObjectID(model._id);
    }
    return this.runQuery(collection => collection.save(model));
  }

  update(id, model) {
    return this.runQuery(collection => collection.update({ _id: ObjectID(id) }, { $set: model }));
  }

  remove(id) {
    return this.runQuery(collection => collection.remove({ _id: ObjectID(id) }));
  }
}

module.exports = Model;
