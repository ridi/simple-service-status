/**
 * Abstract Model class interacting with MongoDB
 *
 * @since 1.0.0
 */

const co = require('co');
const mongodb = require('mongodb');
const config = require('../config/server.config');
const RidiError = require('../common/Error');

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const url = process.env.MONGODB_URI || config.defaults.mongoDBUrl;

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
    }).then(list => list.map((item) => {
      item._id = item._id.toHexString();
      return item;
    })).catch((error) => {
      console.error(error);
      throw new RidiError(RidiError.Types.DB);
    });
  }

  count(query) {
    return this.runQuery(collection => collection.count(query || {}))
      .catch((error) => {
        console.error(error);
        throw new RidiError(RidiError.Types.DB);
      });
  }

  add(model) {
    return this.runQuery(collection => collection.insertOne(model))
      .then(result => ({ data: result.ops }))
      .catch((error) => {
        console.error(error);
        throw new RidiError(RidiError.Types.DB);
      });
  }

  update(id, model) {
    return this.runQuery(collection => collection.updateOne({ _id: ObjectID(id) }, { $set: model }))
      .then(result => ({ data: [{ _id: id }], count: result.result.nModified }))
      .catch((error) => {
        console.error(error);
        throw new RidiError(RidiError.Types.DB);
      });
  }

  remove(id) {
    return this.runQuery(collection => collection.deleteOne({ _id: ObjectID(id) }))
      .then(result => ({ data: [{ _id: id }], count: result.result.n }))
      .catch((error) => {
        console.error(error);
        throw new RidiError(RidiError.Types.DB);
      });
  }
}

module.exports = Model;
