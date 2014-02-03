define(["Map", "Slide", "Component", "TextEdit", "ImageComp", "module", "exports"], function(Map, Slide, Component, TextEdit, ImageComp, module, exports) {

	var currentMode = null;

	var getCurrentMode = function() {
		// It returns the protected variable "currentMode"
		return currentMode;
	};

	var goToSlideEditMode = function() {
		$("body").removeClass("non-selectable-text");
		$(".step").removeClass("hoverable");
		$(".step").removeClass("borderless");
		if ($(".component").draggable("option", "disabled") == true) {
			$(".component").draggable("enable");
		}
		$(".component").addClass("hoverable");
		$(".step").removeClass("selected");
		$(document).off("mousedown", Map.onMousedown);
		$("#slides").off("mousedown", ".step", Slide.onMousedown);
		$("#slides").off("click", ".step", Slide.onClick);
		$("#slides").on("click", ".step", Slide.onClickInsideSlide);
		$(".step").on("click", ".component", Component.onClick);
		$(".step").on("click", ".btn-edit-text", Component.onClickBtnEditText);
		$(".step").on("click", ".btn-delete-component", Component.onClickDeleteBtn);
		$(".step").on("drag", ".component", Component.hideNewComponentBox);
		$(".step").on("dragstop", ".component", Component.onDragStop);

		// Remove mousewheel events for zooming
		// For Chrome
		document.removeEventListener("mousewheel", Map.onMouseWheel);

		// For Firefox (if onmousewheel doesn't work)
		document.removeEventListener("DOMMouseScroll", Map.onMouseWheel2);

		slide_edit_mode = true;

		document.getElementById("btn-navigation-mode").style.display = "block";

		currentMode = "slide-edit";
	};

	var goToNavigationEditMode = function() {
		Component.hideNewComponentBox();
		Component.hideToolbox();
		Component.deselectAll();

		$("body").addClass("non-selectable-text");
		$(".step").addClass("hoverable");
		$(".component").removeClass("hoverable");

		if ($(".component").draggable("option", "disabled") == false) {
			$(".component").draggable("disable");
		}
		document.getElementById(selected_slide).classList.add("selected-slide");
		$("#slides").off("click", ".step", Component.onClickInsideSlide);
		$(".step").off("click", ".component", Component.onClick);
		$(".step").off("click", ".btn-decrease-image-size", ImageComp.onClickBtnDecrease);
		$(".step").off("click", ".btn-increase-image-size", ImageComp.onClickBtnIncrease);
		$(".step").off("drag", ".component", Component.hideNewComponentBox);
		$(".step").off("dragstop", ".component", Component.onDragStop);
		$(document).on("mousedown", Map.onMousedown);
		$("#slides").on("mousedown", ".step", Slide.onMousedown);
		$("#slides").on("click", ".step", Slide.onClick);

		// Add mousewheel events for zooming
		// For Chrome
		document.addEventListener("mousewheel", Map.onMouseWheel);

		// For Firefox (if onmousewheel doesn't work)
		document.addEventListener("DOMMouseScroll", Map.onMouseWheel2);

		slide_edit_mode = false;

		// Center rotation
		$map = $impress.children[0];
		var map_style = $map.style[css_transform];
		map_style = map_style.replace(/rotateZ\(.+?\)/g, "rotateZ(0deg)");
		map_style = map_style.replace(/rotateX\(.+?\)/g, "rotateX(0deg)");
		map_style = map_style.replace(/rotateY\(.+?\)/g, "rotateY(0deg)");
		$map.style[css_transform] = map_style;

		// Zoomout to 0.6
		$impress.style.transition = "all 300ms ease-in-out 50ms";
		$impress.style[css_transition] = "all 300ms ease-in-out 50ms";
		$impress.style[css_transform] = "scale(0.4)";

		// Hide the navigation mode button
		document.getElementById("btn-navigation-mode").style.display = "none";

		currentMode = "navigation-edit";
	};

	var goToEditTextMode = function() {
		currentMode = "text-edit";
		//        event.stopPropagation();
		console.log("edit text mode");
		$("#" + selected_component).draggable("disable");

		// hide borders
		document.getElementById(selected_component).classList.remove("selected-component");

		document.getElementById(selected_component).getElementsByClassName("component-preview")[0].children[0].contentEditable = true;
		document.getElementById(selected_component).getElementsByClassName("component-preview")[0].children[0].focus();
		Component.hideMenu(selected_component);
	};

	var exitFromEditTextMode = function() {
		currentMode = "slide-edit";
		console.log("exit from edit text mode");
		$("#" + selected_component).draggable("enable");
		var component_preview = document.getElementById(selected_component).getElementsByClassName("component-preview")[0].children[0];
		var content = component_preview.innerHTML;
		component_preview.contentEditable = false;
		// Update component text
		TextEdit.changeContent(selected_component, content);
	};

	var goToPreviewMode = function() {
		console.log("preview mode");

		Slide.changeSelected(selected_slide);

		Component.hideNewComponentBox();
		Component.hideToolbox();
		Component.deselectAll();

		$("body").addClass("non-selectable-text");
		$(".component").removeClass("hoverable");
		$(".step").addClass("borderless");

		if ($(".component").draggable("option", "disabled") == false) {
			$(".component").draggable("disable");
		}

		$("#slides-bar, #right-panel, #btn-add-slide, #btn-navigation-mode").slideToggle();
		$("#btn-exit-preview-mode").show();

		// document.body.classList.add("impress-enabled");

		// Remove previously attached events
		$("#slides").off("click", ".step", Slide.onClickInsideSlide);
		$(".step").off("click", ".component", Component.onClick);
		$(".step").off("click", ".btn-edit-text", Component.onClickBtnEditText);
		$(".step").off("click", ".btn-delete-component", Component.onClickDeleteBtn);
		$(".step").off("drag", ".component", Component.hideNewComponentBox);
		$(".step").off("dragstop", ".component", Component.onDragStop);

		// Add events from this mode
		document.addEventListener("keyup", Slide.onKeyup);

		currentMode = "preview";
	};

	var exitFromPreviewMode = function() {
		currentMode = null;
		console.log("exit from preview mode");

		$("#btn-exit-preview-mode").hide();
		$("#slides-bar, #right-panel, #btn-add-slide, #btn-navigation-mode").slideToggle();

		// document.body.classList.remove("impress-enabled");

		document.removeEventListener("keyup", Slide.onKeyup);

		goToSlideEditMode();
	};

	// module.exports = {
		// getCurrentMode : getCurrentMode,
		// goToSlideEditMode : goToSlideEditMode,
		// goToNavigationEditMode : goToNavigationEditMode,
		// goToEditTextMode : goToEditTextMode,
		// exitFromEditTextMode : exitFromEditTextMode,
		// goToPreviewMode : goToPreviewMode,
		// exitFromPreviewMode : exitFromPreviewMode,
	// };
	
	exports.getCurrentMode = getCurrentMode;
	exports.goToSlideEditMode = goToSlideEditMode;
	exports.goToNavigationEditMode = goToNavigationEditMode;
	exports.goToEditTextMode = goToEditTextMode;
	exports.exitFromEditTextMode = exitFromEditTextMode;
	exports.goToPreviewMode = goToPreviewMode;
	exports.exitFromPreviewMode = exitFromPreviewMode;	
});
