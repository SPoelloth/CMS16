//************************************************************************************************
// Initialize the action button of the  template row passed as argument
//************************************************************************************************
function initializeActionButton(actionButton){
	//Get the blank message
	$.get("actionHtml/manageActionsDialog.html", function(blankDialog){
		//Create an object of the body element and one single row
		var $messageBody = $($.parseHTML(blankDialog));
		var $messageActionRow = $messageBody.find('.actionRow');
		$messageBody.find('.actionRow').remove();

		if($(actionButton).parents('.template-row').hasAttr('id')){
			//Get all actions from the DB and append them to the the messageBody
			$.ajax({
				type: "POST",
				url: 'db/db_getAllActionsHavingTemplateRowId.php',	
				data: {templateRowId: $(actionButton).parents('.template-row').attr('id')},
				dataType:'json',
				success: function(data){					
					$.each(data, function(index, element) {		
						var $currentRow = $messageActionRow.clone();
						$currentRow.find('.actionNumberBadge span').html((index+1) + '#');
						$currentRow.find('.actionName span').html(element.ActionName);
						$currentRow.attr('actionId', element.Id);
						$messageBody.find('.list-group').append($currentRow);
					});	
				}				
			}).fail(function(){
				showBootstrapInfoDialog("Error", "Can't get actions for this row from DB!", 'danger');
			}).done(function(){	
				initializeShowAllActionsDialog($messageBody, $(actionButton));
			});
		} else {
			initializeShowAllActionsDialog($messageBody, $(actionButton));
		}
	});


}


//************************************************************************************************
// Initialize the dialogue of the action button passed as argument
//************************************************************************************************
function initializeShowAllActionsDialog($messageBody, $actionButton){

	//Set an standard message if there are no actions saved in the DB
	if(!$messageBody.find('.list-group').children('.actionRow').exists()){
		$messageBody.find('.list-group').append("<span>There are currently no actions set.</span>");
	} else {
		$actionButton.addClass('actionButtonHasActions');
	}	

	//If the button is initialized twice, remove the old handler
	//console.log(jQuery._data($actionButton, 'events'));
	// $.each(jQuery._data($actionButton, 'events'), function(i, e){
			// console.log('Action button row: ' +$actionButton.parents('.template-row').attr('id')+' '+i);
	// });
	//console.log('Init button: Row '+$actionButton.parents('.template-row').attr('id')+' No '+$actionButton.parents('.template-row').attr('rowposition')+')');
	
	$actionButton.off('click');	
	
	//Initialize the dialogue and the action button
	$actionButton.on('click', function(e){	
		
		/* $actionButton.listHandlers('click', function(element, data){
			console.log('Currently assigned handlers to row '+$actionButton.parents('.template-row').attr('rowposition')+'): '+element.nodeName+' - '+data);
		}); */
		/* $.each(jQuery._data($actionButton, 'events'), function(){
			console.log('Triggered event: '+this);
		}); */
		 
		//Check if the document is saved in the DB, means every template row has an id
		var $documentIsSaved = true;
		$('#items-list .template-row').each(function(){
			//console.log('Checking row if id is available: '+$(this).attr('rowposition')+')');
			if(!$(this).hasAttr('id')){
				//console.log("couldn't find id in row "+$(this).attr('rowposition')+')');
				$documentIsSaved = false;
				return false;			//break each loop
			}
		});	
		
		//If the document is up to date do the rest of the initialization
		if($documentIsSaved){
			//console.log('Document is saved: Row '+$actionButton.parents('.template-row').attr('id'));
			var $mainDialog = BootstrapDialog.show({
				type: BootstrapDialog.TYPE_INFO,
				size: BootstrapDialog.SIZE_WIDE,
				data: {'currentRow': $actionButton.parents('.template-row')},
				title: '<b>RAM - R</b>ow <b>A</b>ction <b>M</b>anagement',
				message: $messageBody,
				autodestroy: false,
				draggable: true, 
				closable: true, 
				buttons: [{
					id:			'btnAddNewAction',
					label:		'Add',
					cssClass:	'btn-primary',
					icon:		'glyphicon glyphicon-plus',
					action: 	function(dialogItself) {
									templateIsLocked(function isLocked(locked){	
										if(!locked){
											dialogItself.setData('dialogIsStillNeeded', true);
											initializeCreateNewActionDialog(dialogItself);
										} else {
											showBootstrapInfoDialog("Invalid operation", "Can't add actions to this template. There are worksheets based on this template and it's therefore locked!", "warning");
										}
									});
								}
				},{
					id: 		'btnCloseActionDialog',
					label: 		'Close',
					cssClass: 	'btn-danger',
					icon: 		'glyphicon glyphicon-remove',
					action: 	function(dialogItself) {
									dialogItself.close();
								}
				}],
				onhide:			function(dialogItself){
									if(!dialogItself.getData('dialogIsStillNeeded')){
										dialogItself.setAutodestroy(true);
									}
									
								}, 
				onhidden:		function(dialogItself){		
									if(!dialogItself.getData('dialogIsStillNeeded')){
										//Re-initialize the action button as the dialogue is destroyed after closing completely
										initializeActionButton($actionButton);
									}
								}
			});
			//END BOOTSTRAP DIALOG
			
			
			//Initialize each action's delete button
			$messageBody.find('.deleteAction').each(function(){
				var $currentButton = $(this);
				$(this).click(function(){
					templateIsLocked(function isLocked(locked){	
						if(!locked){
							//Let the user confirm that he wants to delete this action
							showBootstrapConfirmDialog('Delete action', 'Are you sure you want to delete this action?', 'warning', function(result) {
								if(result){
									$.ajax({
										type: "POST",
										url: 'db/db_deleteActionHavingId.php',	
										data: {actionId: $currentButton.parents('.actionRow').attr('actionid')},
										success: function(data){
											var $listGroupBody = $currentButton.parents('#listGroupBody');
											$currentButton.parents('.actionRow').remove();
											//Add a short message to the message body if there are no action-elements left
											if(!$listGroupBody.children('.actionRow').exists()){
												$listGroupBody.append("<span>There are currently no actions set.</span>");
												$actionButton.removeClass('actionButtonHasActions');
											}
										}		
									}).fail(function(){
										showBootstrapInfoDialog("Error", "Can't delete action from DB!", 'danger');
									});
								}
							});
							//END CONFIRM DIALOGUE
						} else {
							showBootstrapInfoDialog("Invalid operation", "Can't delete this action. There are worksheets based on this template and it's therefore locked!", "warning");
						}	
					});	
				});
				//END CLICK EVENT
			});
			//END EACH FUNCTION	
			
			//Initialize each action's edit button
			$messageBody.find('.editAction').each(function(){
				$(this).click(function(){
					loadEditActionDialogue($mainDialog, $(this).parents('.actionRow').attr('actionid'));
				});
			});
		} else {
			//console.log('Document is NOT saved: Row '+$actionButton.parents('.template-row').attr('id')+' No '+$actionButton.parents('.template-row').attr('rowposition'));
			//If not all template rows are saved in the DB as the user if the template should be saved. If he confirms it, the button is initialized and the dialog is opened
			showBootstrapConfirmDialog('Unsaved template', 'This template is currently not saved in the DB. To create any actions it must be saved before. Do you want to save it now?', 'info', function(result) {
				if(result){
					var $ajaxObject = saveWholeTemplate();
					//console.log('Saving template due to: Row '+$actionButton.parents('.template-row').attr('id')+' No '+$actionButton.parents('.template-row').attr('rowposition'));
					if($ajaxObject !== null){
						$ajaxObject.then(function(){
							//initializeShowAllActionsDialog($messageBody, $actionButton);
							$actionButton.trigger('click');
						});
					}
					// saveWholeTemplate().then(function(data){
						// initializeShowAllActionsDialog($messageBody, $actionButton);
						// $actionButton.trigger('click');
					// });
				}
			});
		}

	});
	//END ACTION BUTTON CLICK EVENT

} 


