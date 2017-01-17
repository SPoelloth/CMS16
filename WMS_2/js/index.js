$(document).ready($(function(){
	initPage();

	//*************************************
	// Set Footer
	//*************************************
	var myFooter = sessionStorage.getItem("standardFooter");
	if(myFooter === null) {
		myFooter = "&copy; Tobias Nickl, Stefan Pölloth, Johannes Wiesneth, Jeremy Probst " + new Date().getFullYear();
		sessionStorage.setItem('standardFooter', myFooter);
	}
	$('#footer_text').html(myFooter);
}));


//*************************************
// Initialize the start page
//*************************************
function initPage(){
	var site = getUrlParameter('site');
	var user = sessionStorage.getItem('username');
	console.log(site + " " + user);
	if(!user){
		$( ".maincontainer" ).load("html/loginBar.html", function(){
			initLoginButton();
		});

		$('#additionalNavBar').hide();

	} else if(user !== null && site !== null) {
		$('#btnLogout').click(logOut);
		switch(site) {

			case 'selectTemplate':
				setUserInformation(false);
				$( ".maincontainer" ).load( "html/selectTemplateList.html");
				break;
			case 'selectWebsite':
				setUserInformation(false);
				$( ".maincontainer" ).load( "html/selectWebsiteList.html" );
				var userGroupID = sessionStorage.getItem('UserGroupID');
				if(userGroupID != '6')
					$( ".not_normal" ).hide();
				break;
			case 'showUser':
				setUserInformation(false);
				$( ".maincontainer" ).load( "html/userInformation.html" );
				var userGroupID = sessionStorage.getItem('UserGroupID');
				if(userGroupID != '6')
					$( ".not_normal" ).hide();
				break;

			case 'userManagement':
				//To prevent anyone entering the user management by simply typing it as url the user permission is checked again.
				enterUserManagement(false, function isPermitted(permitted){
					if(permitted){
						setUserInformation(false);
						$( ".maincontainer" ).load( "html/userManagement.html" );
						var userGroupID = sessionStorage.getItem('UserGroupID');
						if(userGroupID != '6')
							$( ".not_normal" ).hide();
					} else {
						location.href = 'index.html';
					}
				});
				break;
			case 'showWebsite':
				$( ".maincontainer" ).load( "html/showWebsite.html" );
				setUserInformation(false);
				var userGroupID = sessionStorage.getItem('UserGroupID');
				if(userGroupID != '6')
					$( ".not_normal" ).hide();
				break;
			case 'showTemplate':
				setUserInformation(false);
				$( ".maincontainer" ).load( "html/showTemplate.html" );
				$(document).find('.wms-jumbotron').hide();
				break;

			default:
				setUserInformation(false);
				var userGroupID = sessionStorage.getItem('UserGroupID');
				if(userGroupID == '6')
					$( ".maincontainer" ).load("html/selectionBar.html");
				else {
					$( ".maincontainer" ).load("html/selectionBarNormal.html");
					$( ".not_normal" ).hide();
				}
				$(document).find('.wms-jumbotron').show();
				break;
		}
	} else if(user !== null && site == null){
		setUserInformation(false);
		var userGroupID = sessionStorage.getItem('UserGroupID');
		if(userGroupID == '6') {
			$( ".maincontainer" ).load("html/selectionBar.html");
		}
		else {
			$( ".maincontainer" ).load("html/selectionBarNormal.html");
			$( ".not_normal" ).hide();
		}
		$(document).find('.wms-jumbotron').show();
	}
}



//*************************************
// Init login button
//*************************************
function initLoginButton(){
  /* Login Button click */
	$('#login_button').click(logIn);
	/* Login Enter */
	$('#login_password').keyup(function(event) {
		if(event.which == 13) logIn();
	});
}

function logIn(event) {
	var username = $('#login_username').val();
	var password = $('#login_password').val();

	if(username == '' || password == '') {
		showBootstrapInfoDialog("Error", "Please fill Username and Password", 'danger');
	} else {
		$.ajax({
			type: "POST",
			url: 'db/db_checkUser.php',
			data: {
					'username': username,
					'password': password
				  },
			success: function(data) {
				if(data.length === 0){
					showBootstrapInfoDialog("Incorrect user or password", "Your username or password is incorrect. Please contact the administrator.", 'info');
				} else {
					sessionStorage.setItem('username', username);
					console.log("username is: " + sessionStorage.getItem('username'));
					$('#additionalNavBar').show();
					$('#btnLogout').click(logOut);
					setUserInformation(true);
				}
				//initPage();
			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
		});
	}
}

function logOut(event) {
	sessionStorage.clear();
}
