function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? null : sParameterName[1];
        }
    }
	return null;
}

function setUserInformation(initPage){
	if(!sessionStorage.getItem('FirstName')) {
		$.ajax({
				type: "POST",
				url: 'db/db_getUserInfos.php',
				data: {'username': sessionStorage.getItem('username')},
				dataType:'json',
				success: function(data){
					if (typeof data == 'undefined' || data.length == 0) {
						showBootstrapInfoDialog("The DB doesn't know you!", "Your account can't be found in the DB. How did you even get here?", 'warning');
						sessionStorage.clear();
						location.href = 'index.html';
					} else {
						sessionStorage.setItem('FirstName', data.first_name);
						sessionStorage.setItem('LastName', data.last_name);
            sessionStorage.setItem('UserGroupID', data.user_group_id);
						$("#hiddenUsername").text(data.first_name + " " + data.last_name);
            if(initPage == true) {
              location.href = 'index.html';
            }
					}
				}
		}).fail(function(){
			alert("Error - Can't get user information from DB.");
		});
	} else {
		$("#hiddenUsername").text(sessionStorage.getItem('FirstName') + " " + sessionStorage.getItem('LastName'));
	}
}

function enterUserManagement(setUrl, callback) {
	var username = sessionStorage.getItem('username');
	console.log("Username: " + username);
	return $.ajax({
		type: "POST",
		url: 'db/db_getUserInfos.php',
		data: {'username': username},
		dataType:'json',
		success: function(data){
			if (typeof data == 'undefined' || data.length == 0) {
				showBootstrapInfoDialog("The DB doesn't know you!", "Your account can't be found in the DB. How did you even get here?", 'warning');
				sessionStorage.clear();
				location.href = 'index.html';
				if(callback !== null){
					callback(false);
				}
			} else {
				if(data.group_name === 'admin'){
					if(setUrl){
						location.href = 'index.html?site=userManagement';
					}
					if(callback !== null){
						callback(true);
					}
				} else {
					if(callback !== null){
						callback(false);
					}
				}
			}
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
		if(callback !== null){
			callback(false);
		}
	});
}


function showBootstrapInfoDialog($title, $message, $level) {
	var $dialogType, $buttonType;
	switch($level) {
		case 'warning':
			$dialogType = BootstrapDialog.TYPE_WARNING;
			$buttonType = 'btn-warning';
			break;
		case 'info':
			$dialogType = BootstrapDialog.TYPE_INFO;
			$buttonType = 'btn-info';
			break;
		case 'danger':
			$dialogType = BootstrapDialog.TYPE_DANGER;
			$buttonType = 'btn-danger';
			break;
		case 'success':
			$dialogType = BootstrapDialog.TYPE_SUCCESS;
			$buttonType = 'btn-success';
			break;
		default:
			$dialogType = BootstrapDialog.TYPE_Primary;
			$buttonType = 'btn-primary';
			break;
	}

	var $dialog = BootstrapDialog.show({
		type: $dialogType,
		title: $title,
		message: $message,
		draggable: true,
		closable: true,
		buttons: [{
			label: "Close",
			cssClass: $buttonType,
			action: function(dialogItself) {dialogItself.close();}
		}]
	});
	return $dialog;
}

function showBootstrapConfirmDialog($title, $message, $level, $callback) {
	var $btnOkLevel, $dialogType;
	switch($level) {
		case 'warning':
			$dialogType = BootstrapDialog.TYPE_WARNING;
			$btnOkLevel = 'btn-warning';
			break;
		case 'info':
			$dialogType = BootstrapDialog.TYPE_INFO;
			$btnOkLevel = 'btn-info';
			break;
		case 'danger':
			$dialogType = BootstrapDialog.TYPE_DANGER;
			$btnOkLevel = 'btn-danger';
			break;
		case 'success':
			$dialogType = BootstrapDialog.TYPE_SUCCESS;
			$btnOkLevel = 'btn-success';
			break;
		default:
			$dialogType = BootstrapDialog.TYPE_Primary;
			$btnOkLevel = 'btn-primary';
			break;
	}

	var $dialog = BootstrapDialog.confirm({
		title: $title,
		message: $message,
		type: $dialogType,
		closable: true,
		draggable: true,
		btnOKLabel: 'Confirm',
		btnOKClass: $btnOkLevel,
		btnCancelLabel: 'Cancel',
		btnCancelClass: 'btn-danger',
		callback: function(result) {if ($callback) $callback(result)}
	});

	return $dialog;
}

function centerAllElements() {
	$(".editableCheckbox").parent().css({"text-align": "center"});
	$(".editableRadiobutton").parent().css({"text-align": "center"});
	$(".editableImg").parent().css({"text-align": "center"});
}

jQuery.Color.fn.contrastColor = function() {
    var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
    return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "black" : "white";
};

$.fn.exists = function () {
    return this.length !== 0;
}

function isEmpty(str) {
  return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}