//************************************************************************************************
// Initialize the create new action dialogue if the add new action button on the main dialogue
// is clicked
//************************************************************************************************
function initializeCreateNewActionDialog($mainDialog){
	$mainDialog.close();
	$.get("actionHtml/newActionDialog.html", function(blankDialog){
		var $messageBody = $($.parseHTML(blankDialog));
		var $newActionDialog = BootstrapDialog.show({
			type: BootstrapDialog.TYPE_INFO,
			size: BootstrapDialog.SIZE_WIDE,
			title: 'Create new action',
			message: $messageBody,
			autodestroy: false,
			draggable: true, 
			closable: false, 
			buttons: [{
				id:			'btnSaveAction',
				label:		'Save',
				cssClass:	'btn-primary',
				icon:		'glyphicon glyphicon-floppy-save',
				action: 	function(dialogItself) {
								saveAction(dialogItself);
								refreshForbiddenElementsList($mainDialog, dialogItself);
							}
			},{
				id: 		'btnCloseDialog',
				label: 		'Close',
				cssClass: 	'btn-danger',
				icon: 		'glyphicon glyphicon-remove',
				action: 	function(dialogItself) {
								dialogItself.setAutodestroy(true);
								$mainDialog.open();
								$mainDialog.setData('dialogIsStillNeeded', false);
								
								//If the dialogue was saved refresh the view in the main window
					 			if($.type(dialogItself.getData('actionId')) !== 'undefined'){
									//Add the class to visualize that there is an action assigned
									$mainDialog.getData('currentRow').find('.btnAddAction').addClass('actionButtonHasActions');
									$.get("actionHtml/manageActionsDialog.html", function(blankDialog){
										//Clone one of the old rows and set name and Id
										var $newActionRow = $($.parseHTML(blankDialog)).find('.actionRow').clone();
										$newActionRow.find('.actionName span').html(dialogItself.getData('actionName'));
										$newActionRow.attr('actionid', dialogItself.getData('actionId'));
									
										//Remove the span saying there is no action currently set, if existent and set the new row
										if(!$mainDialog.getModalBody().find('.list-group').children('.actionRow').exists()){
											$mainDialog.getModalBody().find('.list-group span').remove();
											$mainDialog.getModalBody().find('.list-group').append($newActionRow);
										}
												
										//To sort the new action row correctly (alphabetically) into the list all names are needed
										var $actionNames = [];
										$actionNames.push(dialogItself.getData('actionName'));
										$mainDialog.getModalBody().find('.actionRow .actionName span').each(function(){
											$actionNames.push($(this).html());
										});
										//Sort array and put the action in the right place
										$actionNames.sort();
										//console.log('names in array: ' + $actionNames.valueOf());
										$mainDialog.getModalBody().find('.actionRow .actionName span').each(function(index){
											//console.log('Current name: ' + $(this).html());
											if($(this).html() !== $actionNames.shift()){
												$(this).parents('.actionRow').before($newActionRow);
												return false;
											} else if ($mainDialog.getModalBody().find('.actionRow .actionName span').length === index+1){
												$(this).parents('.actionRow').after($newActionRow);
											}
										});
										//Refresh number badges
										$mainDialog.getModalBody().find('.actionRow .actionNumberBadge span').each(function(index){
											$(this).html((index+1) + '#');
										});
										
										//Initialize the delete button
										$newActionRow.find('.deleteAction').click(function(){
											//Let the user confirm that he wants to delete this action
											showBootstrapConfirmDialog('Delete action', 'Are you sure you want to delete this action?', 'warning', function(result) {
												if(result){
													$.ajax({
														type: "POST",
														url: 'db/db_deleteActionHavingId.php',	
														data: {actionId: $newActionRow.attr('actionid')},
														success: function(data){
															var $listGroupBody = $newActionRow.parents('#listGroupBody');
															$newActionRow.remove();
															//Add a short message to the message body if there are no action-elements left
															if(!$listGroupBody.children('.actionRow').exists()){
																$listGroupBody.append("<span>There are currently no actions set.</span>");
																$mainDialog.getData('currentRow').find('.btnAddAction').removeClass('actionButtonHasActions');
															}
														}		
													}).fail(function(){
														showBootstrapInfoDialog("Error", "Can't delete action from DB!", 'danger');
													});
												}
											});
											//END CONFIRM DIALOGUE
										});
										
										//Initialize edit button
										$newActionRow.find('.editAction').click(function(){
											loadEditActionDialogue($mainDialog, $(this).parents('.actionRow').attr('actionid'));
										});
									});
								} 
								
								
								/* if($.type(dialogItself.getData('actionId') !== 'undefined')){
									getInitializeMainDialogMessage($mainDialog.getData('currentRow').attr('id'), function($messageBody){
										$mainDialog.setMessage($messageBody);
									}); 
								}  */
								dialogItself.close();
							}
			}]
		
		});
		//END BOOTSTRAP DIALOG
		
		//Prepare the choose trigger element button
		initializeChooseTriggerElementButton($mainDialog, $newActionDialog);
		
		refreshForbiddenElementsList($mainDialog, $newActionDialog);
	});
	//END GET
	
	
}


//************************************************************************************************
// Initialize the choose trigger element button in the create new action dialogue
//************************************************************************************************
function initializeChooseTriggerElementButton($mainDialog, $newActionDialog) {
	$newActionDialog.getModalBody().find('#btnChooseTriggerElement').click(function(){
		//Get the current row and prepare for the element selection
		var $currentRow = $mainDialog.getData('currentRow');		
		prepareRowForSelection($currentRow, $mainDialog, $newActionDialog, true);
		//Add an click trigger for the selectable elements
		$currentRow.find('.selectTriggerElementInner, .selectTriggerElementOuter').mousedown(function(e){
			//$currentRow.find('.selectTriggerElementInner, .selectTriggerElementOuter').off(e);
			prepareRowForSelection($currentRow, $mainDialog, $newActionDialog, false);
			$newActionDialog.getModalBody().find('#btnChooseTriggerElement').next('div').attr('mcid', $(this).parents('.singleElement').attr('mcid'));
			$newActionDialog.getModalBody().find('#btnChooseTriggerElement').next('div').attr('eid', $(this).parents('.singleElement').attr('eid'));
			$newActionDialog.getModalBody().find('#btnChooseTriggerElement').next('div').attr('trid', $(this).parents('.template-row').attr('id'));
			//edit some information of the row and the selected element
			var $chosenTrigger = '';
			if($(this).attr('type') === 'text'){
				$chosenTrigger = 'Input field';
			} else if($(this).attr('type') === 'checkbox'){
				$chosenTrigger = 'Check box';
			} else if($(this).attr('type') === 'radio'){
				$chosenTrigger = 'Radio button';
			} else if($(this).hasClass('checkButton')){
				$chosenTrigger = 'Check button';
			}
			var $chosenTriggerInformation = "Row "+$currentRow.attr('rowposition')+"), Element '"+$chosenTrigger+"', MCId "+$newActionDialog.getModalBody().find('#btnChooseTriggerElement').next('div').attr('mcid')+", EId "+$newActionDialog.getModalBody().find('#btnChooseTriggerElement').next('div').attr('eid');
			$newActionDialog.getModalBody().find('#chosenTriggerInformation span').html($chosenTriggerInformation);
						
			//Fill the dropdowns with the right values, depending on the chosen element
			var $triggerElement = $(this);
			$.ajax({
				type: "POST",
				url: 'db/db_getAllTriggerValueOperator.php',		
				data: {eid: $(this).parents('.singleElement').attr('eid')},
				dataType:'json',
				success: function(data){
					//Show the next row
					$newActionDialog.getModalBody().find('.selectTriggerOperationRow .standardElementToShow').show(500);
					var $triggerOperator = $newActionDialog.getModalBody().find('#triggerOperator select');
					$triggerOperator.children().remove();
					$.each(data, function(index, element) {		
						$triggerOperator.append("<option triggerid='"+element.Id+"'>"+element.TriggerOperator+"</option>");
					});
					
					//Show the right dropdowns or inputs respectively
					$newActionDialog.getModalBody().find('#triggerValueCheckAndRadio, #triggerValueCheckbutton, #triggerValueInput').hide();
					if($triggerElement.attr('type') === 'checkbox' || $triggerElement.attr('type') === 'radio'){
						$newActionDialog.getModalBody().find('#triggerValueCheckAndRadio').show(500);
					} else if($triggerElement.hasClass('checkButton')){
						$newActionDialog.getModalBody().find('#triggerValueCheckbutton').show(500);
					} else if($triggerElement.attr('type') === 'text'){
						$newActionDialog.getModalBody().find('#triggerValueInput').show(500);
					}
					
					//Initialize a new affected row or element entry if needed
					var $allAffectedEntries = $newActionDialog.getModalBody().find('.selectAffectedElementOrRow');
					/* if($allAffectedEntries.hasClass('firstOfItsKind') ||
							($allAffectedEntries.find('.btnChooseAffectedElementOrRow').next('div').length === $allAffectedEntries.length)){ */
					if($allAffectedEntries.hasClass('firstOfItsKind')){		
						initializeNewAffectedRowOrElementEntry($mainDialog, $newActionDialog);
					}
					if($allAffectedEntries.hasClass('firstOfItsKind')){
						console.log('first condition was true');
					} 
					if($allAffectedEntries.find('.btnChooseAffectedElementOrRow').next('div').length === $allAffectedEntries.length){
						console.log('second condition was true');
					} 
					
				}				
			}).fail(function(){
				showBootstrapInfoDialog("Error", "Can't get trigger value operators from DB!", 'danger');
			});
			
			

		});
	});
	
}


