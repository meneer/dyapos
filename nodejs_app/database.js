var MongoClient = require('mongodb').MongoClient;
var mongodb_url = process.env.MONGODB_URL || "mongodb://localhost:27017/test";

// connect to MongoDB Database
var connectMongoDB = function(callback) {
    MongoClient.connect(mongodb_url, function(err, db) {
        if (err) {
            return console.dir(err);
        }
        // when connection is ready, execute a callback function
        callback(db);
    });
};    

module.exports.connectMongoDB = connectMongoDB;
