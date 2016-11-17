
$(document).ready($(function(){ 	


	//*************************************
	// Initialize
	//*************************************
	$( ".templateHeader" ).load( "templateHead.html" );
	
	
	//Get & Set hiddenWorksheetId
	var worksheetId = getUrlParameter('worksheetid');
	$('#hiddenWorksheetId').text(worksheetId);
	
	if (worksheetId != null) {
		$.ajax({
			type: "POST",
			url: 'db/db_getWorksheetById.php',
			data: {data:worksheetId},
			dataType:'json',
			success: function(data){
			
				var appendCode = null;
				var lastRowPosition = null;
				
				$("#templateHeadlineName").text(data[0]["TemplateName"]);								
				$('#templateNo').text(data[0]["TemplateNo"]);
				$('#templateVersion').text(data[0]["TemplateVersionNo"]);
				$('#templateStatus').text(data[0]["TemplateStatus"]);
				$('#templateValidFor').text(data[0]["TemplateValidFor"]);
				$('#templateCategory').text(data[0]["TemplateCategory"]);	
				$('#templateAuthorQtbNumber').text(data[0]["TemplateAuthor"]);	
				$('#templateCreationDate').text(data[0]["TemplateCreationDate"]);	
				$('#worksheetAuthorQtbNumber').text(data[0]["WorksheetCreatorName"]);
				$('#worksheetCreationDate').text(data[0]["WorksheetCreationDate"]);
				
				
				$.each(data, function(index, element) {
					var frontRowNumber = "<td><span class='rownumberbadge'>"+element.RowNo+")</span></td>";				
					if (lastRowPosition == null) {
						appendCode = "<li class ='bs-callout bs-callout-primary' trid='"+element.TemplateRowId+"' rowposition='"+element.RowNo+"' colorid='"+element.ColorCode+"'><form><table><tr>"+frontRowNumber;
					}
					else if(lastRowPosition != element.RowNo) {
						appendCode +="</tr> </table></form></li><li class ='bs-callout bs-callout-primary' trid='"+element.TemplateRowId+"' rowposition='"+element.RowNo+"' colorid='"+element.ColorCode+"'><form><table><tr>"+frontRowNumber;
					}
					
					appendCode +=	"<td class='moduleElement' style='width:"+element.ColumnSize+"%'>"	;					
						appendCode += "<div mcid='"+element.ModuleColumnId+"' eid='"+element.ElementId+"' class='singleElement'>";
							//Only for elments with a ReplaceNumberByTom
							if (element.ReplaceNumberByTom != ""){								
								element.TemplateRowContentValue = element.TemplateRowContentValue.replace(element.ReplaceNumberByTom, element.WorksheetContentValue)
								appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
							//Only for elements where isTypeInput == 1
							} else if(element.isTypeInput == 1){								
								if (element.WorksheetContentValue != null && element.WorksheetContentValue != 'unchecked'){								
									//Only If WorksheetContentValue is NOT Null replace it with the WorksheetContentValue									
									//appendCode += '<a class="btn popoverOption" href="#" data-content="<b>'+element.WorksheetContentResponsiblePerson+'</b><br>'+element.WorksheetContentTimeStamp+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:">'+element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue)+'</a>';
									//appendCode += '<a class="btn popoverOption" href="#" data-content="<b>'+element.WorksheetContentResponsiblePerson+'</b><br>'+element.WorksheetContentTimeStamp+'<br><a class=enableElementButton>Enable</a>" data-toggle="popover" data-placement="bottom" data-original-title="Confirmed by:">'+element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue)+'</a>';
								}
								else {
									//If WorksheetContentValue is Null replace with templatevalue
									appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
								}
							//For all the other Elements
							} else if($(this).is(".btn-primary")) {
								//appendCode += '<a class="btn popoverOption" href="#" data-content="<b>'+element.WorksheetContentResponsiblePerson+'</b><br>'+element.WorksheetContentTimeStamp+'<br><a class=enableElementButton>Enable</a>" data-toggle="popover" data-placement="bottom" data-original-title="Confirmed by:">'+element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue)+'</a>';
								//Find last typeinput to add an confirmed by information
								var i = index-1;
								while(data[i].isTypeInput !== 1) {
									i--;
								}
								
								
								$($this).wrapAll( '<a class="btn popoverOption" href="#" data-content="<b>'+$qtbNumber+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );							
							}else{
								appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
							}
							
						appendCode += "</div>";		
					appendCode +=	"</td>";																
					
					lastRowPosition = element.RowNo;
				});
				
				$("#items-list").append(appendCode+"</tr></table></form></li>");	
			}				
		}).done(function() {
			
			//Disable all btnConfirmInput and Buttons if val != ''
		 /*   	$(".btn-primary.btnConfirmInput").each(function(){
				if ($.trim($(this).siblings("div").children("input").val()) != ''){													
					$(this).siblings("div").children("input").prop('disabled', true);
					$(this).attr('disabled', 'disabled');											
				}
			});   */
			
		   	$(".btn-primary").each(function(){
				
				if ($.trim($(this).parents("tr").find("input:text").val()) != '' || $(this).parents("tr").find("input").is(':checked')){
					$(this).parents("tr").find("input").prop('disabled', true);
					$(this).attr('disabled', 'disabled');	
					//$(this).animate({width:'0px', 'border-left-width':'0px', 'border-right-width':'0px', 'padding-left':'0px','padding-right':'0px'}, 500);
					//$(this).animate({'opacity': '0.3'}, 1000);
					//appendCode += '<a class="btn popoverOption" href="#" data-content="<b>'+element.WorksheetContentResponsiblePerson+'</b><br>'+element.WorksheetContentTimeStamp+'<br><a class=enableElementButton>Enable</a>" data-toggle="popover" data-placement="bottom" data-original-title="Confirmed by:">'+element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue)+'</a>';
					$($this).wrapAll( '<a class="btn popoverOption" href="#" data-content="<b>'+$qtbNumber+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );							
				} 		
			});   
			
			
			//Add Event Trigger
			//addPopUpEvents();
			
			//Disable for all Check RB their RB Group
			/*  $('input.editableRadiobutton').each(function(){
				if(this.checked){				
					$(this).parents('form').find('.editableRadiobutton').prop("disabled", true);
				}					
			});  */
			
			 $('input.editableRadiobutton').each(function(){
				if(this.checked){				
					$(this).parents('tr').find('input').prop('disabled', true);
					$(this).parents('tr').find('.btn-primary').attr('disabled', 'disabled');	
				}					
			}); 
			
			
			$('input.editableCheckbox').each(function(){
				if(this.checked){				
					$(this).parents('tr').find('input').prop('disabled', true);
					$(this).parents('tr').find('.btn-primary').attr('disabled', 'disabled');	
				}					
			});
			
			//Set background colors
			$('#items-list li ').each(function (index) {
				$(this).css( "background-color",$(this).attr('colorid'));
			});
			
			
		})
		.fail(function(){
			alert("Error - Can't get Worksheet from DB!");
		});                 					

	}
	
	
	//*************************************
	// For all Buttons .btnConfirmInput (next to an inputfield)
	//************************************
	/*  $(document).on("click",".btnConfirmInput",function(e) {
        ConfirmNotify(this);
    });  */

 	$(document).on("click",".btn-primary",function(e) {
        ConfirmNotify(this);
    });  
	
	
 	function ConfirmNotify(e) {
		//Find all input elements in the current row and check if they are all filled out
		var $worksheetContentElements = $(e).parents("tr").find("input");
		var $allInputsValid = true;
	 	$.each($worksheetContentElements, function(index, element) {
			 	if($(this).is(':text') && $(this).val() == '') {
					$allInputsValid = false;
					//alert("Text");
				} else if($(this).is(':radio')) {
					var $siblingRadioButtons = $(this).parents('tr').find(':radio');
					var $oneButtonIsChecked = false;
					$.each($siblingRadioButtons, function(index, element){
						if($(this).is(':checked')) {
							$oneButtonIsChecked = true;
						}
					});
					if(!$oneButtonIsChecked) {
						$allInputsValid = false;
					}  
					//alert("Radio");
				} else if($(this).is(':checkbox') && !$(this).is(':checked')) {
					$allInputsValid = false;
					//alert("Checkbox");
				}  
		});  
		
		//Check if all fields were filled out, otherwise show an alert message
		if($allInputsValid) {
			if (confirm('Are you sure this step is completed? This step will be confirmed, locked & signed with your Id!')) {
				//Collect all element information
				var $worksheetContent = [];
				var $worksheetId = $("#hiddenWorksheetId").text();
				var $templateRowId = $(e).closest('li').attr('trid');
				var $responsiblePersonId = sessionStorage.getItem('qtbNumber');	
				
				$.each($worksheetContentElements, function(index, element) {
					//all inputs of type text
					if($(this).is(':text')) {
						$worksheetContent.push({
							value: $(this).val(),
							moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
							templateRowId: $templateRowId,
							worksheetId: $worksheetId,
							responsiblePersonId: $responsiblePersonId
						});
					//all inputs of type radiobutton or checkbox
					} else if($(this).is(':checked')){
						$worksheetContent.push({
							value: 'checked',
							moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
							templateRowId: $templateRowId,
							worksheetId: $worksheetId,
							responsiblePersonId: $responsiblePersonId
						});
					}
				});
			
				//insert worksheet content into DB
				//alert(JSON.stringify($worksheetContent));
				
				$.ajax({
					type: "POST",
					url: 'db/db_saveWorksheetContent.php',
					data: {data: JSON.stringify($worksheetContent)},
					success: function(data){
						
						alert(data);
						
						
						//var $ownerButton = $(e).siblings("div").children("input");
						//$(e).animate({width:'0px', 'border-left-width':'0px', 'border-right-width':'0px', 'padding-left':'0px','padding-right':'0px'}, 500, function() {
							
							//$ownerButton.prop('disabled', true);							
						//});
						
						$(e).attr('disabled', 'disabled');
						$.each($worksheetContentElements, function(index, element) {
							$(this).attr('disabled', 'disabled');
							$(this).prop('disabled', 'disabled');
							
							//$($this).wrapAll( '<a class="btn popoverOption" href="#" data-content="<b>'+$qtbNumber+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );							
							//Add Event Trigger
							addPopUpEvents();
						});
						
						
						

					}				
				}).fail(function(){
					alert("Error - Couldn't insert worksheet content into DB!");
					return false;
				}).done(function() {
					//location.reload();
					
					
				});
			
			} else {
				return false;
			}
		} else {
			alert("You didn't fill out all required fields.");
			return false;
		}
		
		return true;
	}	 
	
	
	
	
	
 /* 	function ConfirmNotify(e) {
		var $value = $(e).siblings("div").children("input").val();
		var $moduleColumnId = $(e).parent("div").attr("mcid")
		var $worksheetId = $("#hiddenWorksheetId").text();
		var $qtbNumber = $("#hiddenUserName").text();		
		var dt = new Date().toLocaleString('en-US', { hour12: false});
		
		
		if ($value != ""){								
			if (confirm('Are you sure this step is completed? This step will be confirmed, locked & signed with your ID!')) {	
				$.ajax({
					type: "POST",
					url: 'db/db_confirmWorksheetContent.php',
					data: {'worksheetId': $worksheetId, 'moduleColumnId':$moduleColumnId , 'value': $value , 'qtbNumber': $qtbNumber},			
					success: function(data){
						var $ownerButton = $(e).siblings("div").children("input");
						$(e).animate({width:'0px','padding-left':'0px','padding-right':'0px'}, 500, function() {
							$(e).attr('disabled', 'disabled');
							$ownerButton.prop('disabled', true);							
						});
						
						$($ownerButton).wrapAll( '<a class="btn popoverOption" href="#" data-content="<b>'+$qtbNumber+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );							
						//Add Event Trigger
						addPopUpEvents();
						

					}				
				}).fail(function(){
					alert("Error - Can't sign with your signature!");
				});
				
							
			} else {
				return false;
			}
		} else{
			alert("You didn't fill out all required fields.");
		}
	}  */
	
	
	//*************************************
	// For all Disable Buttons
	//************************************
/* 	$(document).on("click",'button.editableDisableButton', function(){
		if (confirm('Are you sure this step is completed? This step will be confirmed, locked & signed with your ID!')) {	
			var $value = 'disabled';
			$(this).siblings("div").text($value);
			var $ownerButton= $(this);			
			var $contentposid = $(this).parent("div").attr("cpid")
			var $documentid = $("#hiddenDocumentID").text();
			var $usernameid = $("#hiddenUserName").text();		
			
			var dt = new Date().toLocaleString('en-US', { hour12: false});
			
			$.ajax({
				type: "POST",
				url: 'db/db_insertContentDocument.php',
				data: {'documentid': $documentid, 'contentpositionid':$contentposid , 'value': $value, 'username': $usernameid},			
				success: function(data){
					console.debug(data);
					$($ownerButton).prop("disabled", "disabled");
					$($ownerButton).wrap( '<a class="btn popoverOption" href="#" data-content="<b>'+$usernameid+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );
					//Add Event Trigger
					addPopUpEvents();
				}				
			}).fail(function(){
				alert("Error - Can't connect to DB!");
			});
		}
	}); */
	
	
		
	//*************************************
	// For all Radiobuttons
	//************************************
/*  	$(document).on("change",'input.editableRadiobutton', function(){
		if (confirm('Are you sure this step is completed? This step will be confirmed, locked & signed with your ID!')) {				
			//For the clicked RB
			var $usernameid = $("#hiddenUserName").text();
			var $ownerButton= $(this);
			var dt = new Date().toLocaleString('en-US', { hour12: false});		
			$($ownerButton).wrap( '<a class="btn popoverOption" href="#" data-content="<b>'+$usernameid+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></a>' );
			
			$(this).parents('form').find('.editableRadiobutton').prop("disabled", true);
			
			//Add Event Trigger
			addPopUpEvents();
			
			//For all RB 		
			var $value = this.checked ? 'checked' : 'unchecked';
			$(this).siblings("div#hiddenElementValue").text($value);	
			var $contentposid = $(this).parents("div .singleElement").attr("cpid")
			var $documentid = $("#hiddenDocumentID").text();
			var $usernameid = $("#hiddenUserName").text();
			var $ownerButton= $(this);
			var dt = new Date().toLocaleString('en-US', { hour12: false});
			$.ajax({
				type: "POST",
				url: 'db/db_insertContentDocument.php',
				data: {'documentid': $documentid, 'contentpositionid':$contentposid , 'value': $value, 'username': $usernameid},			
				success: function(data){
									
					console.debug(data);
				}				
			}).fail(function(){
				alert("Error - Can't get Module from DB!");
			});
		}		
	});  */
	
	
	//*************************************
	// For all Checkboxes
	//************************************
/*   	$(document).on("change",'input.editableCheckbox', function(){
		if (confirm('Are you sure this step is completed? This step will be confirmed, locked & signed with your ID!')) {	
				var $value = this.checked ? 'checked' : 'unchecked';
				$(this).siblings("div").text($value);
				
				var $contentposid = $(this).parent("div").attr("cpid")
				var $documentid = $("#hiddenDocumentID").text();
				var $usernameid = $("#hiddenUserName").text();
				var $ownerButton= $(this);
				var dt = new Date().toLocaleString('en-US', { hour12: false});
				
				$.ajax({
					type: "POST",
					url: 'db/db_insertContentDocument.php',
					data: {'documentid': $documentid, 'contentpositionid':$contentposid , 'value': $value, 'username': $usernameid},			
					success: function(data){
						console.debug(data);
						$($ownerButton).wrap( '<div class="btn popoverOption" href="#" data-content="<b>'+$usernameid+'</b><br>'+dt+'<br><a class=enableElementButton>Enable</a>" rel="popover" data-placement="bottom" data-original-title="Confirmed by:"></div>' );
						//Add Event Trigger
						addPopUpEvents();
					}				
				}).fail(function(){
					alert("Error - Can't get Module from DB!");
				});
		}
	}); */
	

}));  


	//*************************************
	// For all Element Pop Ups
	//************************************
