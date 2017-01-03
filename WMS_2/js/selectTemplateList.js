$(document).ready($(function(){

	//*************************************
	// Initialize
	//*************************************
	refreshTemplateList();

	$("#select_template_list").on("click",".select-template-delete",function(event) {
		var $button = $(event.currentTarget);
		showBootstrapConfirmDialog('Confirm to delete template', 'Are you sure you want to perform this action? Deleting will only be possible if there are no websites based on this template!', 'warning', function(result) {
			if(result){
				var tmpid = $button.attr('template-id');
				var templateCanBeDeleted = true;
				$.ajax({
					type: "POST",
					url: 'db/db_getAllWebsitesWithTemplateId.php',
					data: {data: tmpid},
					dataType:'json',
					success: function(data){
						//Check if there are websites that are based on this template
						if(!jQuery.isEmptyObject(data)) {
							showBootstrapInfoDialog("Invalid operation", "Can't delete this template. There are websites based on this template!", "warning");
							templateCanBeDeleted = false;
						//Else remove template and delete button from this view
						} else {
							$('a[template-id="'+tmpid+'"]').remove();
							$button.parents("span").remove();
						}
					}
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Can't get Websites from DB!", 'danger');
					return false;
				}).done(function(){
					if(templateCanBeDeleted){
						$.ajax({
							type: "POST",
							url: 'db/db_deleteTemplate.php',
							data: {data: tmpid},
							success: function(data){
								refreshTemplateList();
							}
						}).fail(function(){
							showBootstrapInfoDialog("Error", "Error - Can't delete template from DB!", 'danger');
						});
					}
					return templateCanBeDeleted;
				});
			}
		});
    });

}));

//*************************************
// Load the template list
//*************************************
function refreshTemplateList() {

	$.ajax({
		type: "POST",
		url: 'db/db_getAllTemplates.php',
		dataType:'json',
		success: function(data){
			$("#select_template_list").empty();
			var tpl = _.template($("#select_template_list_item").html());
			$.each(data, function(index, element) {
				var templateData = {
					id:	    element.id,
					name:   element.name
				}
				$("#select_template_list").append(tpl(templateData));
			});
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
	});
}
