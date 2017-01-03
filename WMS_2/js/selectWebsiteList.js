$(document).ready($(function(){
	getAllWebsites();
}));


function getAllWebsites(){
	$.ajax({
		type: "POST",
		url: 'db/db_getAllWebsites.php',
		dataType:'json',
		success: function(data){
			$("#select_website_list").empty();
			var tpl = _.template($("#select_website_list_item").html());
			$.each(data, function(index, element) {
				var templateData = {
					index:		index + 1,
					website_id:	element.website_id,
					name:   	element.website_name
				};
				$("#select_website_list").append(tpl(templateData));
			});
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Website from DB!", 'danger');
	});
}
