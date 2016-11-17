$(document).ready($(function(){ 	

	//*************************************
	// Initialize
	//*************************************
	//$.getScript('js/generalFunctions.js');  
	$(document).find('.wmsHeader').show();	
	
	refreshTemplateList();

	$(document).on("click",".btnDeleteTemplate",function(e) {
		var $button = $(this);
		showBootstrapConfirmDialog('Confirm to delete template', 'Are you sure you want to perform this action? Deleting will only be possible if there are no worksheets based on this template!', 'warning', function(result) {
			if(result){
				var $tmpid = $button.parents('span').attr('tmpid');
				var $templateCanBeDeleted = true;			
				$.ajax({
					type: "POST",
					url: 'db/db_getAllWorksheetsHavingTemplateId.php',
					data: {data: $tmpid},		
					dataType:'json',					
					success: function(data){
						//Check if there are worksheets that are based on this template
						if(!jQuery.isEmptyObject(data)) {
							showBootstrapInfoDialog("Invalid operation", "Can't delete this template. There are worksheets based on this template!", "warning");
							$templateCanBeDeleted = false;
						//Else remove template and delete button from this view
						} else {
							$('a[tmpid="'+$tmpid+'"]').remove();
							$('span[tmpid="'+$tmpid+'"]').remove();	
						}
					}	
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Can't get Worksheets from DB!", 'danger');
					return false;
				}).done(function(){
					if($templateCanBeDeleted){
						$.ajax({
							type: "POST",
							url: 'db/db_deleteTemplate.php',
							data: {data: $tmpid},			
							success: function(data){
								refreshTemplateList();
							}				
						}).fail(function(){
							showBootstrapInfoDialog("Error", "Error - Can't delete template from DB!", 'danger');
						}); 
					}
					return $templateCanBeDeleted;
				});	
			}
		});
    });

}));


//*************************************
// Get templates with highest versionNo
//*************************************
function getHighestTemplateVersionList(data) {
	var reducedTemplateList = [];
	var lastTemplateName = null;
	
	$.each(data, function(index, element) {
		 if((lastTemplateName === null) || (lastTemplateName !== element.Name)) {		
			var currentHighestVersion = getHighestTemplateVersionWithName(data, element.Name);
			reducedTemplateList.push(data[currentHighestVersion.dataIndex]);
		} 	
		lastTemplateName = element.Name;   		
	});

	return reducedTemplateList; 
} 



//*************************************
// Load the template list
//*************************************
function refreshTemplateList() {

	$.ajax({
		type: "POST",
		url: 'db/db_getAllTemplates.php',	
		dataType:'json',
		success: function(data){			
			var appendCode = "";			
			
			var reducedTemplateList = getHighestTemplateVersionList(data);
			$.each(reducedTemplateList, function(index, element) {			
					appendCode += "<a tmpid='"+element.Id+"' href='index.html?site=showTemplate&templateid="+element.Id+"' class='list-group-item col-xs-10' style='margin-bottom: 1px;'>"+element.Name+"</a><span tmpid='"+element.Id+"' class='list-group-item col-xs-2 buttonColumn'>";
					appendCode += "<button type='button' class='btn btn-danger btnDeleteTemplate' style='border:1px solid black;'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button>";
					appendCode += "</span>";						
			});
			$('.templateSelection').empty().append( appendCode );	
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
	});   
}