var util = require('util'),
    Db = require('mongodb/db').Db,
    ObjectID = require('mongodb/bson/bson').ObjectID,
    Server = require('mongodb/connection').Server,
    debugMode = false;
    
var debug = function(str) {
    if (debugMode) {
        console.log(str);
    }
};

LinkProvider = function(host, port) {
    host = host || 'localhost';
    port = port || 27017;
    this.db = new Db('harvestr', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(){});
};

LinkProvider.prototype = {
    getCollection: function(callback) {
        this.db.collection('links', function(err, collection) {
            if (err) {
                callback(err);
            } else {
                callback(null, collection);
            }
        });
    },
    
    findByUrl: function(url, callback, scope) {
        this.getCollection(function(err, collection) {
            if (err) {
                callback.call(scope, err);
            } else {
                debug('Finding ' + url);
                collection.findOne({"url": url}, {}, function(err, result) {
                    if (err) {
                        debug('findByUrl error.');
                        callback.call(scope, err);
                    } else {
                        debug('findByUrl no error.');
                        callback.call(scope, null, result);
                    }
                });
            }
        });
    },
    
    save: function(links, callback) {
        this.getCollection(function(err, collection) {
            if (err) {
                callback(err);
            } else {
                if (typeof(links.length) == "undefined") {
                    links = [links];
                }
                
                for (var i = 0, j = links.length; i < j; i++) {
                    link = links[i];
                    link.created_at = new Date();
                }
                
                collection.insert(links, function(){
                    callback(null, links);
                });
            }
        });
    },
    
    update: function(spec, updates, callback) {
        this.getCollection(function(err, collection) {
            if (err) {
                callback(err);
            } else {
                collection.update(spec, updates, function(){
                    callback(null, updates);
                });
            }
        });
    }
};

exports.LinkProvider = LinkProvider;