$(document).ready($(function(){

	/* Initialize */

	fillTableRows('normal', '#normalUserTable');
	fillTableRows('admin',  '#adminUserTable');

	initNewUserButton();
}));

/**
*	Fill the table with content
*/
function fillTableRows(groupName, containerId){
	var $table = $(containerId);
	$.ajax({
		type: "POST",
		url: 'db/db_getUserInUserGroup.php',
		data: {data: groupName},
		dataType:'json',
		success: function(data){
			$.each(data, function(index, element) {
			   var $tableRow = $("<tr data-id='" + element.id + "'>");
			   $tableRow.append("<td>" + element.first_name + " " + element.last_name + "</td>");
			   $tableRow.append("<td>" + element.username + "</td>");
			   $tableRow.append("<td>" + element.id + "</td>");
   			   $table.append($tableRow);
			   var popoverContent = getPopoverContent(element);
			   initPopover(element,popoverContent, $tableRow);
			});
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get users from DB!", 'danger');
		return false;
	});
}

function initPopoverActions() {
	$(".user-popover-cancel").click(onClosePopover);
	$(".user-popover-delete").click(deleteUser);
	$(".user-popover-save").click(updateUser);
}

function getPopoverContent(data) {
	var selectAdmin  = (data.group_name === 'admin'  ? 'selected' : '');
	var selectNormal = (data.group_name === 'normal' ? 'selected' : '');
	var tpl = _.template($("#user_popover").html());
	var rowData = {
		id: 		   data.id,
		first_name:    data.first_name,
		last_name:     data.last_name,
		username: 	   data.username,
		password: 	   data.password,
		select_admin:  selectAdmin,
		select_normal: selectNormal
	}
	return tpl(rowData);
}

function initPopover(data, content, $row) {
	$row.popover({
		container:  'body',
		content: 	content,
		html: 	    true,
		placement: 'bottom',
		trigger:   'manual',
		title: 	   '<b>Edit user: </b>' + data.first_name + ' ' + data.last_name
	});
	$row.click(showPopover);
}

function showPopover(event) {
	var dataId = $(event.currentTarget).attr("data-id");
	closeAllShownPopovers(dataId);
	$(event.currentTarget).popover('toggle');
	$(event.currentTarget).on("shown.bs.popover", initPopoverActions);
}

function onClosePopover(event) {
	var dataId = $(event.currentTarget).attr("data-id");
	closePopover(dataId);
}

function closePopover(dataId) {
	$("tr[data-id=" + dataId + "]").popover('hide');
}

function updateUser(event) {
	var $userInfo = {
		firstName: 	$(event.currentTarget).parents('.popover-content').find('#user_popover_first_name').val().trim(),
		lastName: 	$(event.currentTarget).parents('.popover-content').find('#user_popover_last_name').val().trim(),
		username: 	$(event.currentTarget).parents('.popover-content').find('#user_popover_username').val().trim(),
		password:	$(event.currentTarget).parents('.popover-content').find('#user_popover_password').val().trim(),
		userGroup: 	$(event.currentTarget).parents('.popover-content').find('#user_popover_usergroup option:selected').val().trim(),
		userId:		$(event.currentTarget).parents('.popover-content').find(".user-popover-cancel").attr('data-id')
	};

	if(!$userInfo.firstName || !$userInfo.lastName || !$userInfo.username || !$userInfo.password || !$userInfo.userGroup){
		showBootstrapInfoDialog("Incomplete form", "Please fill out all fields in this form.", 'warning');
	} else {
		$.ajax({
			type: "POST",
			url: 'db/db_updateOrInsertUser.php',
			data: {data: $userInfo},
			success: function(data){
				location.reload();
			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Error - Can't update user in DB!", 'danger');
		});
	}
	closePopover($userInfo.userId);
}

function deleteUser(event) {
	var dataId = $(event.currentTarget).parents(".popover-content").find(".user-popover-cancel").attr("data-id");
	closePopover(dataId);
	showBootstrapConfirmDialog('Delete user', 'Are you sure you want to delete this user?', 'warning', function(result) {
		if(result){
			$.ajax({
				type: "POST",
				url: 'db/db_deleteUser.php',
				data: {data: dataId},
				success: function(data){
					location.reload();
				}
			}).fail(function(){
				showBootstrapInfoDialog("Error", "Error - Can't delete user from DB!", 'danger');
			});
		}
	});
}

function closeAllShownPopovers(dataId) {
	$("tr:not([data-id=" + dataId + "])").popover('hide');
}

function  initNewUserButton(){
	$("#add_new_user_save_btn").click(addNewUser);
}

function addNewUser(event) {
	var $newUserInfo = {
		firstName: 	$("#add_new_user_dialog").find('#add_new_user_first_name').val().trim(),
		lastName: 	$("#add_new_user_dialog").find('#add_new_user_last_name').val().trim(),
		username: 	$("#add_new_user_dialog").find('#add_new_user_username').val().trim(),
		password:   $("#add_new_user_dialog").find('#add_new_user_password').val().trim(),
		userGroup: 	$("#add_new_user_dialog").find('#add_new_user_usergroup option:selected').val().trim()
	};
	//Insert user into DB
	$.ajax({
		type: "POST",
		url: 'db/db_updateOrInsertUser.php',
		data: {data: $newUserInfo},
		success: function(data){
			location.reload();
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Error - Can't save new user in DB!", 'danger');
	});
}
