
$(document).ready($(function(){

	//*******************************************
	// Initialize
	//*******************************************
	$(document).find('.wmsHeader').hide();
	// if(!sessionStorage.getItem('qtbNumber')) {
		// window.open('index.html', '_self');
	// }

	//$( ".templateHeader" ).load( "templateHead.html" );

	//Get & Set hiddenWorksheetId
	var worksheetId = getUrlParameter('worksheetid');

	//Set username
	//setUserInformation();

	//Load worksheet
	if (worksheetId != null) {
		$('#hiddenWorksheetId').text(worksheetId);
		$.ajax({
			type: "POST",
			url: 'db/db_getWorksheetById.php',
			data: {data:worksheetId},
			dataType:'json',
			success: function(data){

				var appendCode = null;
				var lastRowPosition = null;

				//Set all information about the worksheet
				$("#templateHeadlineName").text(data[0]["WorksheetName"]);
				$('#templateNo').text(data[0]["TemplateNo"]);
				$('#templateVersion').text(data[0]["TemplateVersionNo"]);
				$('#templateStatus').text(data[0]["TemplateStatus"]);
				$('#templateValidFor').text(data[0]["TemplateValidFor"]);
				$('#templateCategory').text(data[0]["TemplateCategory"]);
				$('#templateAuthor').text(data[0]["TemplateAuthorFirstName"]+' '+data[0]["TemplateAuthorLastName"]+' ('+data[0]["TemplateAuthorQtbNumber"]+')');
				$('#templateCreationDate').text(data[0]["TemplateCreationDate"]);
				$('#worksheetAuthorQtbNumber').text(data[0]["WorksheetCreatorName"]);
				$('#worksheetCreationDate').text(data[0]["WorksheetCreationDate"]);
				$('#hiddenTemplateId').text(data[0]["TemplateId"]);

				$.get("worksheetRow.html", function(blancWorksheetRow){
					var $currentRow = null;
					var $lastRowPosition = null;
					var $isNewRow = false, $skipButtonNeeded = false;
					var $extraColumnSize = 0;
					//Set all rows of the worksheet
					$.each(data, function(index, element) {

						//Create a new row
					 	if($lastRowPosition === null || $lastRowPosition != element.RowNo) {
							//Remove the skip button if it's not needed
							if(!$skipButtonNeeded && $lastRowPosition !== null){
								$currentRow.find('.skipButton').closest('td').remove();
							}
							//Insert the new row into the items-list and select it
							$("#items-list").append($($.parseHTML(blancWorksheetRow)));
							$currentRow = $("#items-list").children('.worksheet-row:last');
							//Add the row number and some attributes for row's identification
							if(parseInt(element.RowNo) < 10){
								$currentRow.find('.rownumberbadge').html('  '+element.RowNo+')');
							} else {
								$currentRow.find('.rownumberbadge').html(element.RowNo+')');
							}

							$currentRow.attr({'trid': element.TemplateRowId, 'rowposition': element.RowNo, 'colorid': element.ColorCode});
							$isNewRow = true;
							$skipButtonNeeded = false;
							$extraColumnSize = 0;
						} else {
							$isNewRow = false;
						}


						//Check if a skip button is needed
					  	if($isNewRow){
							var $currentIndex = index;
							while($currentIndex < data.length && element.RowNo === data[$currentIndex].RowNo){
								if(data[$currentIndex].ElementName === 'Check Button'){
									$skipButtonNeeded = true;
									$extraColumnSize = 3;
									break;
								}
								$currentIndex++;
							}
						}


						//It's easiest to create every element as an string and append it rather than pre-defining it as html
						var $elementCode  = "<td class='moduleElement' style='width:"+element.ColumnSize*(100-3.5-$extraColumnSize)/100+"%'>";
							$elementCode += "<div class='singleElement' mcid='"+element.ModuleColumnId+"' eid='"+element.ElementId+"'>";

						//Only for elements with a ReplaceNumberByTom
						if (element.ReplaceNumberByTom != "" && element.WorksheetContentValue !== null){
							//As it is possible that one element contains multiple place holders [xxx] - [xxx] TOM inserts all values into the same tupel in the DB, separated by the dec ASCII value 10
							$splitCharacter = String.fromCharCode(10);
							$replaceNoArray = element.ReplaceNumberByTom.split($splitCharacter);
							$contentValues = element.WorksheetContentValue.split($splitCharacter);

							if($replaceNoArray.length === $contentValues.length){
								$.each($replaceNoArray, function(index){
									element.TemplateRowContentValue = element.TemplateRowContentValue.replace($replaceNoArray[index], $contentValues[index]);
								});
							}

							//element.TemplateRowContentValue = element.TemplateRowContentValue.replace(element.ReplaceNumberByTom, element.WorksheetContentValue)
							$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);

						//Only for elements where isTypeInput == 1
						} else if(element.isTypeInput == 1 && element.WorksheetContentValue != null){
							$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue);
						//For check button elements
						} else if (element.ElementName === "Check Button"){
							//If it's an check button also append Code of responsible person if row was already checked
							var i = index;
							var rowHasNoInput = true;
							if(element.WorksheetContentValue !== null) {
								rowHasNoInput = (element.WorksheetContentValue.substr(0, 7) === 'skipped' ? false : true);
							}
							while(rowHasNoInput && (i >= 1) && (element.RowNo == data[i].RowNo)) {
								i--;
								if((data[i].isTypeInput == 1) && (data[i].WorksheetContentValue != null)) {
									rowHasNoInput = false;
								}
							}
							//The input fields are already filled out
							if(!rowHasNoInput && element.WorksheetContentValue === null) {
								$elementCode += '<a href="javascript://" class="confirmedPopover" data-content="<b>'+data[i].WorksheetContentResponsiblePersonFirstName+' '+data[i].WorksheetContentResponsiblePersonLastName+' ('+data[i].WorksheetContentResponsiblePersonQtbNumber;
								$elementCode += ')</b><br>'+data[i].WorksheetContentTimeStamp+'<br><button type=button class=\'btn btn-primary enableElementButton\' style=\'margin-top:10px\'><b>Enable</b></button><div trid='+element.TemplateRowId+'></div>" data-toggle="popover"  data-original-title="<b>Confirmed by:</b>">';
								$elementCode += element.HtmlCode + '</a>';
							//The row was skipped
							} else if (!rowHasNoInput) {
								var commentText = element.WorksheetContentValue.substring(9, element.WorksheetContentValue.length-1);
								commentText = (commentText === '' ? "<i>The responsible person didn't left a comment.</i>" : commentText);
								$elementCode += '<a href="javascript://" class="skippedPopover" data-content="<b>'+data[i].WorksheetContentResponsiblePersonFirstName+' '+data[i].WorksheetContentResponsiblePersonLastName+' ('+data[i].WorksheetContentResponsiblePersonQtbNumber;
								$elementCode += ')</b><br>'+data[i].WorksheetContentTimeStamp+'<br><p class=half-line></p><b>Comment:</b><br>'+commentText+'<br><p class=half-line></p>';
								$elementCode += '<button type=button class=\'btn btn-primary enableElementButton\'><b>Enable</b></button><div trid='+element.TemplateRowId+'></div>" data-toggle="popover"  data-original-title="<b>Skipped by:</b>">';
								$elementCode += element.HtmlCode + '</a>';
							//The row wasn't touched so far
							} else {
								$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
							}
						//For all the other Elements
						} else {
							$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
						}

						$elementCode += "</div></td>";
						$currentRow.find('.insertElementsBefore').before($elementCode);
						$lastRowPosition = element.RowNo;
					});

					//As the algorithm above always removes the skip button when the next row is reached it is not done for the last row... Therefore we do it here manually
					if(!$('#items-list .worksheet-row:last').find('.checkButton').exists()){
						$('#items-list .worksheet-row:last').find('.skipButton').closest('td').remove();
					}


					//Set colors
					setColors();
					//Disable row if there's already an input
					$(".checkButton").each(function(){
						//if ($.trim($(this).parents("tr").find("input:text").val()) != '' || $(this).parents("tr").find("input").is(':checked') || $(this).parent('a').is('a')){
						if($(this).parents('.confirmedPopover, .skippedPopover').exists()){
							$(this).parents("tr").find("input").prop('disabled', true);
							$(this).parents("tr").find(".skipButton").prop('disabled', true);
							$(this).prop('disabled', true);
						}
					});

					//Add Event Trigger
					$(".confirmedPopover, .skippedPopover").each(function(){
						addPopUpEvent($(this).find('.checkButton'));
					});

					//Align all check and radio buttons
					alignAllElements();

					//Initialize enable buttons
					initializeEnableElementButtons();

					//Initialize skip buttons
					initializeSkipButtons();

					//Initialize the action events for each row
					$('.worksheet-row').each(function(){
						initializeRowsActionFunctions($(this));
					});

				});
			}
		}).done(function() {
			//Initialize print button
			initializePrintButton();
		})
		.fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Worksheet from DB!", 'danger');
		});

	} else {
		showBootstrapInfoDialog("Invalid URL", "Please specify a worksheet Id in the browser's URL", 'info');
	}