function addPopUpEvents(){
	//Add Mouse Hover PopUp's for dynamic added elements 
	//$("[rel=popover]").popover({placement:'right', trigger: "click", toggle:"popover", trigger :"focus", html : true});	
	//$("[rel=popover]").popover({placement:'right', toggle:"popover", trigger:"focus", html: true});	
	$("[data-toggle=popover]").popover({placement:'bottom', toggle:"popover", trigger:"focus", html: true});	
	//Click on "Enable" in the Pop Up Box
	$(document).on("click",".enableElementButton",function(e) {
        enableElements(this);
    });
	
	
}	

function enableElements(popupElement){
		var $udi = $("#hiddenUserName").text();
		var $userIsPermited = 0; 
		$.ajax({
			type: "POST",
			url: 'db/db_getUserRightsByUserID.php',
			data: {'userid': $udi},	
			dataType:'json',			
			success: function(data){
				if(data.length > 0 && data[0].GroupID == 2){
					$userIsPermited = 1;					
				}
			}				
		}).fail(function(){
			alert("Error - Can't get Module from DddB!");
		}).done(function (){
			
			if($userIsPermited ==1){									
				var $did = $('#hiddenDocumentID').text();
				var $cpid = $(popupElement).parents(".singleElement").attr("cpid");
				$.ajax({
					type: "POST",
					url: 'db/db_deleteDocumentContentFromDocumentByID.php',
					data: {'documentid': $did,'contentpositionid': $cpid },			
					success: function(data){
						location.reload();   
					}				
				}).fail(function(){
					alert("Error - Can't get Module from DddB!");
				});	
			}
		});	

	
				
}


//*************************************
// Extract worksheetId from URI
//*************************************
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? false : sParameterName[1];
        }
    }
};