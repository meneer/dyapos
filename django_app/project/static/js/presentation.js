Mustache.tags = ["[[","]]"];

// var addCollaborator = function(){
	// var template = $("#template-collaborator-row").html();
	// var view = Mustache.render(template, { 'id': Math.random() });
	// $("#collaborators").append(view);
// }

$(document).ready(function(){
//	$("#share-modal-box").on("open",function(){
//		addCollaborator();
//	});
	
	$("#iframe-width").on("keyup change",function(){
		$("#iframe-width-property").html(parseInt(this.value));
	});		
	$("#iframe-height").on("keyup change",function(){
		$("#iframe-height-property").html(parseInt(this.value));
	});	
	
	$("#rename-btn").on("click",function(){
		name = document.getElementById("id_name").value;
		url = "/rename";
		$.post(url, { "key": presentation_key , "name": name }, function(result){
			if(result == "true"){
				document.getElementById("title").innerHTML = name;
				$("#rename-modal-box").foundation("reveal","close");
			}
		});
	});
	
	$("#modify-description-btn").on("click",function(){			
		description = document.getElementById("id_description").value;
		url = "/modify-description";
		$.post(url, { "key": presentation_key , "description": description }, function(result){
			if(result == "true")
				document.getElementById("description").innerHTML = description;
				$("#modify-description-modal-box").foundation("reveal","close");
		});
	});
	
	// $("#add-collaborator-btn").on("click", function(){
		// var empty_form = $("#empty-form").html();
		// var total_forms = parseInt($('#id_form-TOTAL_FORMS').val());
		// empty_form = empty_form.replace(/__prefix__/g, total_forms);
		// $('#id_form-TOTAL_FORMS').val(total_forms + 1);
		// $("#collaborators").append(empty_form);
	// });
});

//$(document).on("click",".add-collaborator-btn", function(){
//	addCollaborator();
//});
