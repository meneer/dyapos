define(["Slide", "TextCompModel"], function(Slide, TextCompModel) {

	var model = Backbone.RelationalModel.extend({
		subModelTypes : {
			"text" : "TextCompModel",
			"image" : "ImageCompModel",
			"video" : "VideoCompModel",
		},
		defaults : {
			pos_x : 0,
			pos_y : 0,
			rotation : 0,
			scale : new Number(),
			custom_css : new String(),
		},
		urlRoot : "component",
		idAttribute : "_id",
		initialize : function() {

			this.on("change", function() {
				if (!is_anonymous) {
					if (!_.isEmpty(this.changed) && !this.changed.hasOwnProperty("_id")) {
						if (!updatedFromServer) {
							console.log("Slide changed");
							this.save();
						} else {
							updatedFromServer = false;
						}
					}
				}

				this.get("slide").updateThumbnail();
			}, this);
		},
		// Methods
	});

	return model;

});