//************************************************************************************************
// Prepare the row which action button was clicked to choose an trigger  element. 
// Note: preparation and de-preparation is done in this function
//************************************************************************************************
function prepareRowForSelection($row, $mainDialog, $newActionDialog, $prepare) {
	if($prepare){
		//Close dialogue window
		$newActionDialog.close();
		//Add classes for visual appearance
		$row.addClass('selectedTriggerRow');
		
		//Exclude those elements already used as triggers by other actions
		var $possibleTriggerInputs = $row.find('.editableInput');
		var $possibleTriggerElements = $row.find('.checkButton, .editableCheckbox, .editableRadiobutton');
		$.each($mainDialog.getData('forbiddenElements'), function(){
			var $currentMCId = this;
			//console.log('current mcid = ' + $currentMCId);
			$possibleTriggerInputs.each(function(){
				//console.log($(this).parents('.singleElement').attr('mcid'));
				if($(this).parents('.singleElement').attr('mcid') == $currentMCId){
					$(this).addClass('forbiddenElementInner');
					$possibleTriggerInputs = $possibleTriggerInputs.not($(this));
				}
			});
			$possibleTriggerElements.each(function(){
				//console.log($(this).parents('.singleElement').attr('mcid'));
				if($(this).parents('.singleElement').attr('mcid') == $currentMCId){
					$(this).addClass('forbiddenElementOuter');
					$possibleTriggerElements = $possibleTriggerElements.not($(this));
				}
			});			
		});
		
		$possibleTriggerInputs.addClass('selectTriggerElementInner');
		$possibleTriggerElements.addClass('selectTriggerElementOuter');
		
		//$row.find('.editableInput').addClass('selectTriggerElementInner');
		//$row.find('.checkButton, .editableCheckbox, .editableRadiobutton').addClass('selectTriggerElementOuter');
		
		//Disable all elements so only those in the marked row can be clicked
		$('.rowColorPicker').spectrum('disable');
		$('.btnAddAction:enabled, .btnDeleteModule, .btnDeleteModuleOnlyAdded').css("pointer-events", "none");
		//If the user clicks anywhere else but the possible elements in the row selected for action ....
		$(document).mousedown(function(e){
			if((!$('.maincontainer').is(e.target) && $('.maincontainer').has(e.target).length === 0) ||
					(!$('.selectedTriggerRow').is(e.target) && $('.selectedTriggerRow').has(e.target).length === 0)){
				$(document).off(e);
				prepareRowForSelection($row, $mainDialog, $newActionDialog, false);
			}
		});		
		
	} else {
		//Open dialogue again
		$newActionDialog.open();
		//Remove classes and events
		$row.removeClass('selectedTriggerRow');
		$row.find('.editableInput').off('mousedown').removeClass('selectTriggerElementInner');
		$row.find('.checkButton, .editableCheckbox, .editableRadiobutton').off('mousedown').removeClass('selectTriggerElementOuter').prop('checked', false);
		$row.find('.forbiddenElementInner').removeClass('forbiddenElementInner');
		$row.find('.forbiddenElementOuter').removeClass('forbiddenElementOuter');
		//Re-enable actions
		$('.rowColorPicker').spectrum('enable');
		$('.btnAddAction:enabled, .btnDeleteModule, .btnDeleteModuleOnlyAdded').css("pointer-events", "auto");
	}
}


//************************************************************************************************
// Initialize or add a new action result entry, respectively 
//************************************************************************************************
function initializeNewAffectedRowOrElementEntry($mainDialog, $newActionDialog){
	//Check if it's the first row of its kind
	var $lastAffectedEntry = $newActionDialog.getModalBody().find('.selectAffectedElementOrRow:last');
 	if($lastAffectedEntry.hasClass('firstOfItsKind')){
		$lastAffectedEntry.removeClass('firstOfItsKind');
		$lastAffectedEntry.attr('orderno', 1);
	} else {
		var $newAffectedRow = $lastAffectedEntry.clone()
		var $newAffectedInputRowEntry = $lastAffectedEntry.next('.selectAffectedElementInput').clone()
		//Reset that element by removing all data from the old row
		$newAffectedRow.find('#actionResult option').prop('selected', false).first().prop('selected', true);
		$newAffectedRow.find('#actionResultEffectsRow').show();
		$newAffectedRow.find('#actionResultEffectsElement').hide();
		$newAffectedRow.find('.btnChooseAffectedElementOrRow span:last').html('Choose row');
		$newAffectedRow.find('#chosenAfftectedRowOrElementInformation').find('span').html("<i>No element chosen</i>");
		$newAffectedRow.find('.btnChooseAffectedElementOrRow').next('div').remove();
		//Also reset the input row
		$newAffectedInputRowEntry.find('#actionResultInputValue input').val('');
		//$newAffectedInputRowEntry.find('.standardElementToShow').hide();
		$newAffectedInputRowEntry.hide();
		//From the second entry on they have to be able to be deleted
		$newAffectedRow.find('.btnDeleteEntryAffectedElementOrRow').parents('td').show();
		$newAffectedRow.find('.btnDeleteEntryAffectedElementOrRow').click(function(){		
			//If the entry is deleted and not all of the entries have a value yet, show the add new entry button again
			var $allRowEntryDeleteButtons = $(this).parents('.selectAffectedElementOrRow').siblings('.selectAffectedElementOrRow').find('.btnChooseAffectedElementOrRow');
			if($allRowEntryDeleteButtons.length === $allRowEntryDeleteButtons.siblings('div').length){
				$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').parents('td').show(500);
			}
			var $allNextAffectedEntries = $(this).parents('.selectAffectedElementOrRow').nextAll('.selectAffectedElementOrRow');
			$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').remove();
			$(this).parents('.selectAffectedElementOrRow').remove();
			
			//If the deleted row was part of a confirm action, empty those entry
			$allNextAffectedEntries.each(function(){
				if(($(this).find('#actionResult option:selected').attr('value') === 'confirmRow') && ($(this).find('.btnChooseAffectedElementOrRow').next('div').exists())){
					if(!rowIsFullySpecified($(this))){
						$(this).find('.btnChooseAffectedElementOrRow').next('div').remove();
						$(this).find('#chosenAfftectedRowOrElementInformation span').html('<i>No element chosen</i>');
					}
				}
			});

			//Set the right order number again
			$newActionDialog.getModalBody().find('.selectAffectedElementOrRow').each(function(index){
				$(this).attr('orderno', index+1);
			});
		});
		
		//Append the new entry and select it
		$lastAffectedEntry.next('.selectAffectedElementInput').after($newAffectedRow);
		$newAffectedRow.attr('orderno', parseInt($lastAffectedEntry.attr('orderno'))+1);
		$lastAffectedEntry = $newAffectedRow;
		$lastAffectedEntry.after($newAffectedInputRowEntry);
	} 
	
	//Show the selection-row to select an affected element or row
	$lastAffectedEntry.find('.standardElementToShow').show(500);	
	$lastAffectedEntry.find('#actionResult select').change(function(){
		if($(this).find('option:selected').attr('value').indexOf('Row') > 0) {
			$(this).parents('td').siblings('#actionResultEffectsElement').hide();
			$(this).parents('td').siblings('#actionResultEffectsRow').show(500);
			$(this).parents('td').siblings().find('.btnChooseAffectedElementOrRow span:last').html('Choose row');
			//Hide input value row
			//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').hide(500);
			$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').hide(500);
		} else {
			$(this).parents('td').siblings('#actionResultEffectsRow').hide();
			$(this).parents('td').siblings('#actionResultEffectsElement').show(500);
			$(this).parents('td').siblings().find('.btnChooseAffectedElementOrRow span:last').html('Choose element');
			//If an input is chosen also show the another row to specify the input value
			if($(this).find('option:selected').attr('value') === 'insertElement'){
				//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').show(500);
				$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').show(500);
			} else{
				//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').hide(500);
				$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').hide(500);
			}
		}
		//Remove old information if affected element or row respectively is changed				
		$(this).parents('td').siblings('#chosenAfftectedRowOrElementInformation').find('span').html("<i>No element chosen</i>");
		$(this).parents('td').siblings('td').find('.btnChooseAffectedElementOrRow').next('div').remove();
	});
	
	//Initialize the choose affected element button
	$lastAffectedEntry.find('.btnChooseAffectedElementOrRow').click(function(){
		var $isRow = ($(this).parents('td').siblings('#actionResult').find('option:selected').attr('value').indexOf('Row') > 0) ? true : false;
		prepareDocumentToSelectAffectedRowOrElement($mainDialog.getData('currentRow'), $mainDialog, $newActionDialog, $lastAffectedEntry, $isRow, true);
	});		
}


