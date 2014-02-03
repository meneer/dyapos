Mustache.tags = ["[[","]]"];

$(document).ready(function(){	
	
	var search = function(){
		//Show loading icon
		$("#icon-loading-presentations").show();
		
		var search_text = $("#input-search").val();
		if(search_text != ""){
	        var url = "/search-global";
	        $.post(url, {
	            "search_text" : search_text
	        }, function(data) {     
	        	$(".title-result").css("display","none");
	        	$("#title-search-results").css("display","block");   	
				showPresentationList(JSON.parse(data));
	        });			
		}else{
			loadFeaturedPresentations();
		}
	};
	
	var showPresentationList = function(data){
        var template = $("#template-presentation").html();
        var view = Mustache.render(template, data);
        
        $("#icon-loading-presentations").hide();
        
        $("#search-results").html(view);	
	};
	
	var loadFeaturedPresentations = function(){
		// Show loading icon
		$("#icon-loading-presentations").show();
		
        var url = "/load-featured";
        $.post(url, function(data) {        	
        	$(".title-result").css("display","none");
        	$("#title-featured-presentations").css("display","block");        	
			showPresentationList(JSON.parse(data));
        });				
	};

	$("#form-search").submit(function(){
		search();
		return false;
	});
	
	loadFeaturedPresentations();
	
});