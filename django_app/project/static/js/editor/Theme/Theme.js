define(["Slide"], function(Slide) {

	// Load a list of available themes from server into a JSON format
	var loadList = function() {
		var url = "/themes_selectlist";
		$.post(url, function(data) {
			data = JSON.parse(data);
			var template = document.getElementById("template-theme").innerHTML;
			var view = Mustache.render(template, data);
			document.getElementById("themes-list").innerHTML = view;
		});
	};

	var set = function(name) {
		console.log("theme changed");
		currentStyleSheet = document.getElementById("theme-stylesheet");
		currentStylesheetURL = currentStyleSheet.href.split("/");
		currentStylesheetURL[currentStylesheetURL.length - 1] = name + ".css";
		currentStylesheetURL = currentStylesheetURL.join();
		currentStylesheetURL = currentStylesheetURL.replace(/,/g, "/");
		currentStyleSheet.href = currentStylesheetURL;
		//Save to database
		var url = "/themes_select";
		var theme_id = name.split("_");
		var theme_id = theme_id[theme_id.length - 1];
		if (!is_anonymous) {
			$.post(url, {
				"theme_id" : theme_id,
				"presentation_id" : p_id
			});
		}else{
			localStorage.theme = name;
		}

		// Update thumbnails according to the new selected theme
		Slide.loadThumbnails();
	};

	var change = function(event) {
		var name = event.currentTarget.id;
		set(name);
		$("#themes-window").foundation("reveal", "close");
	};

	return {
		loadList : loadList,
		set : set,
		change : change
	};

});
