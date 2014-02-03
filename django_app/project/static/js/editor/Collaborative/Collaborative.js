define([], function() {
    
    var collaborative_visible = false;
    var user_colors = new Array("#26642d", "#4e81e0", "#da6229", "#ad0c0c", "#cc76ac", "#1beadc", "#0a0101", "#ffff00", "#6d5050", "#703462");

    var initWebsocketEvents = function() {
        // When a list of connected users is received from the server
        socket.on("load_connected_users", function(data) {
            appendUserList(data);
        });

        // When a new user connects to the room
        socket.on("new_user_arrives", function(data) {
            console.log("A new user arrived");
            console.log(data);

            // Add the logged user to the right panel (connected users)
            appendNewUser(data);
        });

        // When a user is disconnected
        socket.on("user_disconnect", function(data) {
            console.log("Disconnected user ID: " + data);
            removeUser(data);
        });
    };

    // Append a list of connected users
    var appendUserList = function(list) {
        for ( i = 0; i < list.length; i++) {
            console.log(list[i]);
            appendNewUser(list[i]);
        }
    };

    // Append a new user to the list
    var appendNewUser = function(new_user_data) {
        if(collaborative_visible == false){
            showCollaborative();
        }
        
        var user = document.getElementById("user-" + new_user_data.id);
		    if (user == null) {
		    	var template = document.getElementById("template-user").innerHTML;
		    	var data = {
		    		'id': new_user_data.id,
		    		'first_name': new_user_data.first_name,
		    		'last_name': new_user_data.last_name
		    	};
		    	
		    	// Get number of connected users and assign a color
		    	var total = $("#user-list").children().length;
		    	data["color"] = user_colors[total];
		    	
		    	var view = Mustache.render(template, data);
//		        var view = document.getElementById("element-user").innerHTML;		       
//		        view = view.replace("[id]", new_user_data.id);
//		        view = view.replace("[first_name]", new_user_data.first_name);
//		        view = view.replace("[last_name]", new_user_data.last_name);
		        $user_list.innerHTML += view;
		    }        

    };

    // Remove a user from the list
    var removeUser = function(user_id) {
        user = $user_list.querySelector("#user-" + user_id);
        user.remove();
        
        // Check if it is the last collaborator
        if($user_list.children.length == 0){
            hideCollaborative();
        }
    };
    
    var showCollaborative = function(){
        console.log("Show collaborative box");
        $collaborative.style.display = "block";
        collaborative_visible = true;
    };
    
    var hideCollaborative = function(){
        console.log("hide collaborative box");
        $collaborative.style.display = "none";
        collaborative_visible = false;
    };    
    
    return{
        initWebsocketEvents:initWebsocketEvents,
        appendUserList:appendUserList,
        appendNewUser:appendNewUser,
        removeUser:removeUser
    };

});