/* 	if (worksheetId != null) {
		$('#hiddenWorksheetId').text(worksheetId);
		$.ajax({
			type: "POST",
			url: 'db/db_getWorksheetById.php',
			data: {data:worksheetId},
			dataType:'json',
			success: function(data){

				var appendCode = null;
				var lastRowPosition = null;

				//Set all information about the worksheet
				$("#templateHeadlineName").text(data[0]["WorksheetName"]);
				$('#templateNo').text(data[0]["TemplateNo"]);
				$('#templateVersion').text(data[0]["TemplateVersionNo"]);
				$('#templateStatus').text(data[0]["TemplateStatus"]);
				$('#templateValidFor').text(data[0]["TemplateValidFor"]);
				$('#templateCategory').text(data[0]["TemplateCategory"]);
				$('#templateAuthor').text(data[0]["TemplateAuthorFirstName"]+' '+data[0]["TemplateAuthorLastName"]+' ('+data[0]["TemplateAuthorQtbNumber"]+')');
				$('#templateCreationDate').text(data[0]["TemplateCreationDate"]);
				$('#worksheetAuthorQtbNumber').text(data[0]["WorksheetCreatorName"]);
				$('#worksheetCreationDate').text(data[0]["WorksheetCreationDate"]);

				//Set all rows of the worksheet
				$.each(data, function(index, element) {
					//Starting and ending rows
					var frontRowNumber = "<td><span class='rownumberbadge'>"+element.RowNo+")</span></td>";
					if (lastRowPosition == null) {
						appendCode = "<li class ='bs-callout bs-callout-primary' trid='"+element.TemplateRowId+"' rowposition='"+element.RowNo+"' colorid='"+element.ColorCode+"'><form><table><tr>"+frontRowNumber;
					}
					else if(lastRowPosition != element.RowNo) {
						appendCode +="</tr> </table></form></li><li class ='bs-callout bs-callout-primary' trid='"+element.TemplateRowId+"' rowposition='"+element.RowNo+"' colorid='"+element.ColorCode+"'><form><table><tr>"+frontRowNumber;
					}

					//Single elements of every row
					appendCode += "<td class='moduleElement' style='width:"+element.ColumnSize+"%'>";
					appendCode += "<div mcid='"+element.ModuleColumnId+"' eid='"+element.ElementId+"' class='singleElement'>";

					//Only for elements with a ReplaceNumberByTom
					if (element.ReplaceNumberByTom != ""){
						element.TemplateRowContentValue = element.TemplateRowContentValue.replace(element.ReplaceNumberByTom, element.WorksheetContentValue)
						appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);

					//Only for elements where isTypeInput == 1
					} else if(element.isTypeInput == 1 && element.WorksheetContentValue != null){
						appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.WorksheetContentValue);

					//For check button elements
					} else if (element.ElementName === "Check Button"){
						//If it's an checkbutton also append Code of responsible person if row was already checked
						var i = index;
						var rowHasNoInput = true;
						if(element.WorksheetContentValue !== null) {
							rowHasNoInput = (element.WorksheetContentValue.substr(0, 7) === 'skipped' ? false : true);
						}
						while(rowHasNoInput && (i >= 1) && (element.RowNo == data[i].RowNo)) {
							i--;
							if((data[i].isTypeInput == 1) && (data[i].WorksheetContentValue != null)) {
								rowHasNoInput = false;
							}
						}
						//The input fields are already filled out
						if(!rowHasNoInput && element.WorksheetContentValue === null) {
							appendCode += '<a href="javascript://" class="confirmedPopover" data-content="<b>'+data[i].WorksheetContentResponsiblePersonFirstName+' '+data[i].WorksheetContentResponsiblePersonLastName+' ('+data[i].WorksheetContentResponsiblePersonQtbNumber;
							appendCode += ')</b><br>'+data[i].WorksheetContentTimeStamp+'<br><button type=button class=\'btn btn-primary enableElementButton\' style=\'margin-top:10px\'><b>Enable</b></button><div trid='+element.TemplateRowId+'></div>" data-toggle="popover"  data-original-title="<b>Confirmed by:</b>">';
							appendCode += element.HtmlCode + '</a>';
						//The row was skipped
						} else if (!rowHasNoInput) {
							var commentText = element.WorksheetContentValue.substring(9, element.WorksheetContentValue.length-1);
							commentText = (commentText === '' ? "<i>The responsible person didn't left a comment.</i>" : commentText);
							appendCode += '<a href="javascript://" class="skippedPopover" data-content="<b>'+data[i].WorksheetContentResponsiblePersonFirstName+' '+data[i].WorksheetContentResponsiblePersonLastName+' ('+data[i].WorksheetContentResponsiblePersonQtbNumber;
							appendCode += ')</b><br>'+data[i].WorksheetContentTimeStamp+'<br><p class=half-line></p><b>Comment:</b><br>'+commentText+'<br><p class=half-line></p>';
							appendCode += '<button type=button class=\'btn btn-primary enableElementButton\'><b>Enable</b></button><div trid='+element.TemplateRowId+'></div>" data-toggle="popover"  data-original-title="<b>Skipped by:</b>">';
							appendCode += element.HtmlCode + '</a>';
						//The row wasn't touched so far
						} else {
							appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
						}

					//For all the other Elements
					} else {
						appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.TemplateRowContentValue);
					}

					appendCode += "</div>";
					appendCode += "</td>";

					//If it's an input row append an skip button
					if(element.ElementName === 'Check Button') {
						appendCode += '<td><button type="button" class="btn btn-primary skipButton">';
						appendCode += '<span class="glyphicon glyphicon-forward"></span></button></td>';
					}

					lastRowPosition = element.RowNo;
				});

				$("#items-list").append(appendCode+"</tr></table></form></li>");
			}
		}).done(function() {

			//Disable row if there's already an input
		   	$(".checkButton").each(function(){
				if ($.trim($(this).parents("tr").find("input:text").val()) != '' || $(this).parents("tr").find("input").is(':checked') || $(this).parent('a').is('a')){
					$(this).parents("tr").find("input").prop('disabled', true);
					$(this).parents("tr").find(".skipButton").prop('disabled', true);
					$(this).prop('disabled', true);
				}
			});

			//Add Event Trigger
			$(".confirmedPopover, .skippedPopover").each(function(){
				addPopUpEvent($(this).children('.checkButton'));
			});
			initializeEnableElementButtons();

			//Set colors
			setColors();

			//Initialize skip buttons
			initializeSkipButtons();

			//Initialize print button
			initializePrintButton();

			//Normalize the row height and set elements to the middle if they are now check rows
			$('#items-list li').each(function() {
				$(this).height(30);
				if(!$(this).find('.checkButton').exists()) {
					$(this).css('padding-top', '13px');
				}
			});

		})
		.fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Worksheet from DB!", 'danger');
		});

	} else {
		showBootstrapInfoDialog("Invalid URL", "Please specify a worksheet Id in the browser's URL", 'info');
	} */


	//*******************************************
	// For all Buttons of class .checkButton
	// (at the end of rows with input elements)
	//*******************************************
 	$(document).on("click",".checkButton",function(e) {
        saveInputFields(this, true);
    });


	//*******************************************************
	// Show a delete button if the user is permitted (=admin)
	//*******************************************************
	enterUserManagement(false, function(isPermitted){
		if(isPermitted){
			$('.deleteWorksheet').show().click(function(){
				showBootstrapConfirmDialog('Confirm to delete worksheet', "Are you sure you want to delete this worksheet? All information will be gone and can't be restored!", 'warning', function(result) {
					if(result){
						$worksheetId = $('#hiddenWorksheetId').html();

						$.ajax({
							type: "POST",
							url: 'db/db_deleteWorksheet.php',
							data: {data: $worksheetId}
						}).fail(function(){
							showBootstrapInfoDialog("Error", "Can't delete worksheet from DB!", 'danger');
							return false;
						}).done(function(){
							location.href = 'index.html?site=selWs';
						});

					}
					//END IF RESULT
				});
				//END DIALOGUE
			});
			//END CLICK EVENT
		}
		//END IF ISPERMITTED
	});

}));


