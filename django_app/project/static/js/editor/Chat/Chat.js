define([], function() {

    var initWebsocketEvents = function() {
        socket.on("receive_chat_message", function(data) {
            appendMessage(data);
        });
    };

    var sendMessage = function(event) {
        var text_box = event.target.querySelector("#message-text"), message = text_box.value;
        //If message is not empty
        if (message !== "" && message !== null) {
            socket.emit("send_chat_message", message);
            text_box.value = "";
        }
        event.preventDefault();
    };

    var appendMessage = function(data) {
    	var template = document.getElementById("template-chat-message").innerHTML;
    	var data = {
    		'first_name': data.first_name,
    		'last_name': data.last_name,
    		'message': data.message
    	};
		var view = Mustache.render(template, data);
        $message_list.innerHTML += view;
    };

    return {
        initWebsocketEvents : initWebsocketEvents,
        sendMessage : sendMessage,
        appendMessage : appendMessage
    };

});
