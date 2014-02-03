define(["ComponentModel"], function(ComponentModel) {
	return Backbone.RelationalModel.extend({
		relations : [{
			type : Backbone.HasMany,
			key : 'components',
			relatedModel : ComponentModel, // I referenced it by an object instead of a string because of a Require.js problem
			collectionType : 'ComponentCollection',
			reverseRelation : {
				key : 'slide',
				includeInJSON : '_id'
			}
		}],
		defaults : {
			pos_x : 0,
			pos_y : 0,
			rotation_x : 0,
			rotation_y : 0,
			rotation_z : 0,
			scale : 1,
			number : 0,
		},
		urlRoot : "slide",
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
				};
				
				// this.updateThumbnail();
			}, this);
		},
		// Methods
		toHTML : function() {
			// Add to slides list panel
			var template = document.getElementById("template-slide-mini").innerHTML;
			var data = {
				'id' : this.cid
			};
			var view = Mustache.render(template, data);
			// $slides_list.innerHTML += view;
			$($slides_list).append(view);

			//Generate an editor screen for the created slide
			template = document.getElementById("template-slide").innerHTML;
			data = {
				'id' : this.cid,
				'data-x' : parseInt(this.get("pos_x")),
				'data-y' : parseInt(this.get("pos_y")),
				'data-scale' : parseFloat(this.get("scale")),
				'data-rotate-z' : parseInt(this.get("rotation_z")),
				'data-rotate-x' : parseInt(this.get("rotation_x")),
				'data-rotate-y' : parseInt(this.get("rotation_y"))
			};
			view = Mustache.render(template, data);

			$("#slides").append(view);

			// //Generate thumbnail
			// _Slide.updateThumbnail(cid);

			selected_slide = this.cid;
			impress().initStep(document.getElementById(this.cid));
		},

		updateThumbnail : function() {
			console.log("Thumbnail updated");
			var slide = document.getElementById(this.cid);
			var slide_mini = document.getElementById("slide-"+this.cid).getElementsByClassName("slide-mini-preview")[0];

			// Set the background color
			var background_color = null;
			if (slide.style.backgroundColor == "") {
				background_color = $("body").css("background-color");
			} else {
				background_color = slide.style.backgroundColor;
			}

			var number = this.get("number");
			html2canvas(slide, {
				background : background_color,
				onrendered : function(canvas) {
					canvas.style.width = "100%";
					slide_mini.innerHTML = "";
					slide_mini.appendChild(canvas);

					//If thumbnail corresponds to the first slide
					if (number == 0 && !is_anonymous) {
						console.log("Update presentation thumbnail");
						//Update presentation thumbnail to server
						var url = "/update-thumbnail";
						var image = canvas.toDataURL("image/png");
						$.post(url, {
							"presentation_id" : p_id,
							"image" : image
						});
					}
				},
			});
		},
		updatePositionToMap : function() {

		},
		switchPosition : function() {

		},
		rotateX : function(degrees) {
			this.set("rotation_x", degrees);
		},
		rotateY : function(degrees) {
			this.set("rotation_y", degrees);
		},
		rotateZ : function(degrees) {
			this.set("rotation_z", degrees);
		},
		//Received from the dragstop event
		move : function(x, y) {
			this.set({
				pos_x : x,
				pos_y : y
			});
		},
		scale : function() {

		},
		setDuration : function(seconds) {

		},
	});

});
