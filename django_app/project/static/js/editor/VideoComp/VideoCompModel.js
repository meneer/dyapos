define(["ComponentModel"], function(ComponentModel) {

	var model = ComponentModel.extend({
		defaults : {
			type : "video",
			website : new String(),
			url_id : new String(),
			size : 40, //Default 40% in relation to the slide container
		},
		// Methods
		toHTML : function() {
			var container_style = "";
			var template = document.getElementById("template-video-component").innerHTML;
			var data = {
				'cid' : this.cid
			};

			//Get the link from the url_ID
			var link = "www.youtube.com/embed/" + this.get("url_id");

			data["link"] = link;

			for (attr_name in this.attributes) {
				var value = this.attributes[attr_name];

				switch(attr_name) {
					case "pos_x":
						container_style += "left:" + value + "px;";
						break
					case "pos_y":
						container_style += "top:" + value + "px;";
						break
					case "size":
						container_style += "width:" + value + "%;";
						break
				}
			}
			data["container_style"] = container_style;

			var view = Mustache.render(template, data);

			// If the component is new
			if (this.id == undefined) {
				$("#" + selected_slide).append(view);
			}else {
				$("#" + this.get("slide").cid).append(view);
			}
			
			$("#" + this.cid).draggable();
		},
	});
	_.extend(model.prototype.defaults, ComponentModel.prototype.defaults);
	
	return model;

});
