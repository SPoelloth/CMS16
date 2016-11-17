$(document).ready($(function(){ 	
	//*************************************
	// Initialize
	//*************************************
	if(!sessionStorage.getItem('qtbNumber')) {
		window.open('index.html', '_self');
	}
	
	$( ".templateHeader" ).load( "templateHead.html" );	
	
	//*************************************
	//Get Username & Current Date
	//************************************	
	var dt = new Date().toLocaleDateString('en-US');
	$('.currentDateStamp').text(dt);
	$(".templateCreatorUsername").text(sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+  sessionStorage.getItem('qtbNumber')+')');
	setUserInformation();
	
	
	//*************************************
	// Get Categories for the Header
	//************************************
	
	$.ajax({
		type: "POST",
		url: 'db/db_getAllCategories.php',		
		dataType:'json',
		success: function(data){			
			//var $receivedCategories = "";
			$.each(data, function(index, element) {		
					$('.templateCategory').append( "<option value='"+element.Id+"'>"+element.Name+"</option>" );				
			});
			$("#response").html(data);	
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Categories from DB!", 'danger');
	});   
		
}));	



