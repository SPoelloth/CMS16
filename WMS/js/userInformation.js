$(document).ready($(function(){

	//*************************************
	// Initialize
	//*************************************
	//Hide the header
	$(document).find('.wmsHeader').show();

	var username = sessionStorage.getItem('username');

	$.ajax({
		type: "POST",
		url: 'db/db_getUserInfos.php',
		data: {'username': username},
		dataType:'json',
		success: function(data){
			var $container = $('#userInformationContainer');
			if(data.length > 0){
				$container.find('#userInfoName').html(data[0].FirstName + ' ' + data[0].LastName);
				$container.find('#userInfoUsername').html(data[0].Username);
				$container.find('#userInfoId').html(data[0].Id);
				$container.find('#userInfoGroup').html(data[0].GroupName);
				$container.find('#userInfoGroupId').html(data[0].UserGroupId);
			} else {
				showBootstrapInfoDialog("The DB doesn't know you!", "Your username can't be found in the DB. How did you even get here?", 'warning');
			}
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
	});

}));
