define(["Component", "Mode", "SlideModel", "module", "exports"], function(Component, Mode, SlideModel, module, exports) {

	var initWebsocketEvents = function() {

//DO NOT DELETE
		// //Receive a new slide from server
		// socket.on("broadcast_add_slide", function(data) {
			// console.log("received new slide:");
			// console.log(data);
			// insert(data);
		// });
// 
		// //Receive a slide removal from server
		// socket.on("broadcast_delete_slide", function(data) {
			// console.log("received delete slide");
			// console.log(data);
			// var cid = slides.where({"_id": data})[0].cid;
			// deleteSlide(cid, false);
		// });
// 
		// //Receive a slide update from server
		// socket.on("broadcast_update_slide", function(data) {
			// console.log("received update slide");
			// console.log(data);
			// updatedFromServer = true;
// 
			// var cid = slides.where({"_id": data._id})[0].cid;
			// var slide = slides.get(cid);
// 
			// // Determine what property has changed
// 
			// var changedPosition = parseInt(data.pos_x) !== parseInt(slide.get("pos_x")) || parseInt(data.pos_y) !== parseInt(slide.get("pos_y"));
			// var changedSlideScale = parseFloat(data.scale) !== parseFloat(slide.get("scale"));
			// var changedRotationZ = parseInt(data.rotation_z) !== parseInt(slide.get("rotation_z"));
			// var changedRotationX = parseInt(data.rotation_x) !== parseInt(slide.get("rotation_x"));
			// var changedRotationY = parseInt(data.rotation_y) !== parseInt(slide.get("rotation_y"));
// 
			// //Check what properties have changed
			// if (changedPosition) {
				// console.log("Position changed");
				// changePosition(cid, data.pos_x, data.pos_y);
			// } else if (changedSlideScale) {
				// console.log("Slide scale changed");
				// changeScale(cid, data.scale);
			// } else if (changedRotationZ) {
				// console.log("Rotation Z changed");
				// changeRotationZ(cid, data.rotation_z);
			// } else if (changedRotationX) {
				// console.log("Rotation X changed");
				// changeRotationX(cid, data.rotation_x);
			// } else if (changedRotationY) {
				// console.log("Rotation Y changed");
				// changeRotationY(cid, data.rotation_y);
			// }
// 
		// });
	};

	//Load all (slides and components when editor is opened)
	var loadAll = function() {
		if (!is_anonymous) {
			//Load from server

			slides.sync("read", slides, {
				success : function(data) {
					console.log("Data received from server: ");
					console.log(data);
					//If presentation doesn't have any slides (first time opened)
					if (data.length == 0) {
						//Insert first slide
						insert();
					} else {
						// for ( i = 0; i < data.length; i++) {
							// console.log(data[i]);
							// insert(data[i]);
						// }
						slides = new SlideCollection(data);
						for ( i = 0; i < slides.length; i++) {
							slides.at(i).toHTML();
							for ( j = 0; j < slides.at(i).get("components").length; j++) {
								slides.at(i).get("components").at(j).toHTML();
							}
						}
						changeSelected(slides.at(0).cid);
						
						setTimeout(loadThumbnails, 3000);
					}
					// Component.loadAll();
				}
			});
		} else {
			//Load from local web storage
			if (localStorage.slides == undefined || localStorage.slides == "[]") {
				// If it is the first time the editor is opened, so create a first slide
				insert();
			} else {
				slides = new SlideCollection(JSON.parse(localStorage.slides));
				for ( i = 0; i < slides.length; i++) {
					slides.at(i).toHTML();
					for ( j = 0; j < slides.at(i).get("components").length; j++) {
						slides.at(i).get("components").at(j).toHTML();
					}
				}
				changeSelected(slides.at(0).cid);
				
				setTimeout(loadThumbnails, 3000);
			}
		}
	};

	//Insert a new slide
	var insert = function(data) {
		if (data == null) {
			//If the first Slide is inserted manually
			if (slides.length == 0) {
				slides.add(new SlideModel());
			} else {
				// If it isn't the first slide, calculate coordinates based on the last slide
				slides.add(new SlideModel({
					pos_x : parseInt(slides.at(slides.length - 1).get("pos_x")) + 1000,
					pos_y : parseInt(slides.at(slides.length - 1).get("pos_y")),
					number : slides.length
				}));
			}
		} else {
			// delete data.components;
			//If data is loaded from the server or local web storage
			slides.add(new SlideModel(data));			
		}

		position = slides.length - 1;
		cid = slides.at(position).cid;

		slides.get(cid).toHTML();
		
		if(slides.last().isNew() && !is_anonymous){
			//Save the last inserted slide to the database
			slides.last().save();					
		}

		changeSelected(cid);
	};

	//Change the selected slide
	var changeSelected = function(cid) {
		var from = slides.indexOf(slides.get(selected_slide));
		selected_slide = cid;
		selected_slide_position = slides.indexOf(slides.get(cid));
		// $("#slide-"+selected_slide).addClass("selected");
		// Mode.goToNavigationEditMode();
		moveToSlide(from, selected_slide_position);
	};

	var moveToSlide = function(from, to) {
		$input_scale.value = slides.at(to).get("scale");
		$input_rotation_z.value = slides.at(to).get("rotation_z");
		$input_rotation_x.value = slides.at(to).get("rotation_x");
		$input_rotation_y.value = slides.at(to).get("rotation_y");
		hideSlideOptionsBox();
		impress().goto(slides.at(to).cid);

		//Change to slide edit mode
		Mode.goToSlideEditMode();
	};

	var goNext = function() {
		console.log("Go to next");
		var next = slides.get(selected_slide).get("number") + 1;
		next = next < slides.length ? slides.where({number:next})[0].cid : slides.where({number:0})[0].cid;
		selected_slide = next;
		impress().goto(next);
	};

	var goPrevious = function() {
		console.log("Go to previous");
		var previous = slides.get(selected_slide).get("number") - 1;
		previous = previous >= 0 ? slides.where({number:previous})[0].cid : slides.where({number:slides.length-1})[0].cid;
		selected_slide = previous;
		impress().goto(previous);
	};

	//Delete slide from server
	var deleteSlide = function(cid, from_server) {
		//Decide whether remove from server or client
		from_server = ( typeof from_server == "undefined") ? true : false;

		console.log(from_server);
		//Remove slide-mini
		$("#" + cid).remove();
		//        slides.remove(cid);
		$("#slide-" + cid).remove();
		//Remove slide-map-draggable
		// $("#slide-drag-" + cid).remove();

		hideSlideOptionsBox();

		if (from_server == true) {
			//Remove from server and collection
			slides.get(cid).destroy();
		} else {
			//Remove from collection only
			slides.remove(cid);
		}
	};

	var changePosition = function(cid, pos_x, pos_y) {
		var slide = document.getElementById(cid);
		slide.dataset.x = pos_x;
		slide.dataset.y = pos_y;
		impress().initStep(document.getElementById(cid));

		slides.get(cid).set({
			"pos_x" : pos_x,
			"pos_y" : pos_y
		});
	};

	// Change the order of the slides
	var updateSlidesOrder = function() {

		$("#slides-list > .slide-mini").each(function(index) {
			var cid = this.id.replace("slide-", "");
			slides.get(cid).set("number", index);
		});

	};

	var changeScale = function(cid, scale) {
		console.log(scale);
		var slide = document.getElementById(cid);
		slide.dataset.scale = scale;
		impress().initStep(slide);
		slides.get(selected_slide).set("scale", scale);
	};

	var changeRotationZ = function(cid, degrees) {
		var slide = document.getElementById(cid);
		slide.dataset.rotateZ = degrees;
		impress().initStep(slide);
		slides.get(selected_slide).set("rotation_z", degrees);
	};

	var changeRotationX = function(cid, degrees) {
		var slide = document.getElementById(cid);
		slide.dataset.rotateX = degrees;
		impress().initStep(slide);
		slides.get(selected_slide).set("rotation_x", degrees);
	};

	var changeRotationY = function(cid, degrees) {
		var slide = document.getElementById(cid);
		slide.dataset.rotateY = degrees;
		impress().initStep(slide);
		slides.get(selected_slide).set("rotation_y", degrees);
	};

	var showSlideOptionsBox = function() {
		// $slide_options.style.left = event.clientX + "px";
		// $slide_options.style.top = event.clientY + "px";
		$slide_options.style.display = "block";
	};

	var hideSlideOptionsBox = function() {
		$slide_options.style.display = "none";
	};

	var updateThumbnail = function(slide_cid) {
		// console.log("Update thumbnail from slide cid: " + slide_cid);
		// var slide = document.getElementById(slide_cid);
		// var slide_mini = document.getElementById("slide-"+slide_cid).getElementsByClassName("slide-mini-preview")[0];
		//
		// // Set the background color
		// var background_color = null;
		// if (slide.style.backgroundColor == "") {
		// background_color = $("body").css("background-color");
		// } else {
		// background_color = slide.style.backgroundColor
		// }
		//
		// html2canvas(slide, {
		// background : background_color,
		// onrendered : function(canvas) {
		// canvas.style.width = "100%";
		// slide_mini.innerHTML = "";
		// slide_mini.appendChild(canvas);
		//
		// //If thumbnail corresponds to the first slide
		// if (slide_cid == "c1") {
		// //Update presentation thumbnail to server
		// generatePresentationThumbnail();
		// }
		// },
		// });
	};

	var loadThumbnails = function() {
		// for ( i = 0; i < slides.length; i++) {
			// updateThumbnail(slides.at(i).cid);
		// }
		slides.each(function(slide){
			slide.updateThumbnail();
		});
	};
	
	var saveAllToLocalStorage = function(){
		setTimeout(function() {
			localStorage.slides = JSON.stringify(slides.toJSON());
			saveAllToLocalStorage();
		}, 5000);		
	};

	// Event functions

	var onClick = function(event) {
		console.log("event: slide click");
		selected_slide = event.target.id;
		$("#" + selected_slide).addClass("selected");
		$(".step").removeClass("active");
		$("#" + selected_slide).addClass("active");
		showSlideOptionsBox(event);
	};

	var onClickDeleteBtn = function(event) {
		event.stopPropagation();
		deleteSlide(clicked_slide.id);
	};

	var onClickDeleteBtnSlideMini = function(event) {
		event.stopPropagation();
		$(".tooltip").css("display", "none");

		var cid = event.currentTarget.id.replace("delete-", "");
		deleteSlide(cid);
	};

	var onMousedown = function(event) {
		event.stopPropagation();
		if (event.target.classList[0] == "step") {
			$(".step").removeClass("selected");
			clicked_slide = event.target;
			clicked_slide.classList.add("selected");
			console.log("mousedown on slide");
			last_x = event.clientX;
			last_y = event.clientY;
			transform_style = event.target.style[css_transform];
			slide_trans3d = event.target.style[css_transform].split("translate3d");
			slide_trans3d = slide_trans3d[slide_trans3d.length - 1];
			slide_trans3d = translate3DToArray(slide_trans3d);

			document.addEventListener("mousemove", onMove);
			document.addEventListener("mouseup", onMouseup);
		}
	};

	var onMove = function(event) {
		event.stopPropagation();
		var movement = 7;

		//get the difference from last position to this position
		var deltaX = last_x - event.clientX
		var deltaY = last_y - event.clientY;

		//check which direction had the highest amplitude and then figure out direction by checking if the value is greater or less than zero

		if (deltaX > 0) {
			// If the movement is to left
			slide_trans3d[0] = parseInt(slide_trans3d[0]) - movement;
		} else if (deltaX < 0) {
			// If the movement is to right
			slide_trans3d[0] = parseInt(slide_trans3d[0]) + movement;
		}

		if (deltaY > 0) {
			// If the movement is to up
			slide_trans3d[1] = parseInt(slide_trans3d[1]) - movement;
		} else if (deltaY < 0) {
			// If the movement is to down
			slide_trans3d[1] = parseInt(slide_trans3d[1]) + movement;
		}

		last_x = event.clientX;
		last_y = event.clientY;

		// apply movement to CSS style
		transform_style = transform_style.replace(/translate3d\(.+?\)/g, "translate3d(" + slide_trans3d[0] + "px," + slide_trans3d[1] + "px,0px)");
		clicked_slide.style[css_transform] = transform_style;
	};

	var onMouseup = function(event) {
		event.stopPropagation();
		console.log("mouseup slide");
		document.removeEventListener("mousemove", onMove);
		document.removeEventListener("mouseup", onMouseup);
		clicked_slide.dataset.x = slide_trans3d[0];
		clicked_slide.dataset.y = slide_trans3d[1];
		impress().initStep(clicked_slide);
		changePosition(clicked_slide.id, clicked_slide.dataset.x, clicked_slide.dataset.y);
	};

	var onRotateZ = function(event) {
		var degreesZ = event.target.value;
		var slide = clicked_slide;
		var style = slide.style[css_transform];
		style = style.replace(/rotateZ\(.+?\)/g, "rotateZ(" + degreesZ + "deg)");
		slide.style[css_transform] = style;
		slide.dataset.rotateZ = degreesZ;
	};

	var onRotateX = function(event) {
		var degreesX = event.target.value;
		var slide = clicked_slide;
		var style = slide.style[css_transform];
		style = style.replace(/rotateX\(.+?\)/g, "rotateX(" + degreesX + "deg)");
		slide.style[css_transform] = style;
		slide.dataset.rotateX = degreesX;
	};

	var onRotateY = function(event) {
		var degreesY = event.target.value;
		var slide = document.getElementById(selected_slide);
		var style = slide.style[css_transform];
		style = style.replace(/rotateY\(.+?\)/g, "rotateY(" + degreesY + "deg)");
		slide.style[css_transform] = style;
		slide.dataset.rotateY = degreesY;
	};

	var onScale = function(event) {
		var scale = event.target.value;
		var style = clicked_slide.style[css_transform];
		style = style.replace(/scale\(.+?\)/g, "scale(" + scale + ")");
		clicked_slide.style[css_transform] = style;
		clicked_slide.dataset.scale = scale;
	};

	var onClickInsideSlide = function(event) {
		event.stopPropagation();
		console.log("event: click on slide");
		var offSet = $(this).offset();

		// Set a global variable to store the inside point where the slide was clicked
		clicked_inside_slide_point = {
			"left" : parseFloat(event.clientX - $(this).offset().left),
			"top" : parseFloat(event.clientY - $(this).offset().top),
		};

		console.log("Clicked on point: " + clicked_inside_slide_point.left + " " + clicked_inside_slide_point.top);

		Component.deselectAll();
		Component.showNewComponentBox();
	};

	var onClickEditBtn = function(event) {
		changeSelected(clicked_slide.id);
		// hideSlideOptionsBox();
	};

	var onKeyup = function(event) {
		event.stopPropagation();

		switch( event.keyCode ) {
			case 33:
			// pg up
			case 37:
			// left
			case 38:
				// up
				goPrevious();
				break;
			case 9:
			// tab
			case 32:
			// space
			case 34:
			// pg down
			case 39:
			// right
			case 40:
				// down
				goNext();
				break;
			case 27:
				//Escape
				Mode.exitFromPreviewMode();
				break;
		}

		event.preventDefault();

	};

	// module.exports = {
	// initWebsocketEvents : initWebsocketEvents,
	// loadAll : loadAll,
	// insert : insert,
	// changeSelected : changeSelected,
	// deleteSlide : deleteSlide,
	// changePosition : changePosition,
	// updateSlidesOrder : updateSlidesOrder,
	// moveToSlide : moveToSlide,
	// changeScale : changeScale,
	// changeRotationZ : changeRotationZ,
	// changeRotationX : changeRotationX,
	// changeRotationY : changeRotationY,
	// showSlideOptionsBox : showSlideOptionsBox,
	// hideSlideOptionsBox : hideSlideOptionsBox,
	// updateThumbnail : updateThumbnail,
	// loadThumbnails : loadThumbnails,
	// goNext : goNext,
	// goPrevious : goPrevious,
	// onClick : onClick,
	// onMousedown : onMousedown,
	// onClickDeleteBtn : onClickDeleteBtn,
	// onClickDeleteBtnSlideMini : onClickDeleteBtnSlideMini,
	// onMove : onMove,
	// vonMouseup : onMouseup,
	// onRotateZ : onRotateZ,
	// onRotateX : onRotateX,
	// onRotateY : onRotateY,
	// onScale : onScale,
	// onClickInsideSlide : onClickInsideSlide,
	// onClickEditBtn : onClickEditBtn,
	// onKeyup : onKeyup,
	// };

	exports.initWebsocketEvents = initWebsocketEvents;
	exports.loadAll = loadAll;
	exports.insert = insert;
	exports.changeSelected = changeSelected;
	exports.deleteSlide = deleteSlide;
	exports.changePosition = changePosition;
	exports.updateSlidesOrder = updateSlidesOrder;
	exports.moveToSlide = moveToSlide;
	exports.changeScale = changeScale;
	exports.changeRotationZ = changeRotationZ;
	exports.changeRotationX = changeRotationX;
	exports.changeRotationY = changeRotationY;
	exports.showSlideOptionsBox = showSlideOptionsBox;
	exports.hideSlideOptionsBox = hideSlideOptionsBox;
	exports.updateThumbnail = updateThumbnail;
	exports.loadThumbnails = loadThumbnails;
	exports.saveAllToLocalStorage = saveAllToLocalStorage;
	exports.goNext = goNext;
	exports.goPrevious = goPrevious;
	exports.onClick = onClick;
	exports.onMousedown = onMousedown;
	exports.onClickDeleteBtn = onClickDeleteBtn;
	exports.onClickDeleteBtnSlideMini = onClickDeleteBtnSlideMini;
	exports.onMove = onMove;
	exports.vonMouseup = onMouseup;
	exports.onRotateZ = onRotateZ;
	exports.onRotateX = onRotateX;
	exports.onRotateY = onRotateY;
	exports.onScale = onScale;
	exports.onClickInsideSlide = onClickInsideSlide;
	exports.onClickEditBtn = onClickEditBtn;
	exports.onKeyup = onKeyup;

});
