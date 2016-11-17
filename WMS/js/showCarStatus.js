$(document).ready($(function(){ 	

	//*************************************
	// Initialize
	//*************************************
	//Hide the header
	$(document).find('.wmsHeader').hide();	

	fillTableRows('=0', 'showCarStatusNotTested');
	fillTableRows('>0 AND Progress <100', 'showCarStatusInTesting');
	fillTableRows('=100', 'showCarStatusFinishedTesting');	
	
}));
	

//*****************************************
// Adjust the table height
//*****************************************	
var $numberOfCalls = 0;	
function adjustTableHeight(){
	//The global variable $numberOfCalls prevents the approach below from being called unnecessarily. Additionally
	//the parallel calls effect each other and end in chaos.
	if($numberOfCalls == 2){
		var $maxHeightContentArray = [];
		var $maxHeightDescriptionArray = [];
		//Create arrays with each elements heights
		$('.showCarsContent').each(function(){
			$maxHeightContentArray.push($(this).height());
		});		
		$('.showCarsDescription').each(function(){
			$maxHeightDescriptionArray.push($(this).height());
		});
		//Sort the arrays numerically, highest value first
		$maxHeightContentArray.sort(function(a, b){return b-a});
		$maxHeightDescriptionArray.sort(function(a, b){return b-a});
		//Get the first element of the array with the highest value and set it for every element
		$('.showCarsDescription').height($maxHeightDescriptionArray.shift());
		$('.showCarsContent').height($maxHeightContentArray.shift());
		return true;
	} else {
		$numberOfCalls++;
		return false;
	}
}	


//*****************************************
// Fill the table with content
//*****************************************	
function fillTableRows(progressStatus, containerId){
	var $tableCode = '';
	$.ajax({
		type: "POST",
		url: 'db/db_getAllWorksheets.php',
		data: {data: progressStatus},
		dataType:'json',
		success: function(data){					
			$.each(data, function(index, element) {					
				//$tableCode += "<tr data-href='index.html?site=showWorksheet&worksheetid="+element.WorksheetId+"' class='showCarsTableElements'><td>"+element.WorksheetName.split('_')[0]+"</td></tr>";			
				$tableCode += "<tr data-href='index.html?site=showWorksheet&worksheetid="+element.WorksheetId+"' class='showCarsTableElements'><td>"+element.WorksheetName+"</td></tr>";			
			});				
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Worksheets from DB!", 'danger');
		return null;
	}).done(function(){
		//Fill content into the container and adjust the height of the table with a small delay (without an delay it isn't always displayed properly)
		$('#'+containerId).find('tbody').html($tableCode);
		adjustTableHeight();
		initTableLinks();
	});         		
}


//*****************************************
// Initialize the click action on the
// rows to the worksheets
//*****************************************	
function initTableLinks(){
	$(".showCarsTableElements").click(function() {
        window.document.location = $(this).data("href");
    });
}


	