define(["ComponentModel"], function(ComponentModel) {
	var model = ComponentModel.extend({
		defaults : {
			type : "image",
			file : new String(),
			external_url : new String(),
			size : 40, //Default 40% in relation to the slide container
		},
		// Methods
		loadImage : function() {

		},
		toHTML : function() {
			var container_style = "";
			var template = document.getElementById("template-image-component").innerHTML;
			var data = {
				'cid' : this.cid,
			};

			// if an image file is already set
			if (this.get("file") != "") {
				data["url"] = media_url + "images/" + this.get("file");
			}else{
				data["url"] = this.get("external_url");
			}

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
			// console.log(view);

			// If the component is new
			if (this.id == undefined) {
				$("#" + selected_slide).append(view);
			} else {
				$("#" + this.get("slide").cid).append(view);
			}
			
			$("#" + this.cid).draggable();
		},
	});
	_.extend(model.prototype.defaults, ComponentModel.prototype.defaults);
	
	return model;

});
