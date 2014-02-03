Mustache.tags = ["[[","]]"];

$(document).ready(function(){
	$("#btn-cancel-delete-account").on("click", function(){
		$('#delete-account-dialog').foundation('reveal', 'close');	
	});
});
