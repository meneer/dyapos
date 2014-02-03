define(["Component"], function(Component){

	var addLink = function(link){
		
	};
	
	//Event functions
	
	var onClickAddLinkBtn = function(event){
		var link = document.getElementById("video-link").value;
		console.log(link);
		var url_id = link.split("v=");
		url_id = url_id[1].split("&");
		url_id = url_id[0];
		$("#add-video-box").foundation("reveal","close");
		Component.insert({
			"type": "video",
			"website": "youtube",
			"url_id": url_id,
            "pos_x": clicked_inside_slide_point.left,
            "pos_y": clicked_inside_slide_point.top,
		});
	};
	
	return{
		addLink : addLink,
		onClickAddLinkBtn : onClickAddLinkBtn,
	};

});