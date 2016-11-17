$(document).ready($(function(){ 	

	//*************************************
	// Initialize
	//*************************************
	//Hide the header
	$(document).find('.wmsHeader').show();	
	
	var $qtbNumber = sessionStorage.getItem('qtbNumber');	

	$.ajax({
		type: "POST",
		url: 'db/db_getUserByQtbNumber.php',
		data: {'qtbNumber': $qtbNumber},	
		dataType:'json',			
		success: function(data){
			var $container = $('#userInformationContainer');
			if(data.length > 0){
				$container.find('#userInfoName').html(data[0].FirstName + ' ' + data[0].LastName);
				$container.find('#userInfoQtb').html(data[0].QtbNumber);
				$container.find('#userInfoId').html(data[0].Id);
				$container.find('#userInfoGroup').html(data[0].GroupName);
				$container.find('#userInfoGroupId').html(data[0].UserGroupId);
			} else {
				showBootstrapInfoDialog("The DB doesn't know you!", "Your qtb-number can't be found in the DB. How did you even get here?", 'warning');
			}
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
	});
		
}));
	
