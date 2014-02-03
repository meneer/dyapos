// Modules
var app = require("http").createServer(handler);
var url = require("url");
var io = require("socket.io").listen(app);
var port = process.env.PORT || 5000;

// Import Slide and Component classes
var Slide = require("./Slide");
var Component = require("./Component");

function handler(request, response) {
    if (request.url !== "/favicon.ico") {
        // parse the requested URL to a string
        request_url = url.parse(request.url).path;

        console.log("HTTP Request " + request_url);

        if (request_url === "/") {
        	response.writeHead(200, {'Content-Type': 'text/plain'});
        	response.write("Hello World!");
        	response.end();
        }
    }
};

app.listen(port);


// Websockets

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// when user connects to the server...
io.sockets.on("connection", function(socket) {

    // set a variable to store the presentation ID where the user is connected
    var presentation_id,
    	room = null;
    // set a variable to store the user database
    var user_data = {};

    // when the "presentation_id" is received from client side...
    socket.on("collaborator_connect", function(data) {
		console.log("Collaborator connected!!!");
        presentation_id = data.presentation_id;
        room = "room-" + presentation_id;
        console.log("RECEIVED presentation_id = " + presentation_id);
		socket.first_name = data.user_data.first_name;
		socket.last_name = data.user_data.last_name;
		socket.username = data.user_data.username;
        console.log("RECEIVED user data");

		// Join to a room
        socket.join(room);

        // Load connected users to the same session
        var users = io.sockets.clients(room);
        var user_list = new Array();
        for(i=0; i<users.length; i++){
			// If user is not me
			if(users[i].id != socket.id){
				user_list.push({
		    		"id": users[i].id,
		    		"first_name": users[i].first_name,
		    		"last_name": users[i].last_name,
		    		"username": users[i].username,
		    	});
			}
        }

       	socket.emit("load_connected_users", user_list);

        // Send user connection to another users connected to the same room
	    socket.broadcast.to(room).emit("new_user_arrives", {
	    	"id": socket.id,
	    	"first_name": socket.first_name,
	    	"last_name": socket.last_name,
	    });
    });

    socket.on("disconnect", function(){
    	console.log("Disconnected user ID: " + socket.id);
    	socket.broadcast.to(room).emit("user_disconnect",socket.id);
    	socket.leave("room-"+presentation_id);
    });

    // SLIDE EVENTS:

    // when a new slide is created...
    socket.on('slide:create', function(data, callback) {
        console.log("CREATE");
        console.log(data);
        // assign the "presentation_id" to the data fields
        data.presentation_id = presentation_id;

        // create the new slide to the database
        var s = new Slide();
        s.add(data, function(id) {
            // send the created "_id" to the client side (browser)
            callback(null, {
                _id : id
            });

            // broadcast
            socket.broadcast.to(room).emit("broadcast_add_slide", data);
        });
    });

    // when a slide is modified...
    socket.on("slide:update", function(data, callback) {
        console.log("UPDATE");
        console.log(data);

        // assign the "presentation_id" to the data fields
        data.presentation_id = presentation_id;

        // update the slide to the database
        var s = new Slide();
        s.update(data, function(results) {

        });

        // broadcast
        socket.broadcast.to(room).emit("broadcast_update_slide", data);

    });

    // when a slide is deleted...
    socket.on("slide:delete", function(data, callback) {
        console.log("DELETE");
        console.log(data);

        // delete the slide from database
        var s = new Slide(), c = new Component();
        s.remove(data._id, function(results) {
			socket.broadcast.to(room).emit("broadcast_delete_slide", data._id);
        });
    });

    // when the presentation editor loads...
    socket.on("slides:read", function(data, callback) {
        console.log("READ");

        // load the slides from the database
        var s = new Slide();

        s.loadAll(presentation_id, function(results) {
            // send the collection to the client side (browser)
            callback(null, results);
        });
    });

    // Load a single slide
    socket.on("slide:read", function(data, callback) {
        console.log("READ");

        // load the slide from the database
        var s = new Slide();

        s.load(data._id, function(result) {
            // send the slide to the client side (browser)
            callback(null, result);
        });
    });

    // COMPONENT EVENTS:

    // when a new component is created...
    socket.on("component:create", function(data, callback) {
        console.log("Component CREATE");
        console.log(data);

        // create the new component to the database
        var c = new Component();
        c.add(data, function(id) {
            // send the created "_id" to the client side
            callback(null, {
                _id : id
            });

            // broadcast
            socket.broadcast.to(room).emit("broadcast_add_component", data);
        });
    });

    // when a component is modified...
    socket.on("component:update", function(data, callback) {
        console.log("UPDATE");
        console.log(data);

        // // assign the "presentation_id" to the data fields
        // data.presentation_id = presentation_id;

        // update the modified component to the database
        var c = new Component();
        c.update(data, function(results) {

        });

        // broadcast
        socket.broadcast.to(room).emit("broadcast_update_component", data);
    });

    // when a component is deleted...
    socket.on("component:delete", function(data, callback) {
        console.log("DELETE");
        console.log(data);

        // delete the component from the database
        var c = new Component();
        c.remove(data, function(results) {
			socket.broadcast.to(room).emit("broadcast_delete_component", data._id);
        });
    });

    // // get a component collection (when the presentation editor es loaded)...
    // socket.on("components:read", function(data, callback) {
        // console.log("READ");
//
        // // load the components from the database
        // var c = new Component();
        // c.loadAll(presentation_id, function(results) {
            // // send the collection to the client side
            // callback(null, results);
        // });
    // });
//
    // // Load a single component
    // socket.on("component:read", function(data, callback) {
        // console.log("READ");
//
        // // load the slide from the database
        // var c = new Component();
//
        // c.load(data._id, function(result) {
            // // send the component to the client side (browser)
            // callback(null, result);
        // });
    // });

    // CHAT EVENTS
    socket.on("send_chat_message", function(data){
    	console.log("Chat message received: " + data);
    	io.sockets.in(room).emit("receive_chat_message", {
    		"first_name": socket.first_name,
    		"last_name": socket.last_name,
    		"username": socket.username,
    		"message": data
    	});
    });

});