//************************************************************************************************
// Prepare the document regarding which kind of action result is chosen: row or element. 
// Note: preparation and de-preparation is done in this function
//************************************************************************************************
function prepareDocumentToSelectAffectedRowOrElement($row, $mainDialog, $newActionDialog, $affectedEntry, $isRow, $prepare){
	if($prepare){
		//Close dialogue window
		$newActionDialog.close();
		//Deactivate elements at the document
		$('.rowColorPicker').spectrum('disable');
		$('.btnAddAction:enabled, .btnDeleteModule, .btnDeleteModuleOnlyAdded').css("pointer-events", "none");
		//Select the rows that are possible to select
		var $possibleAfftectedRows = $row.nextAll('.template-row:has(.checkButton)');
		
		//If it's an row...
		if($isRow){	
			//First of all distinguish between the skip and confirm confirmation. Skipping a row is only possible if no element inside is already affected
			//by an action entry, while confirming a row is only possible if all inputs are already affected by other entries.
			var $isConfirmRowEntry = ($affectedEntry.find('#actionResult option:selected').attr('value') === 'confirmRow' ? true : false);
				
			if($isConfirmRowEntry){
				//Remove those rows that are already affected by action entries
				$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
					var $affectedRow = listHasAttrAndValue($possibleAfftectedRows, 'id', $(this).attr('trid'));
					if(!$(this).hasAttr('mcid')){
						$affectedRow.addClass('alreadyAffectedRow');
						//$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
						$possibleAfftectedRows = $possibleAfftectedRows.not($affectedRow);
					}
				});	
				
				//Remove those rows that contains elements that are not covered by action entries
				$possibleAfftectedRows.each(function(){
				
					var $inputElements = $(this).find('.editableInput');
					var $checkBoxes = $(this).find('.editableCheckbox');
					var $radioButtons = $(this).find('.editableRadiobutton');
					//console.log('Found in row '+$(this).attr('rowposition')+': '+$inputElements.length+' inputElements, '+$checkBoxes.length+' checkBoxes, '+$radioButtons.length+' radioButtons');
					var $rowHasElementsNotAffected = false;
					//Begin with the input elements
					$inputElements.each(function(){
						var $currentInput = $(this);
						var $inputWasFound = false;
						//$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
						$affectedEntry.prevAll('.selectAffectedElementOrRow').find('.btnChooseAffectedElementOrRow').next('div').each(function(){
							if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentInput.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $currentInput.parents('.template-row').attr('id')){
								$inputWasFound = true;
							}
						});	
						if(!$inputWasFound) {
							$rowHasElementsNotAffected = true;
							//console.log('unaffected input found');
						}
					});
					//Now check the checkBoxes. Only do this if everything went fine so far
					if(!$rowHasElementsNotAffected){
						$checkBoxes.each(function(){
							var $currentCheckbox = $(this);
							var $checkboxWasFound = false;
							//$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
							$affectedEntry.prevAll('.selectAffectedElementOrRow').find('.btnChooseAffectedElementOrRow').next('div').each(function(){
								if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentCheckbox.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $currentCheckbox.parents('.template-row').attr('id')){
									$checkboxWasFound = true;
								}
							});
							if(!$checkboxWasFound) {
								$rowHasElementsNotAffected = true;
								//console.log('unaffected checkbox found');
							}
						});
					}
					//Now check the the radio buttons. Only do this if everything went fine so far
					if(!$rowHasElementsNotAffected){
						$radioButtons.each(function(){
							var $currentRadiobutton = $(this);
							var $radiobuttonWasFound = false;
							//$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
							$affectedEntry.prevAll('.selectAffectedElementOrRow').find('.btnChooseAffectedElementOrRow').next('div').each(function(){
								if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentRadiobutton.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $currentRadiobutton.parents('.template-row').attr('id')){
									$radiobuttonWasFound = true;
									$rowHasElementsNotAffected = false;
									return false;			//break inner each loop
								}
							});
							if($radiobuttonWasFound){
								return false;				//break outer each loop
							}
							//if(!$radiobuttonWasFound) {
							$rowHasElementsNotAffected = true;
							//console.log('unaffected radio found');
							//}
						});
					}

					//If any of those elements wasn't found, remove this template-row from the possible selection
					if($rowHasElementsNotAffected){
						$(this).addClass('alreadyAffectedRow');
						//$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('id')+"']");
						$possibleAfftectedRows = $possibleAfftectedRows.not($(this));
					}
				
				});
				
			} else {
				//Remove those rows from selection that doesn't fit the skip action, means it has already an element affected by an skip entry
				$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
					var $affectedRow = listHasAttrAndValue($possibleAfftectedRows, 'id', $(this).attr('trid'));
					$affectedRow.addClass('alreadyAffectedRow');
					$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
					//if($(this).hasAttr('trid') && $(this).hasAttr('mcid')){			
					if($(this).hasAttr('mcid')){
						var $affectedElement = $affectedRow.find(".singleElement[mcid='"+$(this).attr('mcid')+"']");
						if($affectedElement.has('.editableInput')){
							$affectedElement.find('.editableInput').addClass('alreadyAffectedElementInner');
						} else {
							$affectedElement.find('.editableCheckbox, .editableRadiobutton').addClass('alreadyAffectedElementOuter');
						}
					}
				});
			}	
		
			//Add class to all possible rows and an event listener
			$possibleAfftectedRows.addClass('selectedAffectedRow');	
			//Add another class so the mouse cursor changes
			$('.selectedAffectedRow').addClass('selectedWholeAffectedRow');
			//Add a mousedown listener to those rows
			$('.selectedAffectedRow').mousedown(function(e){
				prepareDocumentToSelectAffectedRowOrElement($row, $mainDialog, $newActionDialog, $affectedEntry, $isRow, false);
				//Remove old information if there's still some
				$affectedEntry.find('#chosenAfftectedRowOrElementInformation span').empty();
				$affectedEntry.find('.btnChooseAffectedElementOrRow').siblings('div').remove();
				//Add the new information about the selected element
				$affectedEntry.find('#chosenAfftectedRowOrElementInformation span').html("Row "+$(this).attr('rowposition')+")");
				$affectedEntry.find('.btnChooseAffectedElementOrRow').after("<div trid='"+$(this).attr('id')+"'></div>");
				//Show the button to add other affected elements or rows
				$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').parents('td').show(500);
				if($newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').hasClass('btnIsNotInitialized')){
					$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').click(function(e){
						$(this).removeClass('btnIsNotInitialized').parents('td').hide(300);
						initializeNewAffectedRowOrElementEntry($mainDialog, $newActionDialog);
					});
				}
			});
					
			
		//If single elements are chosen as effected elements
		} else {
			//Remove these rows from selection that doesn't fit the actionResult selector
			if($affectedEntry.find('#actionResult option:selected').attr('value') === 'checkElement'){
				$possibleAfftectedRows = $possibleAfftectedRows.has('.editableCheckbox, .editableRadiobutton');
				//console.log('There are '+ $possibleAfftectedRows.length + ' rows left for check elements');
			} else if ($affectedEntry.find('#actionResult option:selected').attr('value') === 'insertElement'){
				$possibleAfftectedRows = $possibleAfftectedRows.has('.editableInput');
				//console.log('There are '+ $possibleAfftectedRows.length + ' rows left for insert elements');
			}
		
			//Remove those elements or rows respectively from selection that already have an affected element inside
			$newActionDialog.getModalBody().find('.btnChooseAffectedElementOrRow').next('div').each(function(){
				var $affectedRow = listHasAttrAndValue($possibleAfftectedRows, 'id', $(this).attr('trid'));
				//Continue to the next row if the current row is not in the list any more
				if(!$affectedRow.exists()){
					return true;
				}
				//$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
						
				if($(this).hasAttr('mcid')){	
					//Row has affected elements. Now check if there are other elements left inside the row that can still be checked
					var $affectedElement = $affectedRow.find(".singleElement[mcid='"+$(this).attr('mcid')+"']");
					if($affectedElement.has('.editableInput').exists()){
						$affectedElement.find('.editableInput').addClass('alreadyAffectedElementInner');
					} else {
						$affectedElement.find('.editableCheckbox, .editableRadiobutton').addClass('alreadyAffectedElementOuter');
					}
					//If the result is to check a radiobutton or a checkbox
					if($affectedEntry.find('#actionResult option:selected').attr('value') === 'checkElement'){
						var $checkboxes = $affectedRow.find('.editableCheckbox');
						var $radiobuttons = $affectedRow.find('.editableRadiobutton');
						var $rowIsCompletelyAffected = false;
						if($radiobuttons.hasClass('alreadyAffectedElementOuter') && $checkboxes.filter('.alreadyAffectedElementOuter').length === $checkboxes.length){
							//A radiobutton is already checked and no checkboxes exist or all of them already have an action, respectively
							$rowIsCompletelyAffected = true;
						} else if(!$radiobuttons.exists() && $checkboxes.filter('.alreadyAffectedElementOuter').length === $checkboxes.length){
							//No radiobuttons exist and no checkboxes exist or all of them already have an action, respectively
							$rowIsCompletelyAffected = true;
						}
						//Exclude it from the possible affected row list
						if($rowIsCompletelyAffected){
							$affectedRow.addClass('alreadyAffectedRow');
							$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
						}
					//If the result is an input
					}else if($affectedEntry.find('#actionResult option:selected').attr('value') === 'insertElement'){
						if(!$affectedRow.find('.editableInput').not('.alreadyAffectedElementInner').exists()){
							$affectedRow.addClass('alreadyAffectedRow');
							$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
						}
					}
					
				} else {
					//Row is confirmed or skipped, elements inside can't be selected at all
					$affectedRow.addClass('alreadyAffectedRow');
					$possibleAfftectedRows = $possibleAfftectedRows.not("[id='"+$(this).attr('trid')+"']");
				}
			});		
		
		
			//Find out which elements can be selected and mark them by adding the classes
			if($affectedEntry.find('#actionResult option:selected').attr('value') === 'checkElement'){
				$possibleAfftectedRows.find('.editableCheckbox:not(.alreadyAffectedElementOuter), .editableRadiobutton:not(.alreadyAffectedElementOuter)').addClass('selectAffectedElementOuter');
			} else if($affectedEntry.find('#actionResult option:selected').attr('value') === 'insertElement'){
				$possibleAfftectedRows.find('.editableInput:not(.alreadyAffectedElementInner)').addClass('selectAffectedElementInner');
			}
			//$('.selectAffectedElementOuter, .selectAffectedElementInner').parents('.template-row').addClass('selectedAffectedRow');
			$possibleAfftectedRows.addClass('selectedAffectedRow');
		
			//Add a mousedown listener to those elements
			$possibleAfftectedRows.find('.selectAffectedElementOuter, .selectAffectedElementInner').mousedown(function(e){
				prepareDocumentToSelectAffectedRowOrElement($row, $mainDialog, $newActionDialog, $affectedEntry, $isRow, false);
				//Remove old information if there's still some
				$affectedEntry.find('#chosenAfftectedRowOrElementInformation span').empty();
				$affectedEntry.find('.btnChooseAffectedElementOrRow').siblings('div').remove();
				//Add the new information about the selected element
				var $chosenElement = '';
				if($(this).attr('type') === 'text'){
					$chosenElement = 'Input field';
				} else if($(this).attr('type') === 'checkbox'){
					$chosenElement = 'Check box';
				} else if($(this).attr('type') === 'radio'){
					$chosenElement = 'Radio button';
				} 
				//..for the user
				var $affectedElementInformation = "Row "+$(this).parents('.template-row').attr('rowposition')+"), Element '"+$chosenElement+"', ";
				$affectedElementInformation += "MCId "+$(this).parents('.singleElement').attr('mcid')+", EId "+$(this).parents('.singleElement').attr('eid');
				$affectedEntry.find('#chosenAfftectedRowOrElementInformation span').html($affectedElementInformation);
				//..and hidden in a div element
				var $hiddenElementInformation = "<div trid='"+$(this).parents('.template-row').attr('id')+"' mcid='"+$(this).parents('.singleElement').attr('mcid')+"' ";
				$hiddenElementInformation += "eid='"+$(this).parents('.singleElement').attr('eid')+"'></div>";
				$affectedEntry.find('.btnChooseAffectedElementOrRow').after($hiddenElementInformation);
				
				//There's the possibility that the current affected entry already was specified and therefore a following 'confirm row' isn't valid any more. Check that
				//and if it's so, remove that confirm entry
				var $nextAllConfirmEntries = $affectedEntry.nextAll('.selectAffectedElementOrRow');
				//Remove those objects that are no confirm entries and already specified
				$nextAllConfirmEntries.each(function(){
					if(($(this).find('#actionResult option:selected').attr('value') === 'confirmRow') && ($(this).find('.btnChooseAffectedElementOrRow').next('div').exists())){
						//$nextAllConfirmEntries.not($(this));
						if(!rowIsFullySpecified($(this))){
							$(this).find('.btnChooseAffectedElementOrRow').next('div').remove();
							$(this).find('#chosenAfftectedRowOrElementInformation span').html('<i>No element chosen</i>');
						}
					}
				});
			
				//Show the button to add other affected elements or rows
				$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').parents('td').show(500);		
				if($newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').hasClass('btnIsNotInitialized')){
					$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').click(function(e){
						$(this).removeClass('btnIsNotInitialized').parents('td').hide(300);
						initializeNewAffectedRowOrElementEntry($mainDialog, $newActionDialog);
					});
				}
			});			
		}
		
		//Add a mousedown listener to everything but the possible selectable classes
		$(document).mousedown(function(e){
			if((!$('.maincontainer').is(e.target) && $('.maincontainer').has(e.target).length === 0) ||
					(!$('.selectedAffectedRow').is(e.target) && $('.selectedAffectedRow').has(e.target).length === 0)){
				$(document).off(e);
				prepareDocumentToSelectAffectedRowOrElement($row, $mainDialog, $newActionDialog, $affectedEntry, $isRow, false);
			}
		});	
		
	} else {
		//Open dialogue window
		$newActionDialog.open();
		//Activate elements at the document
		$('.rowColorPicker').spectrum('enable');
		$('.btnAddAction:enabled, .btnDeleteModule, .btnDeleteModuleOnlyAdded').css("pointer-events", "auto");
		if($isRow){		
			//De-attach the listener and class
			$row.nextAll('.selectedAffectedRow').off('mousedown').removeClass('selectedAffectedRow').removeClass('selectedWholeAffectedRow');
		} else {
			//De-attach the listener and classes
			$row.nextAll('.selectedAffectedRow').find('.editableCheckbox, .editableRadiobutton, .editableInput').off('mousedown').removeClass('selectAffectedElementInner').removeClass('selectAffectedElementOuter');
			$row.nextAll('.selectedAffectedRow').removeClass('selectedAffectedRow');
		}
		//Remove class from already chosen rows
		$('.alreadyAffectedRow').removeClass('alreadyAffectedRow');
		//Remove classes from all other elements that were already affected
		$('.alreadyAffectedElementInner').removeClass('alreadyAffectedElementInner');
		$('.alreadyAffectedElementOuter').removeClass('alreadyAffectedElementOuter');
	}
		
}



