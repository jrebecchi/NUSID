var MongoClient = require('mongodb').MongoClient;

module.exports = function(options) {

  var db;
  var collections = {};

  function nop() {}

  this.connect = function connect(cb) {
    cb = cb || nop;
    var connectionString = 'mongodb://' +
      (options.hostname || 'localhost') + ':' +
      (options.port || '27017') + '/' +
      (options.database || 'user_management');
    MongoClient.connect(connectionString, function(err, database) {
      if (err) {
        cb(err);
        return;
      }
      db = database;
      cb(null);
    });
  };

  this.disconnect = function disconnect(cb) {
    db.close(cb);
  };

  this.loadCollection = function loadCollection(collection, cb) {
    cb = cb || nop;
    db.collection(collection, function(err, col) {
      if (err) {
        cb(err);
        return;
      }
      collections[collection] = col;
      cb(err);
    });
  };

  this.create = function create(collection, document, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to read from unknown collection "' + collection + '"');
      return;
    }
    col.insert(document, { w: 1 }, cb);
  };

  this.find = function find(collection, filter, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to read from unknown collection "' + collection + '"');
      return;
    }
    col.findOne(filter, cb);
  };

  this.findAll = function findAll(collection, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to read from unknown collection "' + collection + '"');
      return;
    }
    col.find({}).toArray(function(err, items) {
      if (err) {
        cb(err);
        return;
      }
      cb(null, items);
    });
  };

  this.update = function update(collection, filter, updates, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to read from unknown collection "' + collection + '"');
      return;
    }
    col.update(filter, { $set: updates }, { w: 1 }, cb);
  };

  this.delete = function _delete(collection, filter, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to read from unknown collection "' + collection + '"');
      return;
    }
    col.remove(filter, { w: 1 }, cb);
  };

  this.dropCollection = function dropCollection(collection, cb) {
    cb = cb || nop;
    var col = collections[collection];
    if (!col) {
      cb('Attempt to drop an unknown collection "' + collection + '"');
      return;
    }
    col.drop(cb);
  };

};