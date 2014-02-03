require.config({
	paths : {
		jquery : "jquery-2.0.0",
		jqueryui : "jquery-ui-1.10.3.custom",
		touchpunch : "jquery.ui.touch-punch",
		mustache : "mustache",
		impress : "impress",
		impress_custom : "editor/impress_custom",
		html2canvas : "html2canvas",
		colorpicker : "colorpicker.min",
		underscore : "underscore",
		backbone : "backbone",
		backbone_relational : "backbone-relational",
		iobind : "backbone.iobind",
		iosync : "backbone.iosync",
		modernizr: "modernizr",
		foundation: "foundation.min",

		//Modules
		EditorLoader: "editor/EditorLoader",
		Chat: "editor/Chat/Chat",
		Collaborative: "editor/Collaborative/Collaborative",
		Component: "editor/Component/Component",
		ComponentModel: "editor/Component/ComponentModel",
		ImageComp: "editor/ImageComp/ImageComp",
		ImageCompModel: "editor/ImageComp/ImageCompModel",
		Map: "editor/Map/Map",
		Mode: "editor/Mode/Mode",
		Slide: "editor/Slide/Slide",
		SlideModel: "editor/Slide/SlideModel",
		TextEdit: "editor/TextComp/TextEdit",
		TextCompModel: "editor/TextComp/TextCompModel",
		VideoCompModel: "editor/VideoComp/VideoCompModel",
		Theme: "editor/Theme/Theme",
		VideoComp: "editor/VideoComp/VideoComp",
	},

	shim : {
		jquery : {
			exports : "$"
		},
		jqueryui: {
			deps: ["jquery"],
		},
		touchpunch: {
			deps: ["jqueryui"]
		},
		underscore: {
			exports: "_"
		},
		backbone : {
			deps : ["underscore"],
			exports : "Backbone"
		},
		backbone_relational : {
			deps : ["backbone"]
		},
		iosync: {
			deps : ["underscore","backbone"]
		},
		iobind: {
			deps : ["underscore","backbone","iosync"]
		}
	}
});

console.log("Require.js configuration loaded");