//************************************************************************************************
// This function checks if the confirm entry passed as parameter points to an template row that
// that is already fully specified by previous entries. That means that at least one radiobutton
// is checked, all checkbuttons are checked and all inputs are chosen as affected elements. If
// it's so, the function returns true, else false
//************************************************************************************************
function rowIsFullySpecified($currentAffectedEntry){
	var $previousEntries = $currentAffectedEntry.prevAll('.selectAffectedElementOrRow');
	var $affectedRowId = $currentAffectedEntry.find('.btnChooseAffectedElementOrRow').next('div').attr('trid');
	var $affectedTemplateRow = $("#items-list .template-row[id='"+$affectedRowId+"']");

	var $inputElements = $affectedTemplateRow.find('.editableInput');
	var $checkBoxes = $affectedTemplateRow.find('.editableCheckbox');
	var $radioButtons = $affectedTemplateRow.find('.editableRadiobutton');
	var $rowHasElementsNotAffected = false;
	//Begin with the input elements
	$inputElements.each(function(){
		var $currentInput = $(this);
		var $inputWasFound = false;
		$previousEntries.find('.btnChooseAffectedElementOrRow').next('div').each(function(){
			if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentInput.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $affectedRowId){
				$inputWasFound = true;
			}
		});	
		if(!$inputWasFound) {
			$rowHasElementsNotAffected = true;
		}
	});
	//Now check the checkBoxes. Only do this if everything went fine so far
	if(!$rowHasElementsNotAffected){
		$checkBoxes.each(function(){
			var $currentCheckbox = $(this);
			var $checkboxWasFound = false;
			$previousEntries.find('.btnChooseAffectedElementOrRow').next('div').each(function(){
				if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentCheckbox.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $affectedRowId){
					$checkboxWasFound = true;
				}
			});
			if(!$checkboxWasFound) {
				$rowHasElementsNotAffected = true;
			}
		});
	}
	//Now check the the radio buttons. Only do this if everything went fine so far
	if(!$rowHasElementsNotAffected){
		$radioButtons.each(function(){
			var $currentRadiobutton = $(this);
			var $radiobuttonWasFound = false;
			$previousEntries.find('.btnChooseAffectedElementOrRow').next('div').each(function(){
				if($(this).hasAttr('mcid') && $(this).attr('mcid') === $currentRadiobutton.parents('.singleElement').attr('mcid') && $(this).attr('trid') === $affectedRowId){
					$radiobuttonWasFound = true;
					$rowHasElementsNotAffected = false;
					return false;			//break inner each loop
				}
			});
			if($radiobuttonWasFound){
				return false;				//break outer each loop
			}
			
			$rowHasElementsNotAffected = true;

		});
	}
	
	return !$rowHasElementsNotAffected;
}




