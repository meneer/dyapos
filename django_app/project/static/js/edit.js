require(["config"], function(){
	
Mustache.tags = ["[[","]]"];

// GLOBAL FUNCTIONS

getTransformValue = function(element, property) {
	var values = element.style[css_transform].split(")");
	for (var key in values) {
		var val = values[key];
		var prop = val.split("(");
		if (prop[0].trim() == property)
			return parseFloat(prop[1]);
	}
	return false;
};

translate3DToArray = function(value) {
	value = value.toString();
	var pattern = /([0-9-]+)+(?![3d]\()/gi;
	return value.match(pattern);
};

getSupportedCSSProp = function(proparray) {
	var root = document.documentElement;
	//reference root element of document
	for (var i = 0; i < proparray.length; i++) {//loop through possible properties
		if (proparray[i] in root.style) {//if property exists on element (value will be string, empty string if not set)
			return proparray[i];
			//return that string
		}
	}
};

addEventToClass = function(className, event, callback) {
	var classObjects = document.getElementsByClassName(className);
	for ( i = 0; i < classObjects.length; i++) {
		classObjects[i].addEventListener(event, callback);
	}
};

// GLOBAL VARIABLES
slides = null;
components = null;
last_position = {};
map_trans3d = new Array();
slide_trans3d = new Array();
//Get CSS prefixes according to the browser render engine
css_transform = getSupportedCSSProp(["webkitTransform", "MozTransform", "OTransform"]);
css_transition = getSupportedCSSProp(["webkitTransition", "MozTransition", "OTransition"]);

selected_slide_position = 0;

//cid of the selected slide
selected_slide = null;
//cid of the selected component
selected_component = null;

slide_edit_mode = false;

clicked_slide = null;

//Previous selected color before appling a new color from the colorpicker
previous_color = null;

//selected color from the colorpicker (hexadecimal)
selected_color = null;

slides_map_opened = false;
slides_imgs = {};

// Set a variable that controls whether last change was made from server or not
updatedFromServer = false;

//Connect to socket.io
if(!is_anonymous){
	socket = io.connect(nodejs_url);
	
	socket.emit("collaborator_connect", {
		presentation_id : p_id,
		user_data : {
			"first_name" : user_first_name,
			"last_name" : user_last_name,
			"username" : user_username,
		}
	});
}

$(document).ready(function() {	

	// DOM nodes
	$impress = document.getElementById("impress");
	$slides_list = document.getElementById("slides-list");
	$btn_delete_slide = document.getElementById("tn-delete-slide");
	$input_scale = document.getElementById("input-scale");
	$input_rotation_z = document.getElementById("input-rotation-z");
	$input_rotation_x = document.getElementById("input-rotation-x");
	$input_rotation_y = document.getElementById("input-rotation-y");
	$slide_options = document.getElementById("slide-options");
	$new_component_box = document.getElementById("new-component-box");
	$add_image_box = document.getElementById("add-image-box");
	$themes_btn = document.getElementById("themes-btn");
	$themes_window = document.getElementById("themes-window");
	$user_list = document.getElementById("user-list");
	$chat_form = document.getElementById("chat-form");
	$message_list = document.getElementById("message-list");
	$collaborative = document.getElementById("collaborative");

	// default_title_text = document.getElementById("default-title-text").value;
	// default_subtitle_text = document.getElementById("default-subtitle-text").value;
	// default_body_text = document.getElementById("default-body-text").value;

	require(['EditorLoader']);

});
	
	
});
