var Db = require('mongodb/db').Db,
    ObjectID = require('mongodb/bson/bson').ObjectID,
    Server = require('mongodb/connection').Server;

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
    
    findByUrl: function(url, callback) {
        this.getCollection(function(err, collection) {
            if (err) {
                callback(err);
            } else {
                console.log('Found collection ' + collection.collectionName);
                collection.findOne({"url": url}, function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
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
    }
};

exports.LinkProvider = LinkProvider;