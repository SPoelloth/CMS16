$(document).ready($(function(){ 	

	//*************************************
	// Initialize
	//*************************************
	$(document).find('.wmsHeader').show();	
	
	getAllWorksheets("active");	
	
	$( "#loadArchive" ).on( "click", function() {
		getAllWorksheets("inactive");	
	});

}));
	

function getAllWorksheets(progressStatus){
	if (progressStatus == 'active'){
		progStatus = '<100'
	}
	else if(progressStatus == 'inactive'){
		progStatus = '=100'
	}
	
	$.ajax({
		type: "POST",
		url: 'db/db_getAllWorksheets.php',
		data: {data: progStatus},
		dataType:'json',
		success: function(data){			
			var appendCode = "";			
			$.each(data, function(index, element) {		
				
				var progress = parseInt(element.Progress);
				
				appendCode +="<a href='index.html?site=showWorksheet&worksheetid="+element.WorksheetId+"' class='list-group-item'><b>"+(index+1)+".</b> "+element.WorksheetName+"</a>";	
				var bartype = (progress === 100 ? "success" : "warning");
				if(progress > 0) {
					appendCode += '<div class="progress"> <div class="progress-bar progress-bar-'+bartype+'" role="progressbar" aria-valuenow="'+ progress+'" aria-valuemin="0" aria-valuemax="100" style="width:'+progress+'%"> '+progress+'% Complete </div> </div>';
				} else {
					appendCode += '<div class="progress" style="border-radius:4px; height:20px;"> <div style="width:100%; height: 100%; line-height: 20px; color:black; text-align:left; padding-left:15px; background: #f5f5f5; font-size: 12px"> 0% Complete </div> </div>';
				}
			});		
			
			if (progressStatus == 'active'){
				$('#worksheetSelection').append(appendCode);			
			}
			else if(progressStatus == 'inactive'){
				$( ".maincontainer" ).html( '<h2>Archive</h2> <div id="worksheetSelection" class="list-group"> </div>' );
				$('#worksheetSelection').append(appendCode);
			}		
			
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Worksheets from DB!", 'danger');
	});                 					
}