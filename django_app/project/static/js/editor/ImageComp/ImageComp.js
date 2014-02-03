define(["Component"], function(Component) {

	var showPreview = function() {
		console.log("Load image preview");
		var template = $("#template-image-preview").html();
		var data = {
			url : $("#image-url").val(),
		};
		var view = Mustache.render(template, data);
		$("#image-preview").html(view);
	};

	var upload = function(event) {
		console.log("upload image");
		$("#add-image-box").foundation("reveal", "close");

		var inputFileImage = document.getElementById("image");
		var inputUrlImage = document.getElementById("image-url");

		Component.insert({
			"type" : "image",
			"pos_x" : clicked_inside_slide_point.left,
			"pos_y" : clicked_inside_slide_point.top
		});
		
		created_image_comp = slides.get(selected_slide).get("components").last();

		if (!is_anonymous) {

			if (inputFileImage.value != "") {
				console.log("Image uploaded from computer");
				var url = "/image/upload";
				var file = inputFileImage.files[0];
				var imageData = new FormData();
				imageData.append("image", file);

				$.ajax({
					url : url,
					type : "POST",
					contentType : false,
					data : imageData,
					processData : false,
					cache : false
				}).done(function(file) {					
					created_image_comp.set("file", file);
					var image = document.getElementById(created_image_comp.cid).getElementsByClassName("component-preview")[0].children[0];
					image.src = "/media/images/" + created_image_comp.get("file");
					//Clear the file input value					
					inputFileImage.value = "";
				});
			} else if (inputUrlImage.value != "") {
				console.log("Image uploaded from external URL");
				var url = "/image/upload-from-url";
				var image_url = inputUrlImage.value;

				$.post(url, {
					"image_url" : image_url
				}, function(file) {
					var last = _.last(slides.getComponentsWhere({type:"image"}));
					last.set("file", file);
					var image = document.getElementById(last.cid).getElementsByClassName("component-preview")[0].children[0];
					image.src = "/media/images/" + last.get("file");
					//Clear the url input value and the image preview
					inputUrlImage.value = "";					
					document.getElementById("image-preview").innerHTML = "";
				});
			}
		} else {
			// Insert an "external_url" property to the last image component added
			var last = _.last(slides.getComponentsWhere({type:"image"}));
			last.set("external_url", inputUrlImage.value);
			var image = document.getElementById(last.cid).getElementsByClassName("component-preview")[0].children[0];
			image.src = last.get("external_url");			
		}

	};

	var increaseSize = function(cid) {
		console.log("increase image");
		var component = document.getElementById(cid);
		var size = parseInt(component.style.width.replace("%", ""));
		size = size + 2;
		component.style.width = size + "%";
		slides.getComponent(cid).set("size", size);
	};

	var decreaseSize = function(cid) {
		console.log("increase image");
		var component = document.getElementById(cid);
		var size = parseInt(component.style.width.replace("%", ""));
		size = size - 2;
		component.style.width = size + "%";
		slides.getComponent(cid).set("size", size);
	};

	var setSize = function(cid, size) {
		console.log("set size");
		var component = document.getElementById(cid);
		component.style.width = parseInt(size) + "%";
		slides.getComponent(cid).set("size", size);
	};

	// Event functions

	var onClickBtnIncrease = function(event) {
		event.stopPropagation();
		increaseSize(selected_component);
	};

	var onClickBtnDecrease = function(event) {
		event.stopPropagation();
		decreaseSize(selected_component);
	};

	// Events

	var onPasteURL = function(event) {
		console.log("Url pasted");
		setTimeout(showPreview, 500);
	};

	return {
		showPreview : showPreview,
		upload : upload,
		increaseSize : increaseSize,
		decreaseSize : decreaseSize,
		onClickBtnIncrease : onClickBtnIncrease,
		onClickBtnDecrease : onClickBtnDecrease,
		onPasteURL : onPasteURL,
	};
});
