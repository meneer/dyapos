var database = require("./database");
var ObjectID = require('mongodb').ObjectID;

var Component = function() {  
    // create a new component
    this.add = function(component, callback) {
        database.connectMongoDB(function(db) {
        	objectID = new ObjectID(component.slide);
        	db.collection("slides").findOne({_id: objectID}, function(err, slide){

			// Generate a component _id as a string because if I use ObjectId()
			// it causes problems when updating subdocuments
			component["_id"] = new ObjectID().toString();
			delete component.slide;
			
			slide.components.push(component);
						
			db.collection("slides").save(slide, function(err, results){
				callback(component._id);
			});			
        	});        	
        });
    };
    // update the data of an existing component
    this.update = function(component, callback) {
        database.connectMongoDB(function(db) {
			delete component.slide;
            
			db.collection("slides").update({"components._id": component._id}, {$set: {"components.$": component}}, function(err, results){
				console.log(results);
                db.close();
                callback(results);				
			});            

        });
    };
    // remove a slide within a presentation
    this.remove = function(component, callback) {
        database.connectMongoDB(function(db) {
			db.collection("slides").update({"components._id": component._id}, {$pull: {"components": {"_id": component._id }}}, function(err, results){
                db.close();
                callback(results);				
			});
        });
    };
};

module.exports = Component
