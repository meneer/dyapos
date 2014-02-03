define(["Mode",
		"Slide"
	], function(Mode, Slide) {

    var zoomOut = function() {
        
        if (slide_edit_mode === true) {
            //Change to navigation edit mode
            Mode.goToNavigationEditMode();
        }
        // Decrease a little the transition time, for freely moving on the map
        $impress.style.transition = "all 300ms ease-in-out 50ms";
        $impress.style[css_transition] = "all 300ms ease-in-out 50ms";
        var currentZoom = getTransformValue($impress, "scale");              
        
        var newZoom = currentZoom - 0.02;
        if (newZoom >= 0) {            
            $impress.style[css_transform] = "scale(" + newZoom + ")";
        }
    };

    var zoomIn = function() {
        // Decrease a little the transition time, for freely moving on the map
        $impress.style.transition = "all 300ms ease-in-out 50ms";
        $impress.style[css_transition] = "all 300ms ease-in-out 50ms";
        var currentZoom = getTransformValue($impress, "scale");
        var newZoom = currentZoom + 0.02;
        $impress.style[css_transform] = "scale(" + newZoom + ")";
    };

    // Event functions
    var onMousedown = function(event) {
        event.stopPropagation();
        if (event.target.isEqualNode(document.body)) {
            console.log("mousedown on map");
            Slide.hideSlideOptionsBox();

            last_x = event.clientX;
            last_y = event.clientY;
            $map = $impress.children[0];
            transform_style = $map.style[css_transform];
            map_trans3d = $map.style[css_transform].split("translate3d");
            map_trans3d = map_trans3d[map_trans3d.length - 1];
            map_trans3d = translate3DToArray(map_trans3d);

            // Remove transition animation for freely move on the map
            // (transition will be set again when call impress().goto())
            $map.style.transition = null;
            $map.style[css_transition] = null;

            $(document).on("mousemove", onMove);
            $(document).on("mouseup", onMouseup);
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
            console.log("left");
            map_trans3d[0] = parseInt(map_trans3d[0]) - movement;
        } else if (deltaX < 0) {
            // If the movement is to right
            console.log("right");
            map_trans3d[0] = parseInt(map_trans3d[0]) + movement;
        }

        if (deltaY > 0) {
            // If the movement is to up
            console.log("up");
            map_trans3d[1] = parseInt(map_trans3d[1]) - movement;
        } else if (deltaY < 0) {
            // If the movement is to down
            console.log("down");
            map_trans3d[1] = parseInt(map_trans3d[1]) + movement;
        }

        last_x = event.clientX;
        last_y = event.clientY;

        // apply move to CSS style
        transform_style = transform_style.replace(/translate3d\(.+?\)/g, "translate3d(" + map_trans3d[0] + "px," + map_trans3d[1] + "px,0px)");
        $map.style[css_transform] = transform_style;
    };

    var onMouseup = function() {
        event.stopPropagation();
        console.log("event: mouseup map");
        $(document).off("mousemove", onMove);
        $(document).off("mouseup", onMouseup);
    };

    var onMouseWheel = function(event) {
        event.stopPropagation();
        console.log("event: onmousewheel");
        if (event.wheelDelta === 120) {
            console.log("event: mousein");
            zoomIn();
        }
        if (event.wheelDelta === -120) {
            console.log("event: mouseout");
            zoomOut();
        }
    };

    // For Mozilla
    var onMouseWheel2 = function(event) {
        console.log("event: onmousewheel");
        if (event.detail < 0) {
            console.log("event: mousein");
            zoomIn();
        }
        if (event.detail > 0) {
            console.log("event: mouseout");
            zoomOut();
        }
    };

    return {
        zoomOut : zoomOut,
        zoomIn : zoomIn,
        onMousedown : onMousedown,
        onMove : onMove,
        onMouseWheel : onMouseWheel,
        onMouseWheel2 : onMouseWheel2
    }
});

