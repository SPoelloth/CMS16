
//************************************************************************************
// Initialize action functions
//************************************************************************************
function initializeRowsActionFunctions($worksheetRow){
	console.log('Init row: '+$worksheetRow.attr('trid'));
	var $actionArray = [], $actionResultRowArray = [], $actionResultElementArray = [];
	
	$.ajax({
		type: "POST",
		url: 'db/db_getAllActionsAndAffectedRowsByTemplateRowId.php',
		data: {templateRowId: $worksheetRow.attr('trid')},
		dataType:'json'
	}).done(function(data){
		$actionArray = $.parseJSON(data['actionArray']);
		$actionResultRowArray = $.parseJSON(data['actionResultRowArray']);
		$actionResultElementArray = $.parseJSON(data['actionResultElementArray']);
		
		//Now create custom events for all actions based on this template/worksheet row
		$.each($actionArray, function(index, element){
			console.log('Init action: '+element.ActionName+' of row: '+element.TemplateRowId);
			//Extract all information from the result arrays that belong to this action and push them into a new arrays
			console.log('length of element array: '+$actionResultElementArray.length);
			console.log('length of row array: '+$actionResultRowArray.length);
			var $actionResultArray = [];
			var $entriesLeft = true;
			while($entriesLeft){
				//entries in both arrays are left
				if($actionResultRowArray.length > 0 && $actionResultElementArray.length > 0){
					//Both arrays have affected entries belonging to the current action
					if($actionResultRowArray[0].ActionId === element.Id && $actionResultElementArray[0].ActionId === element.Id){
						//The action result row array is first
						if($actionResultRowArray[0].OrderNo < $actionResultElementArray[0].OrderNo){
							$actionResultArray.push($actionResultRowArray.shift());
						//The action result element array is first	
						} else{
							$actionResultArray.push($actionResultElementArray.shift());
						}
					//Only the row array have affected entries belonging to the current action
					} else if($actionResultRowArray[0].ActionId === element.Id){
						$actionResultArray.push($actionResultRowArray.shift());
					//Only the element array have affected entries belonging to the current action
					} else if($actionResultElementArray[0].ActionId === element.Id){
						$actionResultArray.push($actionResultElementArray.shift());
					//Both arrays still have elements but none of them belong to this action
					} else{
						$entriesLeft = false;
					}
				//only entries in the row array are left
				} else if($actionResultRowArray.length > 0){
					if($actionResultRowArray[0].ActionId === element.Id){
						$actionResultArray.push($actionResultRowArray.shift());
					} else{
						$entriesLeft = false;
					}	
				//only entries in the element array are left
				} else if($actionResultElementArray.length > 0){
					if($actionResultElementArray[0].ActionId === element.Id){
						$actionResultArray.push($actionResultElementArray.shift());
					} else{
						$entriesLeft = false;
					}	
				} else {
					$entriesLeft = false;
				}
			}
			//END WHILE
		
			//Create the current action event with the name 'actionEvent0', 'actionEvent1' and so on. The action first created will also be first triggered.
			//When the first action is done, it triggers the next action and so on.
			$worksheetRow.find('.checkButton').on('actionEvent'+index, {
				action:				element,
				actionIndex:		index,
				actionResultArray: 	$actionResultArray
			}, function(event){
				console.log('Event triggered: actionEvent'+event.data.actionIndex+", Name: "+event.data.action.ActionName);
				var $triggerRow = $(this).parents('.worksheet-row');
				var $triggerElement = $triggerRow.find(".singleElement[mcid='"+event.data.action.TriggerElementModuleColumnId+"']");
				var $launchAction = false;
				//Find out which element it is and if the action should be launched
				//Trigger is an radiobutton or a checkbox
				if($triggerElement.find('.editableRadiobutton').exists() || $triggerElement.find('.editableCheckbox').exists()){
					if(event.data.action.TriggerOperator === 'is'){
						if($triggerElement.find('.editableRadiobutton, .editableCheckbox').prop('checked')){
							$launchAction = true;
						}
					} else if(event.data.action.TriggerOperator === 'is not'){
						if(!$triggerElement.find('.editableRadiobutton, .editableCheckbox').prop('checked')){
							$launchAction = true;
						}
					}				
				//Trigger is an input field
				} else if($triggerElement.find('.editableInput').exists()){
					switch(event.data.action.TriggerOperator){
						case '==':
							$launchAction = $triggerElement.find('.editableInput').val() == event.data.action.TriggerValue ? true : false;
							break;
						case '!=':
							$launchAction = $triggerElement.find('.editableInput').val() != event.data.action.TriggerValue ? true : false;
							break;
						case '>':
							$launchAction = parseInt($triggerElement.find('.editableInput').val()) > parseInt(event.data.action.TriggerValue) ? true : false;
							break;
						case '<':
							$launchAction = parseInt($triggerElement.find('.editableInput').val()) < parseInt(event.data.action.TriggerValue) ? true : false;
							break;
						case '>=':
							$launchAction = parseInt($triggerElement.find('.editableInput').val()) >= parseInt(event.data.action.TriggerValue) ? true : false;
							break;
						case '<=':
							$launchAction = parseInt($triggerElement.find('.editableInput').val()) <= parseInt(event.data.action.TriggerValue) ? true : false;
							break;
						default:
							$launchAction = $triggerElement.find('.editableInput').val() == event.data.action.TriggerValue ? true : false;
							break;
					}
				
				//Trigger element is a checkbutton
				} else if($triggerElement.find('.checkButton').exists()){
					if(event.data.action.TriggerValue === 'confirmed'){
						$launchAction = $triggerElement.find('.confirmedPopover').exists();
					} else if(event.data.action.TriggerValue === 'skipped'){
						$launchAction = $triggerElement.find('.skippedPopover').exists();
					}
				}
				//END OF DISTINGUISHING IF ACTION SHOULD BE LAUNCHED
				
				//If the trigger element was triggered/checked/whatever then launch the actual action
				if($launchAction){
					console.log('trigger element valid, affecting begins now: no of affected entries: '+$actionResultArray.length);
					$.each($actionResultArray, function(index, element){
						console.log('affecting entry '+index);
						var $affectedRow = $(".worksheet-row[trid='"+element.ActionResultTemplateRowId+"']");
						//First of all distinguish if it's an affected element or an affected row
						//It's an element
						if(typeof element.ActionResultModuleColumnId !== 'undefined' && !$affectedRow.find('.confirmedPopover, .skippedPopover').exists()){
							console.log('affected element');
							var $affectedElement = $affectedRow.find(".singleElement[mcid='"+element.ActionResultModuleColumnId+"']");
							//Distinguish which type of element it is
							//Checkbox or radiobutton
							if($affectedElement.find('.editableCheckbox, .editableRadiobutton').exists()){
								$affectedElement.find('.editableCheckbox, .editableRadiobutton').prop('checked', true);
								console.log('check checkbutton or radiobutton');
							//It is an input element
							} else {
								$affectedElement.find('.editableInput').val(element.ActionResultInputValue);
								console.log('insert into element');
							}
							//Add some visual effects
							$affectedElement.css('box-shadow', '0px 0px 0px 0px rgba(102,175,233,1)').velocity({
								boxShadowBlur: "12px",
								boxShadowSpread: "8px",
								translateZ: 110
							}, {
								duration: 400,
								easing: "ease-out"
							}).velocity('reverse');
							
						//It's a row	
						} else if (!$affectedRow.find('.confirmedPopover, .skippedPopover').exists()){
							console.log('affected row');
							//Distinguish if the row should be confirmed or skipped
							//Row has to be confirmed
							if(element.ActionResultRowValue === 'confirmRow'){
								var $confirmText = "<br>This row was automatically confirmed by action <b>'"+element.ActionName+"'</b> (Id="+element.ActionId+") triggered from <b>Row "+$(".worksheet-row[trid='"+element.ActionOriginTemplateRowId+"']").attr('rowposition')+")</b> (Id="+element.ActionOriginTemplateRowId+")<br>";
								var $ajaxPost = saveInputFields($affectedRow.find('.checkButton'), false, $confirmText);
								$ajaxPost.then(function(){
									$affectedRow.css('box-shadow', '0px 0px 0px 0px rgba(77,244,77, .7)').velocity({
										boxShadowBlur: "20px",
										boxShadowSpread: "10px",
										translateZ: 100
									}, {
										duration: 500,
										easing: "ease-out"
									}).velocity('reverse');
								});
								console.log('confirm row');
							//Row has to be skipped
							} else {
								var $worksheetContent = [];
								var $skipText = "This row was automatically skipped by action <b>'"+element.ActionName+"'</b> (Id="+element.ActionId+") triggered from <b>Row ";
								$skipText += $(".worksheet-row[trid='"+element.ActionOriginTemplateRowId+"']").attr('rowposition')+")</b> (Id="+element.ActionOriginTemplateRowId+")";
								
								$worksheetContent.push({
									value: 'skipped ('+$skipText+')',
									moduleColumnId: $affectedRow.find('.checkButton').parents('.singleElement').attr('mcid'),
									templateRowId: element.ActionResultTemplateRowId,
									worksheetId: $("#hiddenWorksheetId").text(),
									responsiblePersonQtbNumber: sessionStorage.getItem('qtbNumber'),
									commentText: $skipText
								});
								var ajaxPost = skipRow($worksheetContent, $affectedRow);
								ajaxPost.then(function(){
									$affectedRow.css('box-shadow', '0px 0px 0px 0px rgba(255,0,0,.4)').velocity({
										boxShadowBlur: "20px",
										boxShadowSpread: "10px",
										translateZ: 100
									}, {
										duration: 500,
										easing: "ease-out"
									}).velocity('reverse');
								});
								console.log('skip row');
								console.log($skipText);
							}
							
						}
					});
					//END EACH
				}
				//END IF LAUNCH ACTION
				//Launch the next action event
				if((event.data.actionIndex+1) < $actionArray.length){
					$worksheetRow.find('.checkButton').trigger('actionEvent'+(event.data.actionIndex+1));
				}

				$worksheetRow.find('.checkButton').off('actionEvent'+event.data.actionIndex);
			
			});
			//END TRIGGER EVENT		
			
		});
		//END EACH ACTION	
		
	});
	//END AJAX DONE FUNCTION

}