//*******************************************
// Save all input fields in the DB
//*******************************************
function saveInputFields(button, doCheck, $confirmText) {
	//First of all check if all previous rows with inputs are checked
	/* var $previousRow = $(button).parents('.worksheet-row').prev('.worksheet-row');
	var $keepOnSearching = true;
	while($keepOnSearching && $previousRow.exists()){
		var $checkButton = $previousRow.find('.checkButton');
		$keepOnSearching = ($checkButton.exists() ? false : true);
		if(!$keepOnSearching && !$checkButton.parents('.confirmedPopover, .skippedPopover').exists()) {
			showBootstrapInfoDialog("Invalid operation", "You can't confirm this row as long as you don't confirm skip the previous ones!", 'info');
			return false;
		}
		$previousRow = $previousRow.prev('.worksheet-row');
	}
	 */
	if(doCheck && !allPreviousRowsCheckedOrSkipped($(button).parents('.worksheet-row'))){
		showBootstrapInfoDialog("Invalid operation", "You can't confirm this row as long as you don't confirm skip the previous ones!", 'info');
		return false;
	}

	//Find all input elements in the current row and check if they are all filled out
	var $worksheetContentElements = $(button).parents("tr").find("input");
	var $allInputsValid = true;
	if(doCheck){
		$.each($worksheetContentElements, function(index, element) {
				if($(this).is(':text') && $(this).val() == '') {
					$allInputsValid = false;
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
				} else if($(this).is(':checkbox') && !$(this).is(':checked')) {
					$allInputsValid = false;
				}
		});
	}

	//Check if all fields were filled out, otherwise show an alert message
	if($allInputsValid && doCheck) {
		showBootstrapConfirmDialog('Confirm row', "Are you sure this step is completed? This step will be confirmed, locked & signed with your Id!", 'info', function(result) {
			if(result){
				saveInputFieldsInDb(button, $worksheetContentElements, null);
	/* 			//Collect all element information
				var $worksheetContent = [];
				var $worksheetId = $("#hiddenWorksheetId").text();
				var $templateRowId = $(button).closest('.worksheet-row').attr('trid');
				var $responsiblePersonQtbNumber = sessionStorage.getItem('username');

				$.each($worksheetContentElements, function(index, element) {
					//all inputs of type text
					if($(this).is(':text')) {
						$worksheetContent.push({
							value: $(this).val(),
							moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
							templateRowId: $templateRowId,
							worksheetId: $worksheetId,
							responsiblePersonQtbNumber: $responsiblePersonQtbNumber
						});
					//all inputs of type radiobutton or checkbox
					} else if($(this).is(':checked')){
						$worksheetContent.push({
							value: 'checked',
							moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
							templateRowId: $templateRowId,
							worksheetId: $worksheetId,
							responsiblePersonQtbNumber: $responsiblePersonQtbNumber
						});
					}
				});

				//insert worksheet content into DB
				$.ajax({
					type: "POST",
					url: 'db/db_saveWorksheetContent.php',
					data: {data: JSON.stringify($worksheetContent)},
					success: function(data){

						//Disable this button and all elements in this template row
						$(button).prop('disabled', true);
						$(button).parents("tr").find(".skipButton").prop('disabled', true);
						$.each($worksheetContentElements, function(index, element) {
							//$(this).attr('disabled', 'disabled');
							$(this).prop('disabled', true);
						});

						//Add information about who signed this row
						$(button).wrapAll('<a class="confirmedPopover" href="javascript://" data-content="<b>'+sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+$responsiblePersonQtbNumber+')</b><br>'+data+'<br><button type=button class=\'btn btn-primary enableElementButton\' style=\'margin-top:10px\'><b>Enable</b></button><div trid='+$templateRowId+'></div>" data-toggle="popover"  data-original-title="Confirmed by:">');
						//Add Event Trigger
						addPopUpEvent(button);
						initializeEnableElementButtons();
					}
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Couldn't insert worksheet content into DB!", 'danger');
					return false;
				}); */
			} else {
				return false;
			}
		});
	//Event triggered confirm
	} else if (!doCheck){
		return saveInputFieldsInDb(button, $worksheetContentElements, $confirmText);
	} else {
		showBootstrapInfoDialog("Invalid operation", "You didn't fill out all required fields.", 'warning');
		return false;
	}

	return true;
}



