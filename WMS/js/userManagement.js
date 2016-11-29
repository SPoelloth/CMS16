$(document).ready($(function(){

	//*************************************
	// Initialize
	//*************************************
	//Hide the header
	$(document).find('.wmsHeader').hide();

	fillTableRows('normal', 'normalUserContainer');
	fillTableRows('admin', 'adminUserContainer');

	initNewUserButton();
}));


//*****************************************
// Adjust the table height
//*****************************************
var $numberOfCalls = 0;
function adjustTableHeight(){
	//The global variable $numberOfCalls prevents the approach below from being called unnecessarily. Additionally
	//the parallel calls effect each other and end in chaos.
	if($numberOfCalls === 1){
		var $maxHeightContentArray = [];
		var $maxHeightDescriptionArray = [];
		//Create arrays with each elements heights
		$('.usersContent').each(function(){
			$maxHeightContentArray.push($(this).height());
		});
		$('.usersDescription').each(function(){
			$maxHeightDescriptionArray.push($(this).height());
		});
		//Sort the arrays numerically, highest value first
		$maxHeightContentArray.sort(function(a, b){return b-a});
		$maxHeightDescriptionArray.sort(function(a, b){return b-a});
		//Get the first element of the array with the highest value and set it for every element
		$('.usersDescription').height($maxHeightDescriptionArray.shift());
		$('.usersContent').height($maxHeightContentArray.shift());

		return true;
	} else {
		$numberOfCalls++;
		return false;
	}
}


