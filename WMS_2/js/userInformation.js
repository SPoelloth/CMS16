$(document).ready($(function(){

	//*************************************
	// Initialize
	//*************************************

	var username = sessionStorage.getItem('username');

	$.ajax({
		type: "POST",
		url: 'db/db_getUserInfos.php',
		data: {'username': username},
		dataType:'json',
		success: function(data){
			if (typeof data == 'undefined' || data.length == 0) {
				showBootstrapInfoDialog("The DB doesn't know you!", "Your username can't be found in the DB. How did you even get here?", 'warning');
			} else {
				var tpl = _.template($("#user_information").html());
				var userData = {
					name:	    data.first_name + " " + data.last_name,
					username:   data.username,
					user_id:    data.id,
					group_name: data.group_name,
					group_id:   data.user_group_id
				}
				$("div.maincontainer").append(tpl(userData));
			}
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
	});

}));