//*******************************************
// Confirm row
//*******************************************
function saveInputFieldsInDb(button, $worksheetContentElements, $confirmText){
	//Collect all element information
	var $worksheetContent = [];
	var $worksheetId = $("#hiddenWorksheetId").text();
	var $templateRowId = $(button).closest('.worksheet-row').attr('trid');
	var $responsiblePersonQtbNumber = sessionStorage.getItem('username');
	$confirmText = $confirmText === null ? '' : $confirmText;
	console.log('Confirm text: '+$confirmText);

	$.each($worksheetContentElements, function(index, element) {
		//all inputs of type text
		if($(this).is(':text')) {
			$worksheetContent.push({
				value: $(this).val(),
				moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
				templateRowId: $templateRowId,
				worksheetId: $worksheetId,
				responsiblePersonQtbNumber: $responsiblePersonQtbNumber
			});
		//all inputs of type radiobutton or checkbox
		} else if($(this).is(':checked')){
			$worksheetContent.push({
				value: 'checked',
				moduleColumnId: $(this).closest('.singleElement').attr('mcid'),
				templateRowId: $templateRowId,
				worksheetId: $worksheetId,
				responsiblePersonQtbNumber: $responsiblePersonQtbNumber
			});
		}
	});

	//insert worksheet content into DB
	return $.ajax({
		type: "POST",
		url: 'db/db_saveWorksheetContent.php',
		data: {data: JSON.stringify($worksheetContent)},
		success: function(data){

			//Disable this button and all elements in this template row
			$(button).prop('disabled', true);
			$(button).parents("tr").find(".skipButton").prop('disabled', true);
			$.each($worksheetContentElements, function(index, element) {
				//$(this).attr('disabled', 'disabled');
				$(this).prop('disabled', true);
			});

			//Add information about who signed this row
			$(button).wrapAll('<a class="confirmedPopover" href="javascript://" data-content="<b>'+sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+$responsiblePersonQtbNumber+')</b><br>'+data+'<br>'+$confirmText+'<button type=button class=\'btn btn-primary enableElementButton\' style=\'margin-top:10px\'><b>Enable</b></button><div trid='+$templateRowId+'></div>" data-toggle="popover"  data-original-title="Confirmed by:">');
			//Add Event Trigger
			addPopUpEvent(button);
			initializeEnableElementButtons();
			//Launch action event
			$(button).trigger('actionEvent0');
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Couldn't insert worksheet content into DB!", 'danger');
	});

}




//*******************************************
// For all Element Pop Ups
//*******************************************
function addPopUpEvent(element){
	//Add Mouse Focus popups for dynamic added elements
	//$("[data-toggle=popover]").popover({placement:'bottom', trigger:'focus', html: true, container: 'body'});
	$(element).parents('a').popover({placement:'bottom', trigger:'focus', html: true, container: 'body'});
	//$(element).on('click', function(e) {e.preventDefault(); return true;});
}

//*******************************************
// Set event listener for enableElementButtons
//*******************************************
function initializeEnableElementButtons(){
	//Click on "Enable" in the Pop Up Box
	$(document).on("click",".enableElementButton",function(e) {
        enableElements(this);
    });
}


//*******************************************
// Re-enable rows
//*******************************************
function enableElements(popupElement){
		var $qtbNumber = sessionStorage.getItem('username');
		var $userIsPermited = false;
		//Check if the current user is permitted to re-enable that element. If not
		$.ajax({
			type: "POST",
			url: 'db/db_getUserInfos.php',
			data: {'qtbNumber': $qtbNumber},
			dataType:'json',
			success: function(data){
				if(data.length > 0 && data[0].GroupName.toLowerCase() == 'admin'){
					$userIsPermited = true;
				}
			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get user rights from DB!", 'danger');
		}).done(function (){

			if($userIsPermited){
				//Activate the elements in that row again
			 	var $trid = $(popupElement).siblings('div').attr('trid');
				var $templateRow = $('#items-list li[trid="'+$trid+'"]');
				$templateRow.find('input').prop('disabled', false);
				$templateRow.find('.checkButton').prop('disabled', false);
				$templateRow.find('.skipButton').prop('disabled', false);
				//Also remove the popover
				var $button = $templateRow.find('.checkButton').parents('.confirmedPopover, .skippedPopover').html();
				$templateRow.find('.checkButton').parents('.singleElement').html($button);
			} else {
				showBootstrapInfoDialog("Insufficient user rights", "You don't have the permissions to re-enable this worksheet content.", 'warning');
			}
		});
}




//*******************************************
// Set background colors for buttons and rownumberbadges
//*******************************************
function setColors() {
	$('.worksheet-row').each(function (index) {
		var rowColor = $(this).attr('colorid');
		rowColor = (rowColor === '' ? '#FFFFFF' : rowColor);
		var contrastColor = jQuery.Color(rowColor).contrastColor();
		var contrastColor2 = (contrastColor == 'white' ? 'black' : 'white');

		$(this).css("background-color", rowColor);
		$(this).find('.rownumberbadge').css({'background-color': contrastColor, 'color': contrastColor2});
		$(this).find('.buttonContainer').css({'border-color': contrastColor2});
		$(this).find('.checkButton, .skipButton').css({'background-color': contrastColor, 'color': contrastColor2});
	});
}


//*******************************************
// Initialize Skip buttons
//*******************************************
function initializeSkipButtons() {
	//Add a popover if it's clicked on the skipButton
	$('.skipButton').each(function (index) {
		var $tableRowId = $(this).parents('li').attr('trid');
		//Add popover
		$(this).popover({
			html: true,
			placement:'bottom',
			content: "<div>Why do you want to skip this step?<textarea class='form-control' rows='5' maxlength='256' placeholder='Comment' autofocus=true style='margin: 10px 0px 10px 0px;'></textarea><button type='button' class='btn btn-danger confirmSkip' trid='"+$tableRowId+"'><b>Skip</b></button></div>",
			title: '<b>Skip this step?</b>',
			container: 'body'
		});
	});

	//Event handling when the skip is confirmed
	$(document).on("click",".confirmSkip",function(e) {
		var $button = $(this);
		//First of all check if all previous rows with inputs are checked
		if(!allPreviousRowsCheckedOrSkipped($('#items-list').find('.worksheet-row[trid="'+$(this).attr('trid')+'"]'))){
			showBootstrapInfoDialog("Invalid operation", "You can't skip this row as long as you don't confirm skip the previous ones!", 'info');
			return false;
		}

		//Otherwise start to collect information
        var $commentText = $(this).siblings('textarea').val();
		var $confirmationText = ($commentText === '' ? "Are you sure you want to skip this step WITHOUT a comment?" : "Are you sure you want to skip this step?");
		showBootstrapConfirmDialog('Confirm to skip row', $confirmationText, 'info', function(result) {
			if(result){
				//Collect the row data and save in this case the check button in the DB. Note: If a row is not skipped but confirmed the check button is not saved in the DB!!!
				var $templateRow = $('#items-list').find('.worksheet-row[trid="'+$button.attr('trid')+'"]');
				var $worksheetContent = [];
				$worksheetContent.push({
					value: 'skipped ('+$commentText+')',
					moduleColumnId: $templateRow.find('.checkButton').closest('.singleElement').attr('mcid'),
					templateRowId: $templateRow.attr('trid'),
					worksheetId: $("#hiddenWorksheetId").text(),
					responsiblePersonQtbNumber: sessionStorage.getItem('qtbNumber'),
					commentText: $commentText
				});
				skipRow($worksheetContent, $templateRow);

/* 				//Save the data in the DB
				$.ajax({
					type: "POST",
					url: 'db/db_saveWorksheetContent.php',
					data: {data: JSON.stringify($worksheetContent)},
					success: function(data){
						var $worksheetContentElements = $templateRow.find("input");
						//Disable the skip button and check button
						$templateRow.find('.skipButton').prop('disabled', true);
						$templateRow.find('.checkButton').prop('disabled', true);
						//$templateRow.find('.checkButton').attr('disabled', 'disabled');

						//Disable and clear all elements in this template row
						$.each($worksheetContentElements, function(index, element) {
							//$(this).attr('disabled', 'disabled');
							$(this).prop('disabled', true);
							if($(this).is(':radio') || $(this).is(':checkbox')) {
								$(this).prop('checked', false);
							} else if($(this).is(':text')){
								$(this).val('');
							}
						});

						//Add information about who signed this row
						$commentText = ($commentText === '' ? "<i>The responsible person didn't left a comment.</i>" : $commentText);
						var $popoverContent = '<a class="skippedPopover" href="javascript://" data-content="<b>'+sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+sessionStorage.getItem('qtbNumber')+')</b><br>'+data+'<br>';
						$popoverContent += '<p class=half-line></p><b>Comment:</b><br>'+$commentText+'<br><p class=half-line></p><button type=button class=\'btn btn-primary enableElementButton\'><b>Enable</b></button>';
						$popoverContent += '<div trid='+$templateRow.attr('trid')+'></div>" data-toggle="popover" data-original-title="<b>Skipped by:</b>">';
						$templateRow.find('.checkButton').wrapAll($popoverContent);

						//Add Event Trigger
						addPopUpEvent($templateRow.find('.checkButton'));
						initializeEnableElementButtons();

						//Disable skip popover from this element
						$templateRow.find('.skipButton').popover('hide');
					}
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Couldn't save worksheet content in DB!", 'danger');
					return false;
				}); */
			}
 		});
    });
	return true;
}


//*******************************************
// Save skip row
//*******************************************
function skipRow($worksheetContent, $templateRow){
	//Save the data in the DB
	return $.ajax({
		type: "POST",
		url: 'db/db_saveWorksheetContent.php',
		data: {data: JSON.stringify($worksheetContent)},
		success: function(data){
			var $worksheetContentElements = $templateRow.find("input");
			//Disable the skip button and check button
			$templateRow.find('.skipButton').prop('disabled', true);
			$templateRow.find('.checkButton').prop('disabled', true);
			//$templateRow.find('.checkButton').attr('disabled', 'disabled');

			//Disable and clear all elements in this template row
			$.each($worksheetContentElements, function(index, element) {
				//$(this).attr('disabled', 'disabled');
				$(this).prop('disabled', true);
				if($(this).is(':radio') || $(this).is(':checkbox')) {
					$(this).prop('checked', false);
				} else if($(this).is(':text')){
					$(this).val('');
				}
			});

			var $commentText = $worksheetContent[0].commentText;

			//Add information about who signed this row
			$commentText = ($commentText === '' ? "<i>The responsible person didn't left a comment.</i>" : $commentText);
			var $popoverContent = '<a class="skippedPopover" href="javascript://" data-content="<b>'+sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+sessionStorage.getItem('qtbNumber')+')</b><br>'+data+'<br>';
			$popoverContent += '<p class=half-line></p><b>Comment:</b><br>'+$commentText+'<br><p class=half-line></p><button type=button class=\'btn btn-primary enableElementButton\'><b>Enable</b></button>';
			$popoverContent += '<div trid='+$templateRow.attr('trid')+'></div>" data-toggle="popover" data-original-title="<b>Skipped by:</b>">';
			$templateRow.find('.checkButton').wrapAll($popoverContent);

			//Add Event Trigger
			addPopUpEvent($templateRow.find('.checkButton'));
			initializeEnableElementButtons();

			//Disable skip popover from this element
			$templateRow.find('.skipButton').popover('hide');

			//Launch action event
			$templateRow.find('.checkButton').trigger('actionEvent0');
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Couldn't save worksheet content in DB!", 'danger');
		//return false;
	});

}


//*************************************
// Check if all previous rows were
// confirmed or skipped
//*************************************
function allPreviousRowsCheckedOrSkipped($worksheetRow){
	var $prevRowsOk = true;
	$('.worksheet-row').each(function(){
		if($(this).is($worksheetRow)){
			return false;				//break each loop
		}else if($(this).find('.checkButton').exists() && !$(this).find('.confirmedPopover, .skippedPopover').exists()){
			$prevRowsOk = false;
			return false;				//break each loop
		}
	});

	return $prevRowsOk;
}


//*************************************
// Initialize print button
//*************************************
function initializePrintButton(){
	//Configurate popover content
	var $printConfigurationContent = "<div id='printPopover'>Do you want to configure additional print options?<form><div style='margin-top: 5px;'>";
	$printConfigurationContent += "<label class='radio-inline'><input type='radio' class='printOptionSelection' name='printOptionSelection' value='yes'>Yes</input></label>";
	$printConfigurationContent += "<label class='radio-inline'><input type='radio' class='printOptionSelection' name='printOptionSelection' checked='checked' value='no'>No</input></label>";
	$printConfigurationContent += "<div class='checkbox'><label><input type='checkbox' value='printResponsibleInformation' checked='checked'>Print confirm and skip information</label></div></div>";
	$printConfigurationContent += "<div id='printOptions' style='display: none;'><hr style='margin-top:10px;margin-bottom:10px;border-top-width:2px;'></hr>";
	$printConfigurationContent += "<div class='checkbox'><label><input type='checkbox' value='printRowColors'>Print row colors</label></div>";
	$printConfigurationContent += "<div class='checkbox'><label><input type='checkbox' value='printPageNumbers'>Print page numbers</label></div>";
	$printConfigurationContent += "<div class='checkbox'><label><input type='checkbox' value='printDateAndTime'>Print date and time</label></div></div>";
	$printConfigurationContent += "<button type='button' class='btn btn-primary printNow' style='margin-top: 10px;'><span class='glyphicon glyphicon-print' style='padding-right:10px'></span><b>Print now</b></button></form></div>";

	//Initialize popover
	$('.printAll').popover({
		html: true,
		placement: 'bottom',
		trigger: 'click',
		content: $printConfigurationContent,
		title: '<b>Print options:</b>',
		container: 'body'
	});

	//Initialize content
	$('.printAll').on('shown.bs.popover', function(){
		//Initialize radio buttons
		$('#printPopover .printOptionSelection').change(function() {
			if($('#printPopover').find('.printOptionSelection:checked').val() === 'yes') {
				$('#printPopover #printOptions').show();
			} else {
				$('#printPopover #printOptions').hide();
			}
		});


		//Initialize  print now button
		$('#printPopover .printNow').click(function() {
			var $printOptions = null;
			var $wshell = null;
			if($(this).siblings('div').find('.printOptionSelection:checked').val() === 'yes'){
				var $optionCheckboxes = $(this).siblings('#printOptions');
				$printOptions = {
					printResponsibleInformation: 	$(this).siblings('div').find('input[value="printResponsibleInformation"]').prop('checked'),
					printRowColors: 				$optionCheckboxes.find('input[value="printRowColors"]').prop('checked'),
					printPageNumbers: 				$optionCheckboxes.find('input[value="printPageNumbers"]').prop('checked'),
					printDateAndTime: 				$optionCheckboxes.find('input[value="printDateAndTime"]').prop('checked')
				};
				$wshell = new ActiveXObject("WScript.Shell");
			} else {
				$printOptions = {
					printResponsibleInformation: 	$(this).siblings('div').find('input[value="printResponsibleInformation"]').prop('checked')
				};
			}
			$('.printAll').popover('hide');
			printWorksheet($printOptions, $wshell);
			//printWorksheetOld();
		});
	});
}


//*************************************
// Print the current worksheet
//*************************************
function printWorksheet(printOptions, wshell){
	//Open a new window and clone the html object of the currently open template
	var mywindow = window.open('', 'Print window', "height=900,width=1280,scrollbars=yes,resizable=yes,status=yes,top=0");
	var myDoc = mywindow.document;
	var printContentObject = $('html').clone();

	//Remove all scripts as otherwise every row is added a second time
	$(printContentObject).find('script').each(function(){
		$(this).remove();
	});

	//Add information to every row if it's an input row: who checked, when .... or who skipped it?
	if(printOptions.printResponsibleInformation){
		$(printContentObject).find('#items-list .worksheet-row .checkButton').each(function(){
			if($(this).parents('.confirmedPopover, .skippedPopover').exists()) {
				var $responsibleInformation = $(this).parents('.skippedPopover, .confirmedPopover').attr('data-content').replace('<b>', '').replace('</b>', '');
				var $performedAction = $(this).parents('.skippedPopover, .confirmedPopover').attr('data-original-title').replace('<b>', '').replace('</b>', '');
				var $rowColor = $(this).parents('.worksheet-row').css('background-color');

				$(this).parents('.worksheet-row').after("<li class='worksheet-row' style='background-color:"+$rowColor+" !important;'><div style='color: "+$(this).parents('.worksheet-row').find('.rownumberbadge').css('background-color')+" !important;'>"+$performedAction+" "+$responsibleInformation+"</div></li>");
				$(this).parents('.worksheet-row').next('.worksheet-row').find('.enableElementButton').remove();
				$(this).parents('.worksheet-row').next('.worksheet-row').find('div div').remove();
				$(this).parents('.worksheet-row').next('.worksheet-row').find('div br:first').after("on ");
				$(this).parents('.worksheet-row').next('.worksheet-row').find('div p.half-line:last').remove();
				$(this).parents('.worksheet-row').next('.worksheet-row').find('div p.half-line:last').nextAll('br:last').remove();
			}
		});
	}

 	//Remove all check and skip buttons, add the width of the skip buttons to the first element in each row
	$(printContentObject).find('.worksheet-row').each(function(){
		$(this).find('.skipButton').parents('td').remove();
		var $checkButton = $(this).find('.checkButton');
		if($checkButton.exists()) {
			$checkButton.parents('td').remove();
			var $remainingElements = $(this).find('.singleElement').not(':has(.editableCheckbox, .editableRadiobutton)').parents('td');
			var $additionalWidth = 6/$remainingElements.length;
			$remainingElements.each(function(){
				var $newWidth = $(this).width() + $additionalWidth;
				$(this).css('width', $newWidth+'%');
			});
		}
		//Also remove the margin from the form
		$(this).children('form').css('margin-bottom', '0px');
	});

	//Remove the print button above the template header
	$(printContentObject).find('.printAll').remove();
	//Remove anything from the body except html we need for printing
	$(printContentObject).find('body').children(':not(.container)').remove();
	$(printContentObject).find('.maincontainer .row >:first').remove();
	$(printContentObject).find('#hiddenWorksheetId').remove();

	//Adjust some visual appearances
	//Remove the border from the documentframe
	$(printContentObject).find('.documentframe').css({'border':'none', 'padding':'0px 0px 0px 0px'});

	//Remove some margin from the top
	$(printContentObject).find('.row').css('margin-top', '0px');

	//Prevent any text from line breaking
	$(printContentObject).find('.worksheet-row .editableText').css('white-space', 'nowrap');

	//Add a little space above the template headline name
	$(printContentObject).find('#list').children().first().before('<div id="informationField"></div>');

	//Build the template header again as the style is weird after printing
	var $container = $(printContentObject).find('#worksheetContainer');
	$container.children('div:not(:last-child)').remove();
	var $headerInformation = {
		name: 		$(document).find("#templateHeadlineName").text(),
		no: 		$(document).find("#templateNo").text(),
		version: 	$(document).find("#templateVersion").text(),
		status: 	$(document).find("#templateStatus").text(),
		validFor: 	$(document).find("#templateValidFor").text(),
		category: 	$(document).find("#templateCategory").text()
	};

 	var $containerContent = "<div style='clear:right;padding:10px 10px 10px 10px;margin-bottom:20px;border:1px solid black;background-color:#f2f8ff !important;'>";
	$containerContent += "<h4><div style='float:left;'><b>Name:</b></div><div style='padding-left:180px;'>"+$headerInformation.name+"</div></h4>";
	$containerContent += "<h5><div style='float:left;'><b>No.:</b></div><div style='padding-left:180px;'>"+$headerInformation.no+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Version:</b></div><div style='padding-left:180px;'>"+$headerInformation.version+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Status:</b></div><div style='padding-left:180px;'>"+$headerInformation.status+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Valid for:</b></div><div style='padding-left:180px;'>"+$headerInformation.validFor+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Category:</b></div><div style='padding-left:180px;'>"+$headerInformation.category+"</div></h5>";
	$containerContent += "</div>";
	$container.find('#list').children(':first').after($containerContent);

	//Add some information to the printout view
	$(printContentObject).find('footer hr').remove();
	$(printContentObject).find('footer:first').css('padding-top', '20px');;
	$(printContentObject).find('.maincontainer footer p:last').after("<p>"+$('#standardFooter').html()+"</p>");

	$(printContentObject).find('#standardFooter').remove();
	var informationHead = "<div style='padding:25px 0px 10px 10px;float:left'><h4><b>BMW</b> - Emission Lab Oxnard</h4><h5>Template Worksheet printout</h5>";
	informationHead += "<h6><b>Print Date:</b> "+$.datepicker.formatDate('mm/dd/yy', new Date())+"</h6>";
	informationHead += "</div><div style='text-align:right;padding:10px 10px 10px 0px;float:right'><img src='uploads/bmw_logo.jpg' alt='BMW Logo' style='width:106px;height:119px;'></div>";
	$(printContentObject).find('#informationField').html(informationHead);

	//Now extract the html content of the remaining object
	myDoc.write('<html>');
	myDoc.write(printContentObject.html());
	myDoc.write('</html>');

 	//If input fields were just filled out and checked/skipped without refreshing the values are not transferred into the fields
	$(printContentObject).find('.worksheet-row .singleElement input:text').each(function(){
		var $value = $(this).val();
		var $mcid = $(this).parents('.singleElement').attr('mcid');
		var $trid = $(this).parents('.worksheet-row').attr('trid');
		$(myDoc).find('.worksheet-row[trid="'+$trid+'"] .singleElement[mcid="'+$mcid+'"] input').val($value);
	});

	//Add some layout properties to the page
	$(myDoc).find('head').children(':last').after('<style type="text/css" media="print">@page{size: auto letter portrait; margin: 15mm 15mm 15mm 15mm;}	 body{background-color:#FFFFFF; border: solid 1px black; margin: 0px; padding-bottom:15px;} li, footer{page-break-inside: avoid;} img{max-width: 70mm !important; max-height: 100mm !important;}</style>');
	//Set all row background-colors to important, otherwise they are not printed
	$(myDoc).find('.worksheet-row:has(form)').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
	});
	//For all text boxes
	$(myDoc).find('.editableText').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
		//$(this).css('font-weight', 'bold');
		$(this).css('font-size', '12px');
	});
	//For all input fields
	$(myDoc).find('.form-control').each(function(){
		//$(this).css('font-weight', 'bold');
		$(this).css('font-size', '12px');
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
	});
	//For all rownumberbadges
	$(myDoc).find('.rownumberbadge').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
		$color = $(this).css('color');
		$(this).style('color', $color, 'important');
		$(this).css('font-weight', 'bold');
	});

	myDoc.close(); // necessary for IE >= 10
	mywindow.focus(); // necessary for IE >= 10

  	if(wshell !== null){

		var oldProperties = readPageSetupRegistry(wshell);
		var newProperties = {
			footer: 			(printOptions.printDateAndTime === true ? '&D&b&T&b' : ''),
			header: 			(printOptions.printPageNumbers === true ? '&bPage &p of &P&b' : ''),
			printBackground: 	(printOptions.printRowColors === true ? 'yes' : 'no')
		};
		setPageSetupRegistry(newProperties, wshell);
		mywindow.print();
		setPageSetupRegistry(oldProperties, wshell);
	} else {
		mywindow.print();
	}

	//mywindow.close();

	return true;
}