//************************************************************************************************
// The Save action function collects all necessary data, checks if it's completely specified and
// it's so it inserts this data into the DB. If not, it shows a warning dialogue to tell the user
// what is missing.
//************************************************************************************************
function saveAction(dialogItself){
 	var $actionBody = dialogItself.getModalBody();
	//Get the action name, trigger elements and sort the affected entries in rows and elements
	var $actionName = $actionBody.find('#actionName input').val();
 	var $triggerElement = {
		trid: 				$actionBody.find('#btnChooseTriggerElement').next('div').attr('trid'),
		mcid: 				$actionBody.find('#btnChooseTriggerElement').next('div').attr('mcid'),
		eid: 				$actionBody.find('#btnChooseTriggerElement').next('div').attr('eid'),
		triggerOperatorId: 	$actionBody.find('#triggerOperator option:selected').attr('triggerid')
	};

	if($actionBody.find('.selectTriggerOperationRow').find('#triggerValueCheckAndRadio:visible, #triggerValueCheckbutton:visible').exists()){
		$triggerElement.triggerValue = $actionBody.find('.selectTriggerOperationRow').find('#triggerValueCheckAndRadio:visible, #triggerValueCheckbutton:visible').find('option:selected').attr('value');
	} else {
		$triggerElement.triggerValue = $actionBody.find('.selectTriggerOperationRow #triggerValueInput:visible input').val();
	}
	//Sort affected entries by elements and rows
	var $affectedRows = [], $affectedElements = [];
	$actionBody.find('.selectAffectedElementOrRow').each(function(){
		if($(this).find('#actionResult option:selected').attr('value').indexOf('Row') > 0){
			$affectedRows.push($(this));
		} else {
			$affectedElements.push($(this));
		}
	});
	
	//If the name or trigger element isn't specified correctly, show  message an don't continue
	if($actionName === '') {
		showBootstrapInfoDialog("No action name", "Please choose an action name to save this action", "warning");
		return false;
	} else if ($triggerElement.trid === undefined || $triggerElement.mcid === undefined || $triggerElement.eid === undefined || 
		$triggerElement.triggerOperatorId === undefined || $triggerElement.triggerValue === ''){
		showBootstrapInfoDialog("No trigger element", "Please completely specify a trigger element to save this action", "warning");	
		return false;
	} 
	
	//Start to extract the information out of the affected rows and elements arrays and save them into objects
	var $affectedRowsArray = [], $affectedElementsArray = [];
	var $resultRows = true, $resultElements = true;
	//Start with the rows
	$.each($affectedRows, function(){
		if(!$(this).find('.btnChooseAffectedElementOrRow').next('div').exists()){
			$resultRows = false;
			return false;
		} else {
			var $currentEntry = {
				trid:	 		$(this).find('.btnChooseAffectedElementOrRow').next('div').attr('trid'),
				actionResult: 	$(this).find('#actionResult option:selected').attr('value'),
				orderNo:		$(this).attr('orderno')
			};	
			$affectedRowsArray.push($currentEntry);
			return true;
		}
	});
	//.. and continue with the elements
 	$.each($affectedElements, function(){
		if(!$(this).find('.btnChooseAffectedElementOrRow').next('div').exists()){
			$resultElements = false;
			return false;
		} else {
			var $currentEntry = {
				trid: 			$(this).find('.btnChooseAffectedElementOrRow').next('div').attr('trid'),
				mcid: 			$(this).find('.btnChooseAffectedElementOrRow').next('div').attr('mcid'),
				eid: 			$(this).find('.btnChooseAffectedElementOrRow').next('div').attr('eid'),
				actionResult: 	$(this).find('#actionResult option:selected').attr('value'),
				orderNo:		$(this).attr('orderno')
			};
			if($currentEntry.actionResult === 'insertElement'){
				if($(this).next('.selectAffectedElementInput').find('#actionResultInputValue input').val() === ''){
					$resultElements = false;
					return false;
				}
				$currentEntry.actionResultInputValue = $(this).next('.selectAffectedElementInput').find('#actionResultInputValue input').val();
			}
			
			$affectedElementsArray.push($currentEntry);
			return true;
		}
	});

	//Show warning messages if a row was specified completely, an entry wasn't specified completely or any action result wasn't specified at all
 	if(!$resultRows){
		showBootstrapInfoDialog("Empty affected entries", "There are entries for affected rows that are not specified. To save this action, delete those entries or choose an affected row.", "warning");	
		return false;
	} else if(!$resultElements){
		showBootstrapInfoDialog("Empty affected entries", "There are entries for affected elements that are not completely specified. To save this action, delete those entries or specify them completely.", "warning");	
		return false;
	} else if($affectedRowsArray.length === 0 && $affectedElementsArray.length === 0){
		showBootstrapInfoDialog("Empty affected entry", "There is no entry specified. To save this action, specify at least one affected element or row.", "warning");	
		return false;
	}
	
	//Debug output only for testing
	console.log('################################################################################################################################');
	console.log('Action name: ' + $actionName);
	console.log('Trigger element: trid=' + $triggerElement.trid + ', mcid=' + $triggerElement.mcid + ', eid=' + $triggerElement.eid + ', triggerOperationId=' +$triggerElement.triggerOperatorId);
	console.log('Trigger element value: ' + $triggerElement.triggerValue);
	console.log('Affected rows:');
 	$.each($affectedRowsArray, function(index, element){
		console.log((index+1) + '#: Action-Result = ' + element.actionResult + ', trid = ' + element.trid);
	});
	console.log('\nAffected elements:');
	$.each($affectedElementsArray, function(index, element){
		var $resultInputValue = element.actionResultInputValue === undefined ? '' : element.actionResultInputValue;
		console.log((index+1) + '#: Action-Result = ' + element.actionResult + ', trid = ' + element.trid + ', mcid = ' + element.mcid + ', eid = ' + element.eid + ', actionResultInputValue = ' + $resultInputValue);
	});
	console.log('################################################################################################################################');
	
	//Insert the data with an ajax command but lock the buttons before
	dialogItself.enableButtons(false);
	$.ajax({
		type: 		"POST",
		url: 		'db/db_saveAction.php',
		data: 		{
						actionName:				$actionName,
						actionCreatorQtb:		sessionStorage.getItem('qtbNumber'),
						actionId:				($.type(dialogItself.getData('actionId')) === "undefined" ? 'undefined' : dialogItself.getData('actionId')),
						triggerElement: 		$triggerElement,
						affectedRowsArray:		($affectedRowsArray.length === 0 ? 'undefined' : $affectedRowsArray),
						affectedElementsArray:	($affectedElementsArray.length === 0 ? 'undefined' : $affectedElementsArray)
					},
		dataType:	'json',
		success: 	function(data){			
						dialogItself.setData('actionId', data['actionId']);	
						dialogItself.setData('actionName', $actionName);	
					}
	}).fail(function(data){
		showBootstrapInfoDialog("Error", "Can't save Action in DB!:\n" + JSON.stringify(data), 'danger');
		dialogItself.enableButtons(true);
	}).done(function(){
		dialogItself.enableButtons(true);
	});
	
	return true;
}


//************************************************************************************************
// Get an initialized message body for the main dialogue
//************************************************************************************************
/* function getInitializeMainDialogMessage($templateRowId, callbackFunction){
	$.get("actionHtml/manageActionsDialog.html", function(blankDialog){
		//Create an object of the body element and one single row
		var $messageBody = $($.parseHTML(blankDialog));
		var $messageActionRow = $messageBody.find('.actionRow');
		$messageBody.find('.actionRow').remove();

		//Get all actions from the DB and append them to the the messageBody
		$.ajax({
			type: "POST",
			url: 'db/db_getAllActionsHavingTemplateRowId.php',	
			data: {templateRowId: $templateRowId},
			dataType:'json',
			success: function(data){					
				$.each(data, function(index, element) {		
					var $currentRow = $messageActionRow.clone();
					$currentRow.find('.actionNumberBadge span').html((index+1) + '#');
					$currentRow.find('.actionName span').html(element.ActionName);
					$currentRow.attr('actionId', element.Id);
					$messageBody.find('.list-group').append($currentRow);
				});	
			}				
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get actions for this row from DB!", 'danger');
		}).done(function(){	
			//Initialize delete buttons
			$messageBody.find('.deleteAction').each(function(){
				var $currentButton = $(this);
				$(this).click(function(){
					//Let the user confirm that he wants to delete this action
					showBootstrapConfirmDialog('Delete action', 'Are you sure you want to delete this action?', 'warning', function(result) {
						if(result){
							$.ajax({
								type: "POST",
								url: 'db/db_deleteActionHavingId.php',	
								data: {actionId: $currentButton.parents('.actionRow').attr('actionid')},
								success: function(data){
									var $listGroupBody = $currentButton.parents('#listGroupBody');
									$currentButton.parents('.actionRow').remove();
									//Add a short message to the message body if there are no action-elements left
									if(!$listGroupBody.children('.actionRow').exists()){
										$listGroupBody.append("<span>There are currently no actions set.</span>");
									}
								}		
							}).fail(function(){
								showBootstrapInfoDialog("Error", "Can't delete action from DB!", 'danger');
							});
						}
					});
					//END CONFIRM DIALOGUE
				});
				//END CLICK EVENT
			});	
			//Call the callback function with the initialized messageBody
			callbackFunction($messageBody);
		});
		//END EACH FUNCTION
	});	
	//END DONE FUNCTION
} */


