$(document).ready($(function(){
	initPage();

	//*************************************
	// Get current server year
	//*************************************
	var myFooter = sessionStorage.getItem("standardFooter");
	if(myFooter === null) {
		$.ajax({
			type: "POST",
			url: 'db/db_getServerYear.php',
			dataType:'json',
			success: function(data){
				myFooter = "&copy; Tobias Nickl, Stefan Pölloth, Johannes Wießneth, Jeremy Probst " + data[0].year;
				$('#standardFooter').html(myFooter);
				sessionStorage.setItem('standardFooter', myFooter);
			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Date from DB! Please check if MySQL Server is online.", 'danger');
		});
	} else {
		$('#standardFooter').html(myFooter);
	}

}));


//*************************************
// Initialize the start page
//*************************************
function initPage(){
	var site = getUrlParameter('site');
	var user = sessionStorage.getItem('qtbNumber');
	if(!user){
		$('#standardFooter').show();
		$( ".maincontainer" ).load("loginBar.html", function(){
			initLoginButton();
		});

		$('#additionalNavBar').hide();
		$(document).find('.wmsHeader').show();

	} else if(user !== null && site !== null){
		switch(site) {
			case 'selTp':
				$( ".maincontainer" ).load( "selectTemplateListModule.html");
				setUserInformation();
				break;

			case 'selWs':
				$( ".maincontainer" ).load( "selectWorksheetListModule.html" );
				setUserInformation();
				break;

			case 'showCS':
				$( ".maincontainer" ).load( "showCarStatus.html" );
				setUserInformation();
				break;

			case 'showUser':
				$( ".maincontainer" ).load( "userInformation.html" );
				setUserInformation();
				break;

			case 'userManagement':
				//To prevent anyone entering the user management by simply typing it as url the user permission is checked again.
				enterUserManagement(false, function isPermitted(permitted){
					if(permitted){
						$( ".maincontainer" ).load( "userManagement.html" );
						setUserInformation();
					} else {
						location.href = 'index.html';
					}
				});
				break;

			case 'showWorksheet':
				$( ".maincontainer" ).load( "selectWorksheet.html" );
				setUserInformation();
				break;

			case 'showTemplate':
				$( ".maincontainer" ).load( "editTemplate.html" );
				setUserInformation();
				break;

			default:
				$( ".maincontainer" ).load("selectionBar.html", function(){
					initSelectionBarItems();
				});
				setUserInformation();
				$(document).find('.wmsHeader').show();
				break;
		}
	} else {
		$( ".maincontainer" ).load("selectionBar.html", function(){
			initSelectionBarItems();
		});
		setUserInformation();
		$(document).find('.wmsHeader').show();
	}
}



//*************************************
// Init selection bar buttons
//*************************************
function initSelectionBarItems(){
	//*************************************
	// New Template Button
	//*************************************
	$("#selectionBar #newTemplateButton").click(function(event){
		//$( ".maincontainer" ).load( "newTemplate.html" );
		//location.href = "index.html?site=showTemplate";
	});

	//*************************************
	// Edit Template Button
	//*************************************
	$("#selectionBar #editTemplateButton").click(function(event){
		//$( ".maincontainer" ).load( "selectTemplateListModule.html" );
		//location.href = "index.html?site=selTp";
	});

	//*************************************
	// Select Worksheet Button
	//*************************************
	$("#selectionBar #selectWorksheetButton").click(function(event){
		//$( ".maincontainer" ).load( "selectWorksheetListModule.html" );
		//location.href = "index.html?site=selWs";
	});
}



//*************************************
// Init login button
//*************************************
function initLoginButton(){

	//*************************************
	// Login Button
	//*************************************
	$('#loginBar #loginButton').click(function(){

		var qnumber = 'tobnic';
		var username = $('#username').val();
		var password = $('#password').val();

		if(username == '' || password == '') {
			showBootstrapInfoDialog("Error", "Please fill Username and Password", 'danger');
			return;
		}

		$.ajax({
			type: "POST",
			url: 'db/db_getUserByQtbNumber.php',
			data: {'username': $('#username').val(), 'password': $('#password').val()},
			dataType:'json',
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
		}).done(function(data){
			if(data.length === 0){
				showBootstrapInfoDialog("Incorrect user or password", "Your username or password is incorrect. Please contact the administrator.", 'info');
			} else {
				sessionStorage.setItem('qtbNumber', username.toLowerCase());
				console.log("qtb number is: " + sessionStorage.getItem('qtbNumber'));
				$('#additionalNavBar').show();
			}
			initPage();
		});
	});
}
