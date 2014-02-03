var database = require("./database");
var ObjectID = require('mongodb').ObjectID;

var Slide = function() {
    // load all the slides from the selected presentation
    this.loadAll = function(presentation_id, callback) {
        database.connectMongoDB(function(db) {
            db.collection("slides").find({
                "presentation_id" : presentation_id
            }).sort({ number: 1 }).toArray(function(err, results) {
                db.close();
                callback(results);
            });
        });
    };
    // load a single slide from the selected presentation
    this.load = function(id, callback) {
		objectID = new ObjectID(id);
        database.connectMongoDB(function(db) {
            db.collection("slides").find({
                "_id" : objectID
            }).toArray(function(err, results) {
                db.close();
                console.log(results);
                callback(results[0]);
            });
        });
    };    
    // create a new slide
    this.add = function(fields, callback) {
        database.connectMongoDB(function(db) {
            db.collection("slides").insert(fields, function(err, results) {
                db.close();
                callback(results[0]._id);
            });
        });
    };    
    // update the data of an existing slide
    this.update = function(fields, callback) {
        database.connectMongoDB(function(db) {
            objectID = new ObjectID(fields._id);
            // because I can't overwrite an "_id" in MongoDB, so I must delete it
            delete fields._id;

            db.collection("slides").update({
                "_id" : objectID
            }, fields, function(err, results) {
                db.close();
                callback(results);
            });
        });
    };
    // remove a slide within a presentation
    this.remove = function(slide_id, callback) {
        database.connectMongoDB(function(db) {
            db.collection("slides").remove({
                "_id" : new ObjectID(slide_id)
            }, function(err, results) {
                db.close();
                callback(results);
            });
        });
    };
};

module.exports = Slide;