//************************************************************************************************
// Refresh the forbidden elements
//************************************************************************************************
function refreshForbiddenElementsList($mainDialog, $newActionDialog){
	//To make sure the same trigger element isn't used for several action (which would very likely cause logic errors)
	//an array of forbidden elements is created and saved in the data storage of the main dialogue. They are identified by 
	//their TriggerElementModuleColumnId. Remove those trigger elements that belongs to this action itself!
	$.ajax({
		type: "POST",
		url: 'db/db_getAllActionsHavingTemplateRowId.php',	
		data: {templateRowId: $mainDialog.getData('currentRow').attr('id')},
		dataType:'json',
		success: function(data){
			var $forbiddenElements = [];
			var $actionIsInDB = $.type($newActionDialog.getData('actionId')) !== 'undefined';
			var $actionId = $actionIsInDB ? $newActionDialog.getData('actionId') : null;
			$.each(data, function(index, element) {					
				//Don't use those elements that belongs to the current action (cause this action could already be saved so its trigger elements wouldn't be selectable otherwise
				if($actionIsInDB && $actionId !== element.Id){
					$forbiddenElements.push(element.TriggerElementModuleColumnId);
				} else if(!$actionIsInDB){
					$forbiddenElements.push(element.TriggerElementModuleColumnId);
				}
			});	
			
			
			/* if($.type($newActionDialog.getData('actionId')) !== 'undefined'){
				
			} */
			
			$mainDialog.setData('forbiddenElements', $forbiddenElements);
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get actions for this row from DB!", 'danger');
	});	
}


//************************************************************************************************
// Load a action dialogue for editing
//************************************************************************************************
function loadEditActionDialogue($mainDialog, $actionId){
	$mainDialog.setData('dialogIsStillNeeded', true);
	$mainDialog.close();
	$.get("actionHtml/newActionDialog.html", function(blankDialog){
		var $messageBody = $($.parseHTML(blankDialog));
		var $actionName = '';
		//Get all information from the DB
		$.ajax({
			type: "POST",
			url: 'db/db_getWholeActionByActionId.php',	
			data: {actionId: $actionId},
			dataType:'json',
			success: function(data){
				
				//Prepare the message body
				$messageBody.find('#actionName input').val(data['actionArray'][0].ActionName);
				$actionName = data['actionArray'][0].ActionName;
				//Prepare the data of the trigger element
				$messageBody.find('#btnChooseTriggerElement').next('div').attr('trid', data['actionArray'][0].TriggerElementTemplateRowId).attr('mcid', data['actionArray'][0].TriggerElementModuleColumnId).attr('eid', data['actionArray'][0].TriggerElementElementId);
				var $triggerElementInformation = "Row " + $("#items-list .template-row[id='"+data['actionArray'][0].TriggerElementTemplateRowId+"']").attr('rowposition') + "), Element '";
				var $triggerElement = $("#items-list .template-row[id='"+data['actionArray'][0].TriggerElementTemplateRowId+"']").find(".singleElement[mcid='"+data['actionArray'][0].TriggerElementModuleColumnId+"']").find('.editableCheckbox, .editableRadiobutton, .editableInput, .checkButton');

				if($triggerElement.attr('type') === 'text'){
					$triggerElementInformation += 'Input field';
					$messageBody.find('#triggerValueInput').show().find('input').val(data['actionArray'][0].TriggerValue);
				} else if($triggerElement.attr('type') === 'checkbox'){
					$triggerElementInformation += 'Check box';
					$messageBody.find('#triggerValueCheckAndRadio').show();
				} else if($triggerElement.attr('type') === 'radio'){
					$triggerElementInformation += 'Radio button';
					$messageBody.find('#triggerValueCheckAndRadio').show();
				} else if($triggerElement.hasClass('checkButton')){
					$triggerElementInformation += 'Check button';
					$messageBody.find('#triggerValueCheckbutton').show();
				}
				
				$triggerElementInformation += "', MCId " + data['actionArray'][0].TriggerElementModuleColumnId + ", EId " + data['actionArray'][0].TriggerElementElementId;
				$messageBody.find('#chosenTriggerInformation span').html($triggerElementInformation);
				$messageBody.find('.standardElementToShow').show();
				
				//Get the right trigger value operator
				$.ajax({
					type: "POST",
					url: 'db/db_getAllTriggerValueOperator.php',		
					data: {eid: data['actionArray'][0].TriggerElementElementId},
					dataType:'json',
					success: function(newData){
						var $triggerOperator = $messageBody.find('#triggerOperator select');
						$triggerOperator.children().remove();
						$.each(newData, function(index, element) {		
							$triggerOperator.append("<option triggerid='"+element.Id+"'>"+element.TriggerOperator+"</option>");
						});
						$triggerOperator.find("option[triggerid='"+data['actionArray'][0].TriggerValueOperatorId+"']").prop('selected', true);
					}				
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Can't get trigger value operators from DB!", 'danger');
				});
				
				//Now recreate all affected entries
				var $blancAffectedEntry = $messageBody.find('.selectAffectedElementOrRow').clone();
				$blancAffectedEntry.removeClass('firstOfItsKind');
				var $blancAffectedEntryInput = $messageBody.find('.selectAffectedElementInput').clone();
				$blancAffectedEntry.find('.standardElementToShow').show();
				$messageBody.find('.selectAffectedElementOrRow').remove();
				$messageBody.find('.selectAffectedElementInput').remove();
				
				var $noOfTotalAffectedEntries = data['rowArray'].length + data['elementArray'].length;
				for(i = 1; i <= $noOfTotalAffectedEntries; i++){
					var $currentAffectedEntry = $blancAffectedEntry.clone();
					//It's an row
					if(data['rowArray'][0].OrderNo == i){		
						var $currentAffectedDataSet = data['rowArray'].shift();
						$currentAffectedEntry.attr('orderno', $currentAffectedDataSet.OrderNo);
						$currentAffectedEntry.find("#actionResult option[value='"+$currentAffectedDataSet.ActionResultRowValue+"']").prop('selected', true);
						$currentAffectedEntry.find('#actionResultEffectsRow').show();
						$currentAffectedEntry.find('#chosenAfftectedRowOrElementInformation span').html('Row ' + $("#items-list .template-row[id='"+$currentAffectedDataSet.ActionResultTemplateRowId+"']").attr('rowposition') + ')');
						$currentAffectedEntry.find('.btnChooseAffectedElementOrRow').after("<div trid='"+$currentAffectedDataSet.ActionResultTemplateRowId+"'></div>");
						$messageBody.find('.addAnotherAffectedRow').before($currentAffectedEntry);
						$messageBody.find('.addAnotherAffectedRow').before($blancAffectedEntryInput.clone());
						
					//It's an element
					} else {
						var $currentAffectedDataSet = data['elementArray'].shift();
						$currentAffectedEntry.attr('orderno', $currentAffectedDataSet.OrderNo);
						$currentAffectedEntry.find("#actionResult option[value='"+$currentAffectedDataSet.ActionResult+"']").prop('selected', true);
						$currentAffectedEntry.find('#actionResultEffectsElement').show();
						$currentAffectedEntry.find('#actionResultEffectsRow').hide();
						$currentAffectedEntry.find('.btnChooseAffectedElementOrRow span:last').html('Choose element');
						var $chosenElementInformation = "Row " + $("#items-list .template-row[id='"+$currentAffectedDataSet.ActionResultTemplateRowId+"']").attr('rowposition') + "), Element '";
						var $chosenElement = $("#items-list .template-row[id='"+$currentAffectedDataSet.ActionResultTemplateRowId+"']").find(".singleElement[mcid='"+$currentAffectedDataSet.ActionResultModuleColumnId+"']").find('.editableCheckbox, .editableRadiobutton, .editableInput');
						
						if($chosenElement.attr('type') === 'text'){
							$chosenElementInformation += 'Input field';
						} else if($chosenElement.attr('type') === 'checkbox'){
							$chosenElementInformation += 'Check box';
						} else if($chosenElement.attr('type') === 'radio'){
							$chosenElementInformation += 'Radio button';
						} 
						
						$chosenElementInformation += "', MCId " + $currentAffectedDataSet.ActionResultModuleColumnId + ", EId " + $currentAffectedDataSet.ActionResultElementElementId ;
						$currentAffectedEntry.find('#chosenAfftectedRowOrElementInformation span').html($chosenElementInformation);
						$currentAffectedEntry.find('.btnChooseAffectedElementOrRow').after("<div trid='"+$currentAffectedDataSet.ActionResultTemplateRowId+"' eid='"+$currentAffectedDataSet.ActionResultElementElementId+"' mcid='"+$currentAffectedDataSet.ActionResultModuleColumnId+"'></div>");
						$messageBody.find('.addAnotherAffectedRow').before($currentAffectedEntry);
						var $affectedEntryInput = $blancAffectedEntryInput.clone();
						
						if($chosenElement.attr('type') === 'text'){	
							$affectedEntryInput.show();
							$affectedEntryInput.find('#actionResultInputValue input').val($currentAffectedDataSet.ActionResultInputValue);
							$affectedEntryInput.css('display', '');
						}
						
						$messageBody.find('.addAnotherAffectedRow').before($affectedEntryInput);
					}
					if(i !== 1){
						$currentAffectedEntry.find('.btnDeleteEntryAffectedElementOrRow').parents('td').show();
					}
					
					
				}
				//END FOR
				
			}
			//END SUCCESS			
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get action from DB!", 'danger');
		}).done(function(){
			
			var $newActionDialog = BootstrapDialog.show({
				type: BootstrapDialog.TYPE_INFO,
				size: BootstrapDialog.SIZE_WIDE,
				title: 'Edit action',
				message: $messageBody,
				data: {'actionId': $actionId, 'actionName': $actionName},
				autodestroy: false,
				draggable: true, 
				closable: false, 
				buttons: [{
					id:			'btnSaveAction',
					label:		'Save',
					cssClass:	'btn-primary',
					icon:		'glyphicon glyphicon-floppy-save',
					action: 	function(dialogItself) {
									templateIsLocked(function isLocked(locked){	
										if(!locked){
											saveAction(dialogItself);
											refreshForbiddenElementsList($mainDialog, dialogItself);
										} else {
											showBootstrapInfoDialog("Invalid operation", "Can't save this action. There are worksheets based on this template and it's therefore locked!", "warning");
										}
									});
								}
				},{
					id: 		'btnCloseDialog',
					label: 		'Close',
					cssClass: 	'btn-danger',
					icon: 		'glyphicon glyphicon-remove',
					action: 	function(dialogItself) {
									dialogItself.setAutodestroy(true);
									$mainDialog.open();
									$mainDialog.setData('dialogIsStillNeeded', false);
									
									//If the dialogue was saved refresh the view in the main window
									if($.type(dialogItself.getData('actionId')) !== 'undefined'){
										//$.get("actionHtml/manageActionsDialog.html", function(blankDialog){
											//Clone one of the old rows and set name and Id
											$mainDialog.getModalBody().find(".actionRow[actionid='"+$actionId+"'] .actionName span").html(dialogItself.getData('actionName'));
											//var $newActionRow = $($.parseHTML(blankDialog)).find('.actionRow').clone();
											//$newActionRow.find('.actionName span').html(dialogItself.getData('actionName'));
											//$newActionRow.attr('actionid', dialogItself.getData('actionId'));
										
											//Remove the span saying there is no action currently set, if existent and set the new row
											/* if(!$mainDialog.getModalBody().find('.list-group').children('.actionRow').exists()){
												$mainDialog.getModalBody().find('.list-group span').remove();
												$mainDialog.getModalBody().find('.list-group').append($newActionRow);
											} */
													
											//To sort the new action row correctly (alphabetically) into the list all names are needed
											var $actionNames = [];
											//$actionNames.push(dialogItself.getData('actionName'));
											//var $actionsToSort = [];
											$mainDialog.getModalBody().find('.actionRow .actionName span').each(function(){
												//$actionsToSort.push($(this));
												$actionNames.push($(this).html());
											});
											
											// $mainDialog.getModalBody().find('.actionRow .actionName span').each(function(){
												// $actionNames.push($(this).html());
											// });
											//Sort array and put the action in the right place
											$actionNames.sort();
											console.log('names in array: ' + $actionNames.valueOf());
											//Remove all actions from the modal body
											//$mainDialog.getModalBody().find('.actionRow').remove();
											//Sort them
											var $currentActionRow = $mainDialog.getModalBody().find('.actionRow:first');
											var $lastActionRow = $mainDialog.getModalBody().find('.actionRow:last');
											$.each($actionNames, function(index){
												var $nextActionRow = $currentActionRow.next('.actionRow');
												while(this != $currentActionRow.find('.actionName span').html()){
													$currentActionRow.insertAfter($lastActionRow);
													$currentActionRow = $nextActionRow;
													$nextActionRow = $nextActionRow.next('.actionRow');
												}
												$currentActionRow.find('.actionNumberBadge span').html((index+1) + '#');
												$currentActionRow = $currentActionRow.next('.actionRow');
												$lastActionRow = $mainDialog.getModalBody().find('.actionRow:last');
												
												// $.each($actionsToSort, function(){
													// if($currentName === $(this).find('.actionName span').html()){
														// $mainDialog.getModalBody().find('listGroupBody').append(this);
														// $(this).find('.actionNumberBadge span').html((index+1) + '#');
														// return false;
													// }
												// });
												
											});
											
											// $mainDialog.getModalBody().find('.actionRow .actionName span').each(function(index){
												// console.log('Current name: ' + $(this).html());
												// if($(this).html() !== $actionNames.shift()){
													// $(this).parents('.actionRow').before($newActionRow);
													// return false;
												// } else if ($mainDialog.getModalBody().find('.actionRow .actionName span').length === index+1){
													// $(this).parents('.actionRow').after($newActionRow);
												// }
											// });
											//Refresh number badges
											// $mainDialog.getModalBody().find('.actionRow .actionNumberBadge span').each(function(index){
												// $(this).html((index+1) + '#');
											// });
											
											//Initialize the delete button
											/* $newActionRow.find('.deleteAction').click(function(){
												//Let the user confirm that he wants to delete this action
												showBootstrapConfirmDialog('Delete action', 'Are you sure you want to delete this action?', 'warning', function(result) {
													if(result){
														$.ajax({
															type: "POST",
															url: 'db/db_deleteActionHavingId.php',	
															data: {actionId: $newActionRow.attr('actionid')},
															success: function(data){
																var $listGroupBody = $newActionRow.parents('#listGroupBody');
																$newActionRow.remove();
																//Add a short message to the message body if there are no action-elements left
																if(!$listGroupBody.children('.actionRow').exists()){
																	$listGroupBody.append("<span>There are currently no actions set.</span>");
																}
															}		
														}).fail(function(){
															showBootstrapInfoDialog("Error", "Can't delete action from DB!", 'danger');
														});
													}
												});
												//END CONFIRM DIALOGUE
											}); */
										//});
									} 
									
									dialogItself.close();
								}
				}]
			
			});
			//END BOOTSTRAP DIALOG
			
			//Prepare the choose trigger element button
			initializeChooseTriggerElementButton($mainDialog, $newActionDialog);
			
			//Initialize the add another affected element or row button
			$messageBody.find('.btnAddAnotherAffectedRow').removeClass('btnIsNotInitialized');
			$messageBody.find('.btnAddAnotherAffectedRow').click(function(e){
				$(this).removeClass('btnIsNotInitialized').parents('td').hide(300);
				initializeNewAffectedRowOrElementEntry($mainDialog, $newActionDialog);
			});
			
			//Initialize every delete affected entry buttons
			$messageBody.find('.btnDeleteEntryAffectedElementOrRow:not(:first)').click(function(){		
				//If the entry is deleted and not all of the entries have a value yet, show the add new entry button again
				var $allRowEntryDeleteButtons = $(this).parents('.selectAffectedElementOrRow').siblings('.selectAffectedElementOrRow').find('.btnChooseAffectedElementOrRow');
				if($allRowEntryDeleteButtons.length === $allRowEntryDeleteButtons.siblings('div').length){
					$newActionDialog.getModalBody().find('.btnAddAnotherAffectedRow').parents('td').show(500);
				}
				var $allNextAffectedEntries = $(this).parents('.selectAffectedElementOrRow').nextAll('.selectAffectedElementOrRow');
				$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').remove();
				$(this).parents('.selectAffectedElementOrRow').remove();
				
				//If the deleted row was part of a confirm action, empty those entry
				$allNextAffectedEntries.each(function(){
					if(($(this).find('#actionResult option:selected').attr('value') === 'confirmRow') && ($(this).find('.btnChooseAffectedElementOrRow').next('div').exists())){
						if(!rowIsFullySpecified($(this))){
							$(this).find('.btnChooseAffectedElementOrRow').next('div').remove();
							$(this).find('#chosenAfftectedRowOrElementInformation span').html('<i>No element chosen</i>');
						}
					}
				});

				//Set the right order number again
				$newActionDialog.getModalBody().find('.selectAffectedElementOrRow').each(function(index){
					$(this).attr('orderno', index+1);
				});
			});
			
			//Initialize the change event listener of every affected entry
			$messageBody.find('#actionResult select').change(function(){
				if($(this).find('option:selected').attr('value').indexOf('Row') > 0) {
					$(this).parents('td').siblings('#actionResultEffectsElement').hide();
					$(this).parents('td').siblings('#actionResultEffectsRow').show(500);
					$(this).parents('td').siblings().find('.btnChooseAffectedElementOrRow span:last').html('Choose row');
					//Hide input value row
					//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').hide(500);
					$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').hide(500);
				} else {
					$(this).parents('td').siblings('#actionResultEffectsRow').hide();
					$(this).parents('td').siblings('#actionResultEffectsElement').show(500);
					$(this).parents('td').siblings().find('.btnChooseAffectedElementOrRow span:last').html('Choose element');
					//If an input is chosen also show the another row to specify the input value
					if($(this).find('option:selected').attr('value') === 'insertElement'){
						//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').show(500);
						$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').show(500);
					} else{
						//$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').find('.standardElementToShow').hide(500);
						$(this).parents('.selectAffectedElementOrRow').next('.selectAffectedElementInput').hide(500);
					}
				}
				//Remove old information if affected element or row respectively is changed				
				$(this).parents('td').siblings('#chosenAfftectedRowOrElementInformation').find('span').html("<i>No element chosen</i>");
				$(this).parents('td').siblings('td').find('.btnChooseAffectedElementOrRow').next('div').remove();
			});
			
			//Initialize the choose affected element button
			$messageBody.find('.btnChooseAffectedElementOrRow').click(function(){
				var $isRow = ($(this).parents('td').siblings('#actionResult').find('option:selected').attr('value').indexOf('Row') > 0) ? true : false;
				prepareDocumentToSelectAffectedRowOrElement($mainDialog.getData('currentRow'), $mainDialog, $newActionDialog, $(this).parents('.selectAffectedElementOrRow'), $isRow, true);
			});	
			
			
			
			
			refreshForbiddenElementsList($mainDialog, $newActionDialog);	
		});
		//END DONE	
				
	});	
	//END GET
		

}
