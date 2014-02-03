Mustache.tags = ["[[","]]"];

var init = function() {
    // Dom elements
    $icon_loading_presentations = document.getElementById("icon-loading-presentations");

    //Global variables
    selected_filter = "all";

    //Load all presentations    
    loadPresentations();
};

var showLoadingIcon = function() {
    $icon_loading_presentations.style.display = "block";
};
var hideLoadingIcon = function() {
    $icon_loading_presentations.style.display = "none";
};

var loadPresentations = function() {
    if (selected_filter == "all")        
        url = "/filter-all";
    if (selected_filter == "own")
        url = "/filter-own";
    if (selected_filter == "shared")
        url = "/filter-shared";
    $.post(url, function(data) {
        refreshPresentationList(data)
    });
};

// Shows the presentation JSON in a view
var refreshPresentationList = function(data) {
    hideLoadingIcon();
    $("#presentation-list").html("");
    if (data != "") {
        data = $.parseJSON(data);
        var template = $("#template-presentation").html();
        var view = Mustache.render(template,data);
        $("#presentation-list").append(view);
    }
};

$(document).ready(function() {
    init();

    $("#all").on("click", function() {
        $(".side-nav > li").removeClass("active");
        $("#all").addClass("active");
        selected_filter = "all";
        loadPresentations();
    });

    $("#own").on("click", function() {
        $(".side-nav > li").removeClass("active");
        $("#own").addClass("active");
        selected_filter = "own";
        loadPresentations();
    });

    $("#shared").on("click", function() {
        $(".side-nav > li").removeClass("active");
        $("#shared").addClass("active");
        selected_filter = "shared";
        loadPresentations();
    });

    $("#txt-search").on("keyup", function() {
        console.log(this.value);
        if (this.value != "") {
            showLoadingIcon();
            $("#presentation-list").html("");

            var url = "/search";
            $.post(url, {
                "search_text" : this.value,
                "selected_filter" : selected_filter
            }, function(data) {
                refreshPresentationList(data);
            });
        } else {
            loadPresentations(selected_filter);
        }

    });
});

$(document).on("mouseover", ".presentation", function() {
    $(this).children(".options").css("visibility", "visible");
});

$(document).on("mouseout", ".presentation", function() {
    $(this).children(".options").css("visibility", "hidden");
});
