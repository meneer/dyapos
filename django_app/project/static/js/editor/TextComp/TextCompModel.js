define(["ComponentModel"], function(ComponentModel) {
	
	var model = ComponentModel.extend({
		defaults : {
			type : "text",
			text_type : new String(),
			content : new String(),
			font : "",
			font_size : "",
			color : "",
			bold : false,
			italic : false,
			underlined : false,
		},
		// Methods
		setAsURL : function(selected_text) {

		},
		toHTML : function() {
			var style = "";
			var container_style = "";
			var template = document.getElementById("template-" + this.get("type") + "-component").innerHTML;
			var data = {
				"cid" : this.cid,
				"text_type" : this.get("text_type"),
				"content" : this.get("content")
			};
			//        view = $("#element-" + this.get("type") + "-component").html();
			//        view = view.replace("[cid]", this.cid);
			//        view = view.replace("[content]", this.get("content"));

			for (attr_name in this.attributes) {
				value = this.attributes[attr_name];

				switch(attr_name) {
					case "bold":
						if (value == true) {
							style += "font-weight:bold;";
						}
						break;
					case "italic":
						if (value == true) {
							style += "font-style:italic;";
						}
						break;
					case "underlined":
						if (value == true) {
							style += "text-decoration:underline;";
						}
						break;
					case "color":
						style += "color:" + value + ";";
						break
					case "font_size":
						if (value != "") {
							// style += "font-size:" + value + "px;";
							style += "font-size:" + value + "em;";
						}
						break;
					case "pos_x":
						container_style += "left:" + value + "px;";
						break;
					case "pos_y":
						container_style += "top:" + value + "px;";
						break;
				}
			}

			data["style"] = style;
			data["container_style"] = container_style;
			//        view = view.replace("[style]", style);
			//        view = view.replace("[container_style]", container_style);

			var view = Mustache.render(template, data);

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