//*****************************************
// Fill the table with content
//*****************************************
function fillTableRows(groupName, containerId){
	var $tableCode = '';
	$.ajax({
		type: "POST",
		url: 'db/db_getUserHavingGroupName.php',
		data: {data: groupName},
		dataType:'json',
		success: function(data){
			$.each(data, function(index, element) {
				if(element.QtbNumber !== 'TOM_AUTOFILL'){
					$tableCode += "<tr class='usersTableElements' userId='"+element.Id+"'><td><b>"+element.FirstName+" "+element.LastName+" ("+element.Username+")</b> <span style='float:right;'>(Id="+element.Id+")</span></td></tr>";
				}
			});
			//Fill content into the container
			$('#'+containerId).find('tbody').html($tableCode);
			initUserPopovers(data);
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get users from DB!", 'danger');
		return false;
	}).done(function(){
		//Adjust the height of the table
		adjustTableHeight();
	});
}


//*****************************************
// Initialize the click action on the
// rows to the worksheets
//*****************************************
function initUserPopovers(data){
	$.each(data, function(index, element) {
		//Create html content
		var $userPopoverContent = "<div userid='"+element.Id+"' style='margin-top: 5px;'><form class='form-horizontal' role='form'>";
		$userPopoverContent += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='firstName'>First name:</label>";
		$userPopoverContent += "<div class='col-sm-8'><input type='text' class='form-control' id='firstName' value='"+element.FirstName+"'></div>";
		$userPopoverContent += "</div>";
		$userPopoverContent += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='lastName'>Last name:</label>";
		$userPopoverContent += "<div class='col-sm-8'><input type='text' class='form-control' id='lastName' value='"+element.LastName+"'></div>";
		$userPopoverContent += "</div>";
		$userPopoverContent += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='username'>Username:</label>";
		$userPopoverContent += "<div class='col-sm-8'><input type='text' class='form-control' id='username' value='"+element.Username+"'></div>";
		$userPopoverContent += "</div>";
		$userPopoverContent += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='password'>Password:</label>";
		$userPopoverContent += "<div class='col-sm-8'><input type='password' class='form-control' id='password' value='"+element.Password+"'></div>";
		$userPopoverContent += "</div>";
		$userPopoverContent += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left; for='userGroup''>User Group:</label>";
		$userPopoverContent += "<div class='col-sm-8'><select class='form-control' id='userGroup'>";
		var $adminSelected  = (element.GroupName === 'admin' ? 'selected' : '');
		var $normalSelected = (element.GroupName === 'normal' ? 'selected' : '')
		$userPopoverContent += "<option value='admin' "+$adminSelected+">Admin</option><option value='normal' "+$normalSelected+">Normal</option></select></div>";
		$userPopoverContent += "</div></form>";
		$userPopoverContent += "<div class='form-group' style='margin:25px 0 65px 0;'>";
		$userPopoverContent += "<div class='col-sm-2'><button class='btn btn-default buttonCancel'>";
		$userPopoverContent += "<span class='glyphicon glyphicon-remove' style='padding-right:10px;'></span>Cancel</button></div>";
		$userPopoverContent += "<div class='col-sm-offset-2 col-sm-2'><button type='submit' class='btn btn-primary buttonSaveUser'>";
		$userPopoverContent += "<span class='glyphicon glyphicon-floppy-save' style='padding-right:10px;'></span>Save</button></div>";
		$userPopoverContent += "<div class='col-sm-offset-1 col-sm-2' style='padding-left:30px;'><button class='btn btn-danger buttonDeleteUser'>";
		$userPopoverContent += "<span class='glyphicon glyphicon-floppy-remove' style='padding-right:10px;'></span>Delete user</button></div>";
		$userPopoverContent += "</div>";
		$userPopoverContent += "</div>";

		//Initialize popovers
		$( ".usersTableElements[userId='"+element.Id+"']" ).popover({
			html: true,
			placement: 'bottom',
			trigger: 'click',
			content: $userPopoverContent,
			title: '<b>Edit user: </b>' + element.FirstName + ' ' + element.LastName,
			container: 'body'
		}).on('shown.bs.popover', function () {
			//Adjust the width
			$('.popover .popover-content > div[userid="'+element.Id+'"]').parents('.popover').addClass('extendedPopover');
			//Close all other popovers
			$('.popover .popover-content > div:not([userid="'+element.Id+'"])').parents('.popover').popover('hide');

			//Initialize buttons
			//Cancel button
			$('.buttonCancel').click(function(){
				$(this).parents('.popover').popover('hide');
			});

			//Save button
			$('.buttonSaveUser').click(function(){
				var $userInfo = {
					firstName: 	$(this).parents('.popover-content').find('#firstName').val().trim(),
					lastName: 	$(this).parents('.popover-content').find('#lastName').val().trim(),
					username: 	$(this).parents('.popover-content').find('#username').val().trim(),
					password:		$(this).parents('.popover-content').find('#password').val().trim(),
					userGroup: 	$(this).parents('.popover-content').find('#userGroup option:selected').val().trim(),
					userId:		$(this).parents('.popover-content').children('div').attr('userid')
				};

				if(!$userInfo.firstName || !$userInfo.lastName || !$userInfo.qtbNumber){
					showBootstrapInfoDialog("Incomplete form", "Please fill out all fields in this form.", 'warning');
				} else {
					$.ajax({
						type: "POST",
						url: 'db/db_updateOrInsertUserHavingId.php',
						data: {data: $userInfo},
						success: function(data){
							location.reload();
						}
					}).fail(function(){
						showBootstrapInfoDialog("Error", "Error - Can't update user in DB!", 'danger');
					});
				}
				$(this).parents('.popover').popover('hide');
			});

			//Delete button
			$('.buttonDeleteUser').click(function(){
				$(this).parents('.popover').popover('hide');
				var $userId = $(this).parents('.popover-content').children('div').attr('userid');
				showBootstrapConfirmDialog('Delete user', 'Are you sure you want to delete this user?', 'warning', function(result) {
					if(result){
						$.ajax({
							type: "POST",
							url: 'db/db_deleteUserHavingId.php',
							data: {data: $userId},
							success: function(data){
								$('.usersTableElements[userid="'+$userId+'"]').remove();
								location.reload();
							}
						}).fail(function(){
							showBootstrapInfoDialog("Error", "Error - Can't delete user from DB!", 'danger');
						});
					}
				});
			});
		});
	});
}


function  initNewUserButton(){
	$('#addNewUser').click(function(){
		//Create dialog content
		var $createUserForm = "<div style='margin-top: 5px;'><form class='form-horizontal' role='form'>";
		$createUserForm += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='firstName'>First name:</label>";
		$createUserForm += "<div class='col-sm-8'><input type='text' class='form-control' id='firstName' placeholder='Chuck'></div>";
		$createUserForm += "</div>";
		$createUserForm += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='lastName'>Last name:</label>";
		$createUserForm += "<div class='col-sm-8'><input type='text' class='form-control' id='lastName' placeholder='Norris'></div>";
		$createUserForm += "</div>";
		$createUserForm += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='username'>Username:</label>";
		$createUserForm += "<div class='col-sm-8'><input type='text' class='form-control' id='username' placeholder='Username'></div>";
		$createUserForm += "</div>";
		$createUserForm += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left;' for='password'>Password:</label>";
		$createUserForm += "<div class='col-sm-8'><input type='password' class='form-control' id='password' placeholder='Password'></div>";
		$createUserForm += "</div>";
		$createUserForm += "<div class='form-group'><label class='control-label col-sm-4' style='text-align:left; for='userGroup''>User Group:</label>";
		$createUserForm += "<div class='col-sm-8'><select class='form-control' id='userGroup'>";
		$createUserForm += "<option value='admin'>Admin</option><option value='normal' selected>Normal</option></select></div>";
		$createUserForm += "</div></form></div>";

		//Configure dialog box
		BootstrapDialog.show({
			type: 		BootstrapDialog.TYPE_Primary,
			title: 		'Create new user',
			message: 	$createUserForm,
			draggable: 	true,
			closable: 	true,
			buttons: 	[{
							id:			'buttonCloseNewUserDialog',
							label: 		"Close",
							icon: 		'glyphicon glyphicon-remove',
							cssClass: 	'btn-danger',
							action: 	function(dialogItself) {
											dialogItself.close();
										}
						}, {
							id:			'buttonSaveNewUserDialog',
							label: 		"Save",
							icon: 		'glyphicon glyphicon-floppy-save',
							cssClass: 	'btn-primary',
							action: 	function(dialogItself) {
											var $newUserInfo = {
											 	firstName: 	dialogItself.getModalBody().find('#firstName').val().trim(),
												lastName: 	dialogItself.getModalBody().find('#lastName').val().trim(),
												username: 	dialogItself.getModalBody().find('#username').val().trim(),
												password:   dialogItself.getModalBody().find('#password').val().trim(),
												userGroup: 	dialogItself.getModalBody().find('#userGroup option:selected').val().trim()
											};
											//Insert user into DB
											$.ajax({
												type: "POST",
												url: 'db/db_updateOrInsertUserHavingId.php',
												data: {data: $newUserInfo},
												success: function(data){
													location.reload();
												}
											}).fail(function(){
												showBootstrapInfoDialog("Error", "Error - Can't save new user in DB!", 'danger');
											});
											dialogItself.close();
										}
						}]
		});
	});
}
