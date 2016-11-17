 $(document).ready($(function(){ 
	//*************************************
	// Initialize
	//*************************************
	$(document).find('.wmsHeader').hide();	
	$( ".templateHeader" ).load( "templateHead.html" );	
	
	//Get & Set hiddenTemplateId
	var templateId = getUrlParameter('templateid');
	//************************************
	// LOAD TEMPLATE
	//************************************	
	// Load Categories for the Header
	$.ajax({
		type: "POST",
		url: 'db/db_getAllCategories.php',		
		dataType:'json',
		success: function(data){					
			$.each(data, function(index, element) {		
				$('.templateCategory').append( "<option value='"+element.Id+"'>"+element.Name+"</option>" );				
			});
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
	}).done(function() {
		if(templateId !== null){
			//Load Content
			$.ajax({
			type: "POST",
			url: 'db/db_getWholeTemplateById.php',
			data: {data:templateId},
			dataType:'json',
			success: function(data){

				var lastRowPosition = null;
		
				//Set template header information
				$("#templateHeadlineName").val(data[0]["TemplateName"]);			
				$('#templateNo').val(data[0]["TemplateNo"]);
				$('#templateVersion').val(data[0]["TemplateVersionNo"]);
				$('#templateStatus').val(data[0]["TemplateStatus"]);
				$('#templateValidFor').val(data[0]["TemplateValidFor"]);
				$('#templateCategory').val(data[0]["TemplateCategoryId"]);	
				$('.templateCreatorUsername').text(data[0]["FirstName"]+' '+data[0]["LastName"]+' ('+data[0]["QtbNumber"]+')');	
				$('.currentDateStamp').text(data[0]["TemplateCreated"]);	
				$('#hiddenTemplateId').text(data[0]["TemplateId"]);
				
				//Get the empty row as an template
				$.get("templateRow.html", function(blancTemplateRow){
				
					var $currentRow = null;
					$.each(data, function(index, element) {	
						//Create a new row
					 	if(lastRowPosition === null || lastRowPosition != element.RowNo) {		
							//Insert the new row into the items-list and select it
							$("#items-list").append($($.parseHTML(blancTemplateRow)));
							$currentRow = $("#items-list").children(':last');
							//Add the row number and some attributes for row's identification
							if(parseInt(element.RowNo) < 10){
								$currentRow.find('.rownumberbadge').html('  '+element.RowNo+')');
							} else {
								$currentRow.find('.rownumberbadge').html(element.RowNo+')');
							}
							
							$currentRow.attr({'id': element.TemplateRowId, 'rowposition': element.RowNo, 'colorid': element.ColorCode, 'mId': element.ModuleId});
						} 
						//It's easiest to create every element as an string and append it rather than pre-defining it as html
						var $elementCode  = "<td class='moduleElement' style='width:"+element.Size*87.5/100+"%'>";
							$elementCode += "<div class='singleElement' mcId='"+element.ModuleColumnId+"' eId='"+element.ElementId+"'>";
							$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.Value)+"</div></td>";
						$currentRow.find('.insertElementsBefore').before($elementCode);
																				
						lastRowPosition = element.RowNo;
					});

					$('.rowColorPicker').each(function(element){
						initializeColorPicker(this);
					});
					alignAllElements();
					resizeHeadlineFontSize();
					//If the row is no input row, deactivate the action button
					$('#items-list .template-row').not(':has(.checkButton)').find('.btnAddAction').prop('disabled', true);
					$('#items-list .template-row').has('.checkButton').find('.btnAddAction').each(function(){
						initializeActionButton(this);
					});
					
					//Initialize a row copy function for every row by triple clicking
					$('#items-list .template-row').each(function(){
						initializeTripleClickCopy($(this));
					});
					
					//Initialize picture modal
					intializePictureModal();
					//Initialize drag and drop
					initializeDragAndDrop();
					
				});	
			}				
			}).fail(function(){
				showBootstrapInfoDialog("Error", "Can't get Template from DB!", 'danger');
			});	
		} else {
			var dt = new Date().toLocaleDateString('en-US');
			$('.currentDateStamp').text(dt);
			$(".templateCreatorUsername").text(sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+  sessionStorage.getItem('qtbNumber')+')');
			//Initialize picture modal
			intializePictureModal();
			//Initialize drag and drop
			initializeDragAndDrop();
		}
	}); 
		
	
	//*************************************
	// Delete Button for each Module in DB
	//************************************		
	$(document).on("click",".btnDeleteModule",function(e) {
		deleteTemplateRow($(this));
    });
	
	//*************************************
	// Save Button
	//*************************************
	$('.saveAll').on('click', function() {	
		saveWholeTemplate();
	});
	
	//*************************************
	// Duplicate Button
	//*************************************
	$('.duplicateTemplate').on('click', function() {	
		duplicateTemplate();
	});
	
	
	//*************************************
	// Add New Module Menu 
	//************************************				
	$("body").on('click', '.addNewModule', function(){
		templateIsLocked(function isLocked(locked){	
			if(locked){
				showBootstrapInfoDialog("Invalid operation", "This template is locked. There are worksheets based on this template!", "warning");
			} else {
				$('.bs-modul-dialog').modal('toggle');		 		 		 	
				$.ajax({
					type: "POST",
					url: 'db/db_getAllModules.php',
					dataType:'json',
					success: function(data){
						var lastModuleId = null;
						var appendCode = null;
						$.each(data, function(index, element) {		
							//Any new module
							if (element.ModuleId != lastModuleId){							
								if(index == 0){
									//Very first module
									appendCode = "<li class='ui-sortable-handle template-row'><form><table><tbody><tr>";				
								}
								else{
									//between two elements close,open
									var addButtonCode = "<td class='moduleElement'><button type='button' moduleID='"+lastModuleId+"' class='btn btn-success btnAddModule'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></td>";
									appendCode += addButtonCode+"</tr></tbody></table></form></li><li class='ui-sortable-handle template-row'><form><table><tbody><tr>";				
								}							
							}
							
							//Add content
							appendCode +=" <td class='moduleElement' style='width:"+element.Size+"%'><div mcId='"+element.Id+"' moduleId='"+element.ModuleId+"'>"+element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue);+"</div></td>";
							
							//Last module
							if(data.length-1 == index){
								//Last Element just close
								var addButtonCode = "<td class='moduleElement'><button type='button' moduleID='"+lastModuleId+"' class='btn btn-success btnAddModule'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></td>";
								$(".modal-body ul").empty().append(appendCode+addButtonCode+"</tr></tbody></table></form></li>");
							}							
							lastModuleId = element.ModuleId;
						});
						
						//Make the div editable
						$('div.editableText').attr('contenteditable','true');
						$('div.editableText').addClass('editable');
						
					}				
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
				}).done(function() {
					alignAllElements();
				});     		
				//has something to do with picture picking
				$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
				$(".modal-body #hiddenrowpos").text($(this).closest(".template-row").attr('rowposition'));	
			}
		});

    });
	
	

	
	

	//Disabled for Images in the Modal Body (PopUp Window)
	$(".modal-body").on('click', '.editableImg', function(){
		return false;
	});	
	
	//*************************************
	// Add Button for each Module in the Menu
	//************************************		
	$(document).on("click", ".btnAddModule", function(e) {
		addSelectedModule($(this).attr('moduleID'));
    });	
	
	
	//*************************************
	// Delete Button for each Module not in DB
	//************************************
	$(document).on("click", ".btnDeleteModuleOnlyAdded", function(e) {		
		$(this).parents(".template-row").remove();
		$('.template-row').each(function(index){
			$(this).attr('rowposition', index+1);
			if(index+1 < 10){
				$(this).find('.rownumberbadge').html('  '+(index+1)+')');
			} else {
				$(this).find('.rownumberbadge').html((index+1)+')');
			}
		});
	});
	
	
	//*************************************
	// Activate tooltips
	//************************************	
	$(function () {
		$("body").tooltip('fixTitle').tooltip({ selector: '[data-toggle=tooltip]'});
	}); 
	
	
	//*****************************************
	// Automatically resize Headline font-size
	//*****************************************
	$(document).on("keyup", "#templateHeadlineName", function(){
		resizeHeadlineFontSize();	
	});
	
	//Initialize print button
	initializePrintButton();

	
	//*****************************************
	// Show some help
	//*****************************************
	$('.showHelp').click(function(){
		var $helpMessage = "Needing some help? Read this to improve your working speed and discover new functions:"
		$helpMessage += "<ul style='padding-left: 30px; margin-top:10px;'>"
		$helpMessage += "<li style='background:none;'><b>Triple</b>-Clicking <b>copies rows</b>. That saves time and makes the work-flow smoother!</li>";
		$helpMessage += "<li style='background:none;'><b>Duplicate worksheets:</b> If you ever need a new worksheet that is similar to one already existing, try out the duplicate button. You can also, if you want, duplicate all the current actions. Just follow the instructions on the dialogue and finally hit the save all button.</li>";
		$helpMessage += "<li style='background:none;'>Make use of the <b>action button</b> to prevent mistakes in worksheets. How to do that? Just click on it and follow the instructions. Everything else is self-explaining!</li>";
		$helpMessage += "<li style='background:none;'>Did you know? If you want to apply the <b>same color</b> to several rows copy the #-value representing the row's color and insert it in another one!</li>";
		$helpMessage += "<li style='background:none;'>The <b>rows are not in the order</b> you want them? Don't worry: Just drag a single row and drop it where ever you want! If any alert message occurs, read through the message and follow the instructions!</li>";
		$helpMessage += "<li style='background:none;'>You want to <b>add a photo</b>? Just add a module containing a picture element. Then just click on the picture and select one in the opened dialogue. If you want to add new photos, just click somewhere in the white area of the dialogue OR directly drag and drop them from your windows explorer!</li>";
		$helpMessage += "</ul>"
		showBootstrapInfoDialog("Help window", $helpMessage, "info");
	});
	
	
}));	



//*************************************
// PopUp for Image
//*************************************
function intializePictureModal(){
	templateIsLocked(function isLocked(locked){	
		if(!locked){
			$("body").on('click', '.editableImg', function(){
				$('.bs-example-modal-lg').modal('toggle');
				$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
				$(".modal-body #hiddenrowpos").text($(this).closest("#items-list .template-row").attr('rowposition'));	
			});
		}
	});
}

//*************************************
// Drag & Drop for List
//*************************************
function initializeDragAndDrop(){

	templateIsLocked(function isLocked(locked){	
		if(!locked){
			$("#items-list").sortable({
				cancel: ':input,button,[contenteditable],.sp-replacer', 
				opacity: 0.8, 
				cursor: 'move', 
				update: function(event, ui) {
					//check if the movement was okay or if any actions were based on that
					rowIsAllowedToMove(ui.item, function(result){
						if(result){
							//Refresh row numbers
							$('#items-list .template-row').each(function (index) {
								$(this).attr('rowposition', index+1);
								if(index+1 < 10){
									$(this).find(".rownumberbadge").html('  '+(index+1)+')');
								} else{
									$(this).find(".rownumberbadge").html((index+1)+')');
								}
							});
						} else {
							//Cancel this operation
							$('#items-list').sortable("cancel");
						}
						
					});
				}
			});			
			
		} else {
			$("#items-list").sortable({
				cancel: ':input,button,[contenteditable],.sp-replacer', 
				opacity: 0.8, 
				cursor: 'move', 
				beforeStop: function() {					
					showBootstrapInfoDialog("Invalid operation", "Can't change row order. There are worksheets based on this template and it's therefore locked!", "warning");
					$(this).sortable('cancel');
				}								  	
			});	
		
		}
	});

}




//*****************************************
// Resize headline font-size
//*****************************************
function resizeHeadlineFontSize() {

	var maxFontPixels = 40;
	var minFontPixels = 20;
    var textWidth;
	var maxWidth = $('#templateHeadlineContainer').width() - 100;
	var fontType = 'Open Sans';
	var headline = document.getElementById('templateHeadlineName');
	var currentFontSize = parseFloat(window.getComputedStyle(headline, null).getPropertyValue('font-size'));
	var currentFontWidth = getTextWidth(headline, fontType);
	
	if(currentFontWidth > maxWidth) {
		do {		
			headline.style.fontSize = currentFontSize + 'px';
			textWidth = getTextWidth(headline, fontType);
			currentFontSize = currentFontSize - 1;
		} while (textWidth > maxWidth && currentFontSize >= minFontPixels);
	} else {
		do {		
			headline.style.fontSize = currentFontSize + 'px';
			textWidth = getTextWidth(headline, fontType);
			currentFontSize = currentFontSize + 1;
		} while (textWidth < maxWidth && currentFontSize <= maxFontPixels);
	}
}

//*****************************************
// Calculate the text width
//*****************************************
function getTextWidth(text, fontType) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
	var style = window.getComputedStyle(text, null).getPropertyValue('font-size');
	var fontSize = parseFloat(style); 
    context.font =  fontSize+'px '+fontType;
    var metrics = context.measureText(text.value);
    return metrics.width;
};


//*****************************************
// Save the current template
//*****************************************
function saveWholeTemplate(){
	//information for table template	
	var $tmpAuthor = sessionStorage.getItem('qtbNumber');		
	var $tmpHeadlineName = $('input#templateHeadlineName').val();
	var $tmpNo = $('#templateNo').val();
	var $tmpVersionNo = $('#templateVersion').val();
	var $tmpStatus = $('#templateStatus').val();
	var $tmpValidFor = $('#templateValidFor').val();
	var $tmpCategoryId = $('#templateCategory option:selected').val();	
	var $error = 0;
	var $isANewTemplate = false;
		
	$('input#templateHeadlineName').parents(".input-group").removeClass('has-error');
	$('input#templateNo').parents(".input-group").removeClass('has-error');
	$('input#templateVersion').parents(".input-group").removeClass('has-error');
	$('input#templateStatus').parents(".input-group").removeClass('has-error');
	$('input#templateValidFor').parents(".input-group").removeClass('has-error');
	$('#templateCategory').parents(".input-group").removeClass('has-error');

	if(!checkVersionNo($tmpVersionNo, $tmpHeadlineName)){
		$error++;
		$('input#templateVersion').parents(".input-group").addClass('has-error');
	} else {
		$('#templateVersion').tooltip('fixTitle').tooltip('hide');
	}	
	if ($tmpHeadlineName == '') {
		$error++;
		$('input#templateHeadlineName').parents(".input-group").addClass('has-error');
	}
	if ($tmpNo == '') {
		$error++;
		$('input#templateNo').parents(".input-group").addClass('has-error');
	}
	if ($tmpStatus == '') {
		$error++;
		$('input#templateStatus').parents(".input-group").addClass('has-error');
	}
	if ($tmpValidFor == '') {
		$error++;
		$('input#templateValidFor').parents(".input-group").addClass('has-error');
	}
	if ($tmpCategoryId == '-1') {
		$error++;
		$('#templateCategory').parents(".input-group").addClass('has-error');
	}
	
	if($error === 0){
		//If the template should be duplicated de-prepare the affected elements
		//prepareTemplateForDuplication(false, false);
		
		//Collect all Elements from the modules
		var dataArray = $('div.singleElement').map(function(){
			
			//Information for table template_row_content
			var $mcId = $(this).attr("mcId");
			var $contentText = '';
			if($(this).children(".editableText").exists()){
				$contentText = $.trim($(this).children("div").text()).replace(/(\r\n|\n|\r)/gm," ");
			} else if($(this).children('.editableImg').exists()){
				$contentText = $(this).children('.editableImg').attr('src');
			}
			
			//Information for table template_row
			var $modId = $(this).parents(".template-row").attr("mid");
			var $trId = $(this).parents(".template-row").attr("id");
			var $tmpId = $('#hiddenTemplateId').text();		
			var $colorCode = $(this).parents(".template-row").attr('colorid');
			var $rowPos = $(this).parents(".template-row").attr('rowposition');	
			

			if(isEmpty($tmpId)){
				$tmpId = null;
				$isANewTemplate = true;
				$trId = 'undefined';
			}
			//if(typeof $modId == 'undefined'){$modId = 'undefined';}
			if(typeof $colorCode == 'undefined'){$colorCode = 'undefined';}
			if(typeof $trId == 'undefined'){$trId = 'undefined';}
		
			return {contentText: $contentText, moduleColumnId: $mcId, moduleId: $modId, templateRowId: $trId, templateId: $tmpId, colorCode: $colorCode, rowPos: $rowPos, templateName: $tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNo: $tmpVersionNo, templateStatus: $tmpStatus, templateValidFor: $tmpValidFor, templateCategoryId: $tmpCategoryId};				
			
		}).get();	
		
		$.each(dataArray, function(){
			console.log(JSON.stringify(this));
		});
		
		// D A T A B A S E		
		// CONTENT DB
		// Update the Value for each Element
		if (!jQuery.isEmptyObject(dataArray)){
			return $.ajax({
				type: "POST",
				url: 'db/db_saveTemplate.php',
				data: {data: dataArray},
				dataType:'json'
			}).fail(function(data){
				showBootstrapInfoDialog("Error", "Can't save Template in DB!:\n" + JSON.stringify(data), 'danger');
			}).done(function(data){
				$('#hiddenTemplateId').text(data['NewTemplateId']);
				$('.currentDateStamp').text(data['NewTemplateCreationDate']);	
				//The timeout is needed. Otherwise the DB doesn't return all entries correctly and the page isn't loaded correctly
				if($isANewTemplate){
					window.history.pushState('WMS', 'Worksheet Management System', "index.html?site=showTemplate&templateid="+$('#hiddenTemplateId').text());
				}
				
				//Assign the Ids of newly added rows that where saved for the first time to the rows
				$.each(data['noAndIdArray'], function(index, element){
					//console.log('RowNo: ' + element.rowPos + ' - RowId: ' + element.templateRowId);
					$("#items-list .template-row[rowposition='"+element.rowPos+"']").attr('id', element.templateRowId);
				});
				
				//console.log('Whole template saved. Begin re-init of action buttons');
				//Reinitialize the action Buttons
				$('#items-list .template-row .btnAddAction:enabled').each(function(){
					initializeActionButton(this);
				});
				
				//Initialize the delete buttons of those rows just saved
				$('#items-list .template-row .btnDeleteModuleOnlyAdded').addClass('btnDeleteModule').removeClass('btnDeleteModuleOnlyAdded');
		
			});
		} else {
			showBootstrapInfoDialog("Empty template", "There is nothing to save. Please add at least one module.", 'info');
		}
		
	}
	return null;
}





//*************************************
// Add selected module
//************************************		
function addSelectedModule(selectedModuleId) {
	if (selectedModuleId != null) {
		$.ajax({
			type: "POST",
			url: 'db/db_selectModule.php',
			data: {data:selectedModuleId},
			dataType:'json',
			success: function(data){
			
				//Get the empty row as an template
				$.get("templateRow.html", function(blancTemplateRow){
					//Insert the new row into the items-list and select it
					$("#items-list").append($($.parseHTML(blancTemplateRow)));
					var $currentRow = $("#items-list").children(':last');	
					//Add the module id and change the delete button's class
					$currentRow.attr({'mId': data[0].ModuleId});
					$currentRow.find('.btnDeleteModule').addClass('btnDeleteModuleOnlyAdded').removeClass('btnDeleteModule');
									
					$.each(data, function(index, element) {	
						//It's easiest to create every element as an string and append it rather than pre-defining it as html
						var $elementCode  = "<td class='moduleElement' style='width:"+element.Size*87.5/100+"%'>";
							$elementCode += "<div class='singleElement' mcId='"+element.Id+"' eId='"+element.eId+"'>";
							$elementCode += element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue)+"</div></td>";
						$currentRow.find('.insertElementsBefore').before($elementCode);
					});

					//Initialize colorpicker, and align elements
					initializeColorPicker($currentRow.find('.rowColorPicker'));	
					alignAllElements();
					
					//Set the row number
					var $rowPosition = ($currentRow.prev('.template-row').exists() ? parseInt($currentRow.prev('.template-row').attr('rowposition'))+1 : 1);
					$currentRow.attr('rowposition', $rowPosition);
					if($rowPosition < 10){
						$currentRow.find('.rownumberbadge').html('  '+$rowPosition+')');
					} else {
						$currentRow.find('.rownumberbadge').html($rowPosition+')');
					}
					
					//If the row is no input row, deactivate the action button
					$currentRow.not(':has(.checkButton)').find('.btnAddAction').prop('disabled', true);
					
					//console.log('Added new module: Row '+$currentRow.attr('rowposition')+')');
					//Re initialize the action buttons
					$('#items-list .template-row .btnAddAction:enabled').each(function(){
						initializeActionButton(this);
					});
					
					//Initialize the copy function
					initializeTripleClickCopy($currentRow);
				
				});		
			}				
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
		});                      					
	}		
}



//*************************************
// Check if version Number is valid
//************************************	
function checkVersionNo(versionNo, templateName) {
	//1. Check if regular expression pattern is valid
	var versionNoOk = true;
	var createNewTemplate = false;
	var regPattern = /^[0-9]*\.[0-9]+$/g;		//number followed by a number, no characters, with a dot in between
	if(!regPattern.test(versionNo)){
		$('#templateVersion').attr('title', 'VersionNo must be number.number').tooltip('fixTitle').tooltip('show');
		versionNoOk =  false;					//The pattern was not valid
	}
	
	
	if(versionNoOk) {
		//2. Check if there is any higher versionNo than those selected in the template
		var splitVersionNumber = versionNo.split(".");
		var versionHighNumber = Number(splitVersionNumber[0]);
		var versionLowNumber = Number(splitVersionNumber[1]);
		$.ajax({
			type: "POST",
			url: 'db/db_getAllTemplates.php',	
			dataType:'json',
			async: false,						//Must be sync, otherwise this function(checkVersionNo) returns a wrong value!
			success: function(data){			
			
				var  currentHighestVersion = getHighestTemplateVersionWithName(data, templateName);
					
				//Now the new versionNumber is compared to the highest versionNumber found above
				if(currentHighestVersion.dataIndex === null){
					//No template was found with this name. Everything is alright
					createNewTemplate = true;
				} else if(currentHighestVersion.versionHighNumber > versionHighNumber) {
					//There is a template with a higher versionHighNumber
					$('#templateVersion').attr('title', "New VersionHighNo can't be lower than existing one").tooltip('fixTitle').tooltip('show');
					versionNoOk = false;
				} else if(currentHighestVersion.versionHighNumber === versionHighNumber){
					if(currentHighestVersion.versionLowNumber > versionLowNumber){
						//There is  a template with the same versionHighNumber and a higher versionLowNumber
						$('#templateVersion').attr('title', "New VersionLowNo can't be lower than existing one").tooltip('fixTitle').tooltip('show');
						versionNoOk = false;
					} else if(currentHighestVersion.versionLowNumber === versionLowNumber){
						//There is a template with the same versionHighNumber and versionLowNumber
						if(versionLowNumber === 0 && data[currentHighestVersion.dataIndex].CanBeChanged == 0) {
							//If the version number is xxx.0 it's an officially approved version. Changes or overwriting can only be made if there are no worksheets based on this template.	
							$('#templateVersion').attr('title', "Template can't be changed as it's an approved version that was already used for worksheets!").tooltip('fixTitle').tooltip('show');
							versionNoOk = false;	
						}
					} else {
						createNewTemplate = true;
					}
				} else {
					createNewTemplate = true;
				}
			}	
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
			versionNoOk = false;
		});   
	}	
	
	if(createNewTemplate) {
		$('#hiddenTemplateId').text("");
	}

	return versionNoOk;
}


//*************************************
// Initialize the color picker
//*************************************
function initializeColorPicker(row) {
	//initialize colorpicker
	var elementColor = $(row).parents('.template-row').attr('colorid');
	
	if(elementColor === '' || elementColor == null) {
		elementColor = '#FFFFFF';
	}
	var contrastColor = jQuery.Color(elementColor).contrastColor();
	var contrastColor2 = (contrastColor == 'white' ? 'black' : 'white');
	
	templateIsLocked(function isLocked(locked){	
		if(locked){
			$(row).spectrum({
				color: elementColor,
				beforeShow: function(color){showBootstrapInfoDialog("Invalid operation", "Can't change this row color. There are worksheets based on this template!", "warning"); return false;},
				allowEmpty: true,
				preferredFormat: "hex",
				showInput: true,
				showButtons: false,
				containerClassName: 'colorPicker'
			});
		} else {
			$(row).spectrum({
				color: elementColor,
				move: function(color) {changeRowColor(this, color);},
				change: function(color) {changeRowColor(this, color);},
				show: function(color) {changeRowColor(this, color);},
				allowEmpty: true,
				preferredFormat: "hex",
				showInput: true,
				showButtons: false,
				containerClassName: 'colorPicker'
			});
		}
		
		//set glyphicon and (if set in DB) background color of the row and its elements
		$(row).siblings("div").find(".sp-preview-inner").html("<span class='glyphicon glyphicon-tint' aria-hidden='true' style='color: #fff;'></span>");	
		$(row).parents('.template-row').css("background-color", elementColor);
		$(row).siblings("div").find(".sp-preview").css('border-color', contrastColor2);
		$(row).siblings("div").find(".sp-preview-inner").css('background-color', contrastColor);
		$(row).siblings("div").find(".glyphicon").css('color', contrastColor2);	
		$(row).parents('tr').find('.rownumberbadge').css({'background-color': contrastColor, 'color': contrastColor2});
		$(row).parents('tr').find('.btnDeleteModule, .btnDeleteModuleOnlyAdded, .checkButton, .btnAddAction').css({'background-color': contrastColor, 'color': contrastColor2});
		$(row).parents('tr').find('.buttonContainer').css({'border-color': contrastColor2});
	}); 
}


//*************************************
// Change row and element colors
//*************************************
function changeRowColor(rowElement, color) {
	//Change row color, add color as attribute and also change the color of the button and glyphicon
	var contrastColor = jQuery.Color(color.toHexString()).contrastColor();
	var contrastColor2 = (contrastColor == 'white' ? 'black' : 'white');
	$(rowElement).closest(".template-row").attr('colorid', color.toHexString());									//set attribute
	$(rowElement).closest(".template-row").css( "background-color", color.toHexString());							//set row's background color
	$(rowElement).siblings("div").find(".sp-preview").css({'border-color': contrastColor2});			//set border color of colorpicker
	$(rowElement).siblings("div").find(".sp-preview-inner").css({'background-color': contrastColor});	//set background color of colorpicker
	$(rowElement).siblings("div").find(".glyphicon").css('color', contrastColor2);						//set icon color of colorpicker
	$(rowElement).parents('tr').find('.rownumberbadge').css({'background-color': contrastColor, 'color': contrastColor2});	//set color of rownumberbadge
	$(rowElement).parents('tr').find('.btnDeleteModule, .btnDeleteModuleOnlyAdded, .checkButton, .btnAddAction').css({'background-color': contrastColor, 'color': contrastColor2});	//set delete button colors
	$(rowElement).parents('tr').find('.buttonContainer').css({'border-color': contrastColor2});
}



//*************************************
// Invert a RGB color
// (not used but maybe useful)
//*************************************
function invertHexColor(hexnum){
	if(hexnum.length != 7) {
		return false;
	}

	hexnum = hexnum.replace('#', '').toUpperCase();
	//return blue background if no color (white) is chosen
	if(hexnum === 'FFFFFF') {
		return '#337ab7';
	}

	var splitnum = hexnum.split("");
	var resultnum = "";
	var simplenum = "FEDCBA9876".split("");
	var complexnum = new Array();
	complexnum.A = "5";
	complexnum.B = "4";
	complexnum.C = "3";
	complexnum.D = "2";
	complexnum.E = "1";
	complexnum.F = "0";

	for(i=0; i<6; i++){
		if(!isNaN(splitnum[i])) {
		  resultnum += simplenum[splitnum[i]]; 
		} else if(complexnum[splitnum[i]]){
		  resultnum += complexnum[splitnum[i]]; 
		} else {
		  return false;
		}
	}

	return '#' + resultnum;
} 



//*************************************
// Initialize print button
//*************************************
function initializePrintButton(){
	//Configurate popover content
	var $printConfigurationContent = "<div id='printPopover'>Do you want to configure additional print options?<form><div style='margin-top: 5px;'>";
	$printConfigurationContent += "<label class='radio-inline'><input type='radio' class='printOptionSelection' name='printOptionSelection' value='yes'>Yes</input></label>";
	$printConfigurationContent += "<label class='radio-inline'><input type='radio' class='printOptionSelection' name='printOptionSelection' checked='checked' value='no'>No</input></label></div>";
 	$printConfigurationContent += "<div id='printOptions' style='display: none;'>";
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
					printRowColors: 	$optionCheckboxes.find('input[value="printRowColors"]').prop('checked'),
					printPageNumbers: 	$optionCheckboxes.find('input[value="printPageNumbers"]').prop('checked'),
					printDateAndTime: 	$optionCheckboxes.find('input[value="printDateAndTime"]').prop('checked')
				};	
				$wshell = new ActiveXObject("WScript.Shell");	
			}
			$('.printAll').popover('hide');
			printTemplate($printOptions, $wshell);
		});
	});
}


//*************************************
// Print the current template
//*************************************
function printTemplate(printOptions, wshell){	
	//Open a new window and clone the html object of the currently open template
	var mywindow = window.open('', 'Print window', "height=900,width=1280,scrollbars=yes,resizable=yes,status=yes,top=0");	
	var myDoc = mywindow.document;
	var printContentObject = $('html').clone();	

	//Remove all scripts as otherwise every row is added a second time 
	$(printContentObject).find('script').each(function(){
		$(this).remove();
	});
	//Remove all delete, check, action and color buttons
	$(printContentObject).find('#items-list li').each(function(){
		$(this).find('.btnDeleteModule, .btnDeleteModuleOnlyAdded, .btnAddAction, .checkButton').parents('td').remove();
		$(this).find('.rowColorPicker').parent('td').remove();
	});
	//Remove the buttons above the template header
	$(printContentObject).find('#list').children('p').remove();
	//Remove anything from the body except html we need for printing
	$(printContentObject).find('body').children(':not(.container)').remove();
	
	//Add a little space above the template headline name
 	$(printContentObject).find('#list').children().first().before('<div id="informationField"></div>');
	
	//Build the template header again as the style is weird after printing
	var $headlineContainer = $(printContentObject).find('.templateHeader');
	$headlineContainer.children('div').remove();
	var $headerInformation = {
		name: 		($(document).find("#templateHeadlineName").val() === '' ? 'Name' : $(document).find("#templateHeadlineName").val()),
		no: 		($(document).find("#templateNo").val() === '' ? 'No' : $(document).find("#templateNo").val()),
		version: 	($(document).find("#templateVersion").val() === '' ? 'Version' : $(document).find("#templateVersion").val()),
		status: 	($(document).find("#templateStatus").val() === '' ? 'Status' : $(document).find("#templateStatus").val()),
		validFor: 	($(document).find("#templateValidFor").val() === '' ? 'ValidFor' : $(document).find("#templateValidFor").val()),
		category: 	($(document).find("#templateCategory option:selected").text() === '--Select--' ? 'Category' : $(document).find("#templateCategory option:selected").text())
	}; 
 	var $containerContent = "<div style='clear:right;padding:10px 10px 10px 10px;margin-bottom:20px;border:1px solid black;background-color:#f2f8ff !important;'>";
	$containerContent += "<h4><div style='float:left;'><b>Name:</b></div><div style='padding-left:180px;'>"+$headerInformation.name+"</div></h4>";
	$containerContent += "<h5><div style='float:left;'><b>No.:</b></div><div style='padding-left:180px;'>"+$headerInformation.no+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Version:</b></div><div style='padding-left:180px;'>"+$headerInformation.version+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Status:</b></div><div style='padding-left:180px;'>"+$headerInformation.status+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Valid for:</b></div><div style='padding-left:180px;'>"+$headerInformation.validFor+"</div></h5>";
	$containerContent += "<h5><div style='float:left;'><b>Category:</b></div><div style='padding-left:180px;'>"+$headerInformation.category+"</div></h5>";
	$containerContent += "</div>";
	$headlineContainer.html($containerContent); 
	
	//Add some information to the printout view
	$(printContentObject).find('.maincontainer footer p:last').after("<p>"+$(printContentObject).find('#standardFooter').html()+"</p>");
	$(printContentObject).find('#standardFooter').remove();
	$(printContentObject).find('.maincontainer footer p:last').after("<span style='float: left;margin-top:10px;'><b>Printout of empty form for information only!</b></span>");
	$(printContentObject).find('footer hr').remove();
	$(printContentObject).find('.maincontainer footer').css('padding-top', '20px');;
	var informationHead = "<div style='padding:10px 0px 10px 10px;float:left'><h4><b>BMW</b> - Emission Lab Oxnard</h4><h5>Template Worksheet printout</h5><h5><b>Empty form for information only!</b><h5>";
	informationHead += "<h6><b>Print Date:</b> "+$.datepicker.formatDate('mm/dd/yy', new Date())+"</h6>";
	informationHead += "</div><div style='text-align:right;padding:10px 10px 10px 0px;float:right'><img src='uploads/bmw_logo.jpg' alt='BMW Logo' style='width:106px;height:119px;'></div>";
	$(printContentObject).find('#informationField').html(informationHead);

	//Adjust the line heights as they get bigger at some point and set a border around every row
	$(printContentObject).find('#container #list ul li').each(function(index, element){
		if(!$(element).find('.editableImg').exists()){
			$(element).find('form').css({'margin-bottom': '0px', 'height': '38px', 'padding-top': '4px'});
		} else {
			$(element).find('form').css({'margin-bottom': '0px'});
		}
	});

	
	$(printContentObject).find('.template-row').css({'border': '1px solid black', 'padding-right': '8px'});
		
	//Now extract the html content of the remaining object
	myDoc.write('<html>');
	myDoc.write(printContentObject.html());
	myDoc.write('</html>');
	
	//Add some layout properties to the page
	$(myDoc).find('head').children(':last').after('<style type="text/css" media="print">@page{size: auto letter portrait; margin: 15mm 15mm 15mm 15mm;}	 body{background-color:#FFFFFF; border: solid 1px black; margin: 0px; padding-bottom:15px;} li, footer{page-break-inside: avoid;} img{max-width: 70mm !important; max-height: 100mm !important;}</style>');
	//Set all row background-colors to important, otherwise they are not printed
	$(myDoc).find('#items-list li').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
	}); 
	
	//For all text boxes
	$(myDoc).find('.template-row .editableText, .form-control').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
		$(this).css('font-size', '12px');
	}); 
	//For all rownumberbadges
	$(myDoc).find('#items-list li .rownumberbadge').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
		$color = $(this).css('color');
		$(this).style('color', $color, 'important');
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



//*************************************
// Function to hex value out of a rgb value
//*************************************
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


//*************************************
// Check if the template is locked:
// If there are worksheets based on 
// this template, it's locked!
//************************************
function templateIsLocked(callback){
	//Check if changes in this template are applicable
	var $tmpid = $('#hiddenTemplateId').html();
	return $.ajax({
			type: "POST",
			url: 'db/db_getAllWorksheetsHavingTemplateId.php',
			data: {data: $tmpid},		
			dataType:'json',					
			success: function(data){
				//Check if there are worksheets that are based on this template
				if(!jQuery.isEmptyObject(data)) {
					callback(true);
				} else {
					callback(false);
				}
			}	
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Worksheets from DB!", 'danger');
			callback(true);
		});
}


//*************************************
// Check if the template is locked:
// If there are worksheets based on 
// this template, it's locked!
//************************************
function deleteTemplateRow($button){
	showBootstrapConfirmDialog('Confirm to delete row', "Are you sure you want to perform this action? This action can't be revoked!", 'warning', function(result) {
		if(result){
			templateIsLocked(function isLocked(locked){	
				if(locked){
					showBootstrapInfoDialog("Invalid operation", "Can't delete this template row. There are worksheets based on this template!", "warning");
				} else {
					//check if there's an action or action result based on this row
					$.ajax({
						type: "POST",
						url: 'db/db_getAllActionsAndResultsHavingRowId.php',
						data: {actionResultRowId: $button.parents('.template-row').attr('id')},		
						dataType:'json'
					}).fail(function(){
						showBootstrapInfoDialog("Error", "Can't get actions and their results from DB!", 'danger');
					}).done(function(data){
						var $actionArray = $.parseJSON(data['actionArray']);
						var $actionResultRowArray = $.parseJSON(data['actionResultRowArray']);
						var $actionResultElementArray = $.parseJSON(data['actionResultElementArray']);
					
						//Check if actions are based on this row
						if($actionArray.length !== 0){
							var $errorMessage = "Can't delete this template row. There are the following actions based on this row:<br><b><ul style='margin-left:20px;'>";
							$.each($actionArray, function(index, element){
								$errorMessage += "<li>" + element.ActionName + "</li>";
							}); 
							$errorMessage += "</ul></b>";
							showBootstrapInfoDialog("Invalid operation", $errorMessage, "warning");
						//Check if an actions results this row
						} else if($actionResultRowArray.length !== 0){
							var $errorMessage = "Can't delete this template row. There are the following action results based on this row:<br><ul style='margin-left:20px;'>";
							$.each($actionResultRowArray, function(index, element){
								$errorMessage += "<li>ActionName = <b>" + element.ActionName + "</b>, in row <b>"+ $("#items-list .template-row[id='"+element.ActionOriginTemplateRowId+"']").attr('rowposition');
								$errorMessage += ")</b>: this action results in: <b>'"+ element.ActionResultRowValue +"'</b></li>";
							});
							$errorMessage += "</ul>";
							showBootstrapInfoDialog("Invalid operation", $errorMessage, "warning");
						//Check if an actions results elements in this row
						} else if($actionResultElementArray.length !== 0){
							var $errorMessage = "Can't delete this template row. There are the following action results based on elements in this row:<br><ul style='margin-left:20px;'>";
							$.each($actionResultElementArray, function(index, element){
								//$errorMessage += "<li>ActionName=" + element.ActionName + ": this action results in: '"+ element.ActionResult +"' in this row</li>";
								$errorMessage += "<li>ActionName = <b>" + element.ActionName + "</b>, in row <b>"+ $("#items-list .template-row[id='"+element.ActionOriginTemplateRowId+"']").attr('rowposition');
								$errorMessage += ")</b>: this action results in: <b>'"+ element.ActionResult +"'</b> in this row</li>";
							});
							$errorMessage += "</ul>";
							showBootstrapInfoDialog("Invalid operation", $errorMessage, "warning");
						//Otherwise delete this row
						} else{
							$.ajax({
								type: "POST",
								url: 'db/db_deleteTemplateRow.php',
								data: {templateRowId: $button.parents('.template-row').attr('id')}
							}).fail(function(){
								showBootstrapInfoDialog("Error", "Can't delete template row from DB!", 'danger');
							}).done(function(){
								$button.parents('.template-row').remove();
							});
						}
					});
					//END AJAX CALL
				}
			});
			//END TEMPLATE IS LOCKED
		}		
	});
	//END CONFIRM DIALOG

}


//*************************************
// Check if the the row is allowed to be
// moved due to actions. That means a row
// isn't allowed to move if:
// It's a row an action is based on and it's
// tried to be moved below an affected row
// OR
// It's a row affected by an action and it's
// tried to be moved above this action row
//************************************
function rowIsAllowedToMove($movedRow, callbackFunction){
	//The template was already saved and has an template row id
	if(typeof $movedRow.attr('id') !== 'undefined'){
		$.ajax({
			type: "POST",
			url: 'db/db_getAllActionInformationHavingRowId.php',
			data: {templateRowId: $movedRow.attr('id')},		
			dataType:'json'
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get actions and their results from DB!", 'danger');
		}).done(function(data){	
			var $actionArray = $.parseJSON(data['actionArray']);
			var $actionResultRowArray = $.parseJSON(data['actionResultRowArray']);
			var $actionResultElementArray = $.parseJSON(data['actionResultElementArray']);
			var $affectedRowArray = $.parseJSON(data['affectedRowArray']);
			var $affectedElementArray = $.parseJSON(data['affectedElementArray']);
			var $rowCanBeMoved = true;
			//console.log($affectedRowArray.length + ' - ' + $affectedElementArray.length);
			//Check if actions are based on this row and therefore check if the row was moved below one of its result rows (=affected rows)
			if($actionArray.length !== 0){
				//If there is an action based on this item, it can't be moved below one of its result elements or rows
				var $rowIdsOfAffectedElementsOrRows = [];
				$.each($actionResultRowArray, function(index, element){
					$rowIdsOfAffectedElementsOrRows.push(element.ActionResultTemplateRowId);
				});
				$.each($actionResultElementArray, function(index, element){
					$rowIdsOfAffectedElementsOrRows.push(element.ActionResultTemplateRowId);
				});
				/* console.log('moved row id: '+$movedRow.attr('id'));
				console.log('affected elements found: ' +$rowIdsOfAffectedElementsOrRows.length);
				console.log('row array length: ' + $actionResultRowArray.length);
				console.log('element array length: ' + $actionResultElementArray.length);
				$.each($rowIdsOfAffectedElementsOrRows, function(){
					console.log('affected row ids: '+ this);
				}); */
				
				//Check if the row was moved to an illegal position (=below an affected row)
				var $firstAffectedRowNo = null;
				$('#items-list .template-row').each(function(index, element){
					//console.log('current checked row: '+$(this).attr('id'));
					//console.log('result inArray: '+$.inArray($(this).attr('id'), $rowIdsOfAffectedElementsOrRows));
					if($(this).is($movedRow)){
						return false;		//break each loop
					} else if($.inArray($(this).attr('id'), $rowIdsOfAffectedElementsOrRows) >= 0){
						$rowCanBeMoved = false;
						$firstAffectedRowNo = $(this).attr('rowposition');
						console.log('illegal movement');
						return false;		//break each loop
					}
				});
				
				if(!$rowCanBeMoved){
					var $errorMessage = "Can't move this template row. There are the following actions based on this row:<br><b><ul style='margin-left:20px;'>";
					$.each($actionArray, function(index, element){
						$errorMessage += "<li>" + element.ActionName + "</li>";
					}); 
					$errorMessage += "</ul></b><br>This/these action/s affect/s<b><ul style='margin-left:20px;'>";
					$.each($actionResultElementArray, function(index, element){
						$errorMessage += "<li>Row " + $("#items-list .template-row[id='"+element.ActionResultTemplateRowId+"']").attr('rowposition') +"), '"+element.ActionResult+"'</li>";	
					});		
					$.each($actionResultRowArray, function(index, element){
						$errorMessage += "<li>Row " + $("#items-list .template-row[id='"+element.ActionResultTemplateRowId+"']").attr('rowposition') +"), '"+element.ActionResultRowValue+"'</li>";	
					});				
					
					$errorMessage += "</ul></b><br>Triggering rows have to stay above affected rows!";	
						
					showBootstrapInfoDialog("Invalid operation", $errorMessage, "warning"); 
					callbackFunction(false);
				} else if (callbackFunction !== null){
					callbackFunction(true);
				}
			} 
			//Check if this row is affected by an action and therefore check if it's moved above that action row
			if($rowCanBeMoved && ($affectedRowArray.length !== 0 || $affectedElementArray.length !== 0)){
				var $rowIdsOfActions = [];
				$.each($affectedRowArray, function(index, element){
					$rowIdsOfActions.push(element.ActionOriginTemplateRowId);
				});
				$.each($affectedElementArray, function(index, element){
					$rowIdsOfActions.push(element.ActionOriginTemplateRowId);
				});
						
				
				//Check if the row was moved to an illegal position (=above an action triggering row)
				var $actionRowNo = null;
				console.log('moved row: '+$movedRow.attr('id'));
				$('#items-list .template-row').each(function(index, element){
					//If all actions affecting this row were already found, break
					if($rowIdsOfActions.length === 0){
						console.log('if 3');
						return false;		//break each loop
					//If the checked row was found before all actions were found affecting the checked row, the checked row can't be moved
					} else if($(this).is($movedRow)){
						console.log('if 2: '+$(this).attr('id'));
						$rowCanBeMoved = false;
						$actionRowNo = $(this).attr('rowposition');
						console.log('illegal movement');
						return false;		//break each loop
					//If a row with an action was found affecting the checked row, remove it from the array
					} else if($.inArray($(this).attr('id'), $rowIdsOfActions) >= 0){
						//Remove the found action id from the array
						console.log('if 3: '+$(this).attr('id'));
						while($.inArray($(this).attr('id'), $rowIdsOfActions) >= 0){
							var $index = $rowIdsOfActions.indexOf($(this).attr('id'));
							$rowIdsOfActions.splice($index, 1);
						}
					}
					console.log('array length: '+$rowIdsOfActions.length);
				});
				
				if(!$rowCanBeMoved){
					var $errorMessage = "Can't move this template row. This row is affected by the following actions:<br><b><ul style='margin-left:20px;'>";
					$.each($affectedElementArray, function(index, element){
						$errorMessage += "<li>" + element.ActionName + ": <b>Row "+ $("#items-list .template-row[id='"+element.ActionOriginTemplateRowId+"']").attr('rowposition') +"), '"+element.ActionResult+"'</b></li>";
					}); 
					$.each($affectedRowArray, function(index, element){
						$errorMessage += "<li>" + element.ActionName + ": <b>Row "+ $("#items-list .template-row[id='"+element.ActionOriginTemplateRowId+"']").attr('rowposition') +"), '"+element.ActionResultRowValue+"'</b></li>";
					}); 
					$errorMessage += "</ul></b>";
					$errorMessage += "<br>Affected rows have to stay below triggering rows!";		
					showBootstrapInfoDialog("Invalid operation", $errorMessage, "warning"); 
					callbackFunction(false);
				} else if(callbackFunction !== null){
					callbackFunction(true);
				}			
		
			}
			//END IF
			if($rowCanBeMoved){
				callbackFunction(true);
			}
		});
		//END AJAX CALL
	} else if(callbackFunction !== null){
		callbackFunction(true);
	}
	return true;
}



//*************************************
// Duplicate this template
//************************************
function duplicateTemplate(){
	var $dialogueMesssage = "You are about to duplicate this template.<br><b>Note:</b><br>If you confirm this dialogue you need to do the following:<ul style='padding-left: 30px;'>";
	$dialogueMesssage += "<li style='background:none;'>Give this template a <b>new name</b></li>";
	$dialogueMesssage += "<li style='background:none;'>Give this template a <b>new number</b></li>";
	$dialogueMesssage += "<li style='background:none;'>You should give this template a <b>new verionNo</b> (recommended)</li>";
	$dialogueMesssage += "<li style='background:none;'>Save this template by clicking the <b>'Save All'</b>-Button</li>";
	$dialogueMesssage += "</ul><div style='margin-bottom: 12px; margin-top: 15px;'><input class='redGlow' type='checkbox' id='duplicateActionsCheckbox' style='margin:0 12px 0 8px;-ms-transform:scale(1.3);'></input>";
	$dialogueMesssage += "<span><b>Duplicate actions?</b></span></div>";
	$dialogueMesssage += "If you confirm this dialogue but finally <b>don't</b> want to duplicate this template, press the <b>F5</b> button.";
	
	var $dialog = showBootstrapConfirmDialog('Duplicate template', $dialogueMesssage, 'info', function(result) {
		$dialog.setData('result', result);
		$dialog.setData('duplicateActions', $dialog.getModalBody().find('#duplicateActionsCheckbox').prop('checked'));
	}); 
	
	//has to be done onHidden as otherwise the selectRange function called in prepareTemplateForDuplication() wouldn't work
	$dialog.onHidden(function(){
		if($dialog.getData('result')){
			prepareTemplateForDuplication(true, $dialog.getData('duplicateActions'));
		}	
	});
}


//*************************************
// Prepare template for duplication
//************************************
function prepareTemplateForDuplication($prepare, $duplicateActions){
	if($prepare){
		//Add a class for visual readability
		$('#templateVersion').addClass('redGlow');
		$('#templateNo').addClass('redGlow');
		$('#templateHeadlineName').addClass('redGlow').focus().selectRange(0, $('#templateHeadlineName').val().length);
		//Set cursor in the name field and mark the template name, deactivate the save all button until both (versionNo and template name) were changed
		var $oldTemplateName = $('#templateHeadlineName').val();
		var $oldTemplateNo = $('#templateNo').val();
		$('#templateNo').val('');
		$('.saveAll').prop('disabled', true);
		//Add a keyup listener
		$("#templateHeadlineName, #templateNo").on('keyup', function(){
			if($('#templateHeadlineName').val() !== $oldTemplateName && $('#templateNo').val() !== $oldTemplateNo){
				$('.saveAll').prop('disabled', false);
			} else {
				$('.saveAll').prop('disabled', true);
			}		
		});	

		
		//Now take care of the actions. Get every information about the actions from the old template id and save it in the result arrays
		if($duplicateActions){
			var $oldTemplateId = $('#hiddenTemplateId').html();
			var $actionResultRowArray = null;
			var $actionResultElementArray = null;
			//Get all information from DB
			$.ajax({
				type: "POST",
				url: 'db/db_getAllActionsHavingTemplateId.php',
				data: {templateId: $oldTemplateId},
				dataType:'json'
			}).done(function(data){
				$actionResultRowArray = $.parseJSON(data['actionResultRowArray']);
				$actionResultElementArray = $.parseJSON(data['actionResultElementArray']);				
			});
		}
		
		//Remove the hidden template id as well as every row's id so the save function saves this template as a new one
		$('#hiddenTemplateId').html('');
		$('.template-row').each(function(index, element){
			$(this).removeAttr('id');
		});
		
		//Re-initialize save button
		$('.saveAll').off('click').click(function(){
			var $saveTemplateAjax = saveWholeTemplate();
			//Also the actions have to be saved if the checkbox was checked
			if($saveTemplateAjax !== null && $duplicateActions){
				//Wait until the template was saved in the DB and every row got a new template row id
				$saveTemplateAjax.then(function(){
					//just for debug reasons
				/* 	$.each($actionResultRowArray, function(){
						console.log(JSON.stringify(this));
					});
					$.each($actionResultElementArray, function(){
						console.log(JSON.stringify(this));
					}); */
					//Combine both arrays by sorting everything first by name and then by order no
					var $sortedActionResultArray = [];
					var $totalAmountOfRowsToSave = $actionResultRowArray.length + $actionResultElementArray.length;
					var $lastActionName = null;
					var $indexRows = 0;
					var $indexElements = 0;

					for(i = 0; i < $totalAmountOfRowsToSave; i++){
						//console.log('i: ' + i + ', indexRow: ' + $indexRows + ', indexElements: ' + $indexElements);
						var $rowIndexValid = $indexRows < $actionResultRowArray.length ? true : false;
						var $elementIndexValid = $indexElements < $actionResultElementArray.length ? true : false;
						//Both arrays still have elements (entries left) that belong to the same action. Which one is chosen is distinguished by the order no
						if($rowIndexValid && $elementIndexValid && $actionResultElementArray[$indexElements].ActionName === $actionResultRowArray[$indexRows].ActionName){
							if($actionResultElementArray[$indexElements].OrderNo < $actionResultRowArray[$indexRows].OrderNo){
								$sortedActionResultArray.push($actionResultElementArray[$indexElements]);
								$lastActionName = $actionResultElementArray[$indexElements].ActionName;
								$indexElements++;
							} else {
								$sortedActionResultArray.push($actionResultRowArray[$indexRows]);
								$lastActionName = $actionResultRowArray[$indexRows].ActionName;
								$indexRows++;
							}
						//Either only row entries are left or the element array's index points to an entry of another (following) action
						} else if(!$elementIndexValid || $lastActionName !== $actionResultElementArray[$indexElements].ActionName){
							$sortedActionResultArray.push($actionResultRowArray[$indexRows]);
							$lastActionName = $actionResultRowArray[$indexRows].ActionName;
							$indexRows++;
						//Either only element entries are left or the row array's index points to an entry of another (following) action
						} else if(!rowIndexValid || $lastActionName !== $actionResultRowArray[$indexRows].ActionName){
							$sortedActionResultArray.push($actionResultElementArray[$indexElements]);
							$lastActionName = $actionResultElementArray[$indexElements].ActionName;
							$indexElements++;
						}
					}

					//Now that the whole array is sorted the new template row ids have to be re-assigned
					$.each($sortedActionResultArray, function(index, element){
						element.TriggerElementTemplateRowId = $(".template-row[rowposition='"+element.TriggerRowNo+"']").attr('id');
						element.ActionResultTemplateRowId = $(".template-row[rowposition='"+element.ActionResultRowNo+"']").attr('id');
					});
					
					//Now, as all information were gathered, the right objects have to be created for saving. The each-loop below iterates over every element.
					//When it finds a new action name, it enters the if-clause. There it first creates the trigger element for this action from the current element.
					//Then the while loop, beginning from the current index of the each-loop, iterates over every following element until either all elements are used
					//or a new action begins. Within the while-loop the if-clause decides if the current entry in $sortedActionResultArray belongs to an affected element
					//or row. Accordingly a new entry is created by the provided information from $sortedActionResultArray. After that the action is saved in the DB via
					//an ajax post. After that the objects for the next action (if existing) are created and so on .....
				
					var $lastActionName = null;
					$.each($sortedActionResultArray, function(index, element){
						if($lastActionName !== element.ActionName){
							
							//Collect all trigger information
							var $triggerElement = {
								trid: 				element.TriggerElementTemplateRowId,
								mcid: 				element.TriggerElementModuleColumnId,
								eid: 				$(".template-row[id='"+element.TriggerElementTemplateRowId+"']").find(".singleElement[mcid='"+element.TriggerElementModuleColumnId+"']").attr('eid'),
								triggerOperatorId: 	element.TriggerValueOperatorId,
								triggerValue:		element.TriggerValue
							};

							//Create the final arrays
							var $affectedRowsArray = [], $affectedElementsArray = [];
							var $count = index
							while($count < $sortedActionResultArray.length && $sortedActionResultArray[$count].ActionName === element.ActionName){
								//It's an affected element
								if($($sortedActionResultArray[$count]).hasAttr('ActionResult')){
									var $currentEntry = {
										trid: 					$sortedActionResultArray[$count].ActionResultTemplateRowId,
										mcid: 					$sortedActionResultArray[$count].ActionResultModuleColumnId,
										eid: 					$(".template-row[id='"+$sortedActionResultArray[$count].ActionResultTemplateRowId+"']").find(".singleElement[mcid='"+$sortedActionResultArray[$count].ActionResultModuleColumnId+"']").attr('eid'),
										actionResult: 			$sortedActionResultArray[$count].ActionResult,
										orderNo:				$sortedActionResultArray[$count].OrderNo,
										actionResultInputValue:	$sortedActionResultArray[$count].ActionResultInputValue
									};
									$affectedElementsArray.push($currentEntry);
									
								//It's an affected row
								} else {
									var $currentEntry = {
										trid:	 		$sortedActionResultArray[$count].ActionResultTemplateRowId,
										actionResult: 	$sortedActionResultArray[$count].ActionResultRowValue,
										orderNo:		$sortedActionResultArray[$count].OrderNo
									};	
									$affectedRowsArray.push($currentEntry);
								}						
								$count++;
							}
							
					
							//Save all actions in DB
							$.ajax({
								type: 		"POST",
								url: 		'db/db_saveAction.php',
								data: 		{
												actionName:				element.ActionName,
												actionCreatorQtb:		sessionStorage.getItem('qtbNumber'),
												actionId:				'undefined',
												triggerElement: 		$triggerElement,
												affectedRowsArray:		($affectedRowsArray.length === 0 ? 'undefined' : $affectedRowsArray),
												affectedElementsArray:	($affectedElementsArray.length === 0 ? 'undefined' : $affectedElementsArray)
											},
								dataType:	'json'
							}).fail(function(data){
								showBootstrapInfoDialog("Error", "Can't save Action in DB!:\n" + JSON.stringify(data), 'danger');
							});
							//END AJAX
						}
					
						$lastActionName = element.ActionName;
					});
					//END EACH
					
					 
					//Reinitialize the action buttons 
					$('#items-list .template-row').has('.checkButton').find('.btnAddAction').each(function(){
						initializeActionButton(this);
					});
					
				});
				//END THEN FUNCTION
			} else {
				//If the user don't want the actions to be duplicated, remove the class from the action buttons
				$('.actionButtonHasActions').removeClass('actionButtonHasActions');
			}
			//END IF
			
			//In both cases, de-prepare the document after everything was duplicated
			prepareTemplateForDuplication(false, false);
		});
		
	} else {
		$('#templateVersion').removeClass('redGlow');
		$('#templateHeadlineName').removeClass('redGlow').off('keyup');
		$('#templateNo').removeClass('redGlow').off('keyup');
		//Initialize the save all button as it was before
		$('.saveAll').prop('disabled', false).off('click').on('click', function() {	
			saveWholeTemplate();
		});
			
	}
}


//*************************************
// Prepare template for duplication
//************************************
function initializeTripleClickCopy($templateRow){
	$templateRow.bind('tripleclick', function(){
		templateIsLocked(function isLocked(locked){	
			if(!locked){
				//Copy this row and set it below this row
				var $newRow = $templateRow.clone();
				$newRow.removeAttr('id');
				$templateRow.after($newRow);
				var $startRowPosition = parseInt($templateRow.attr('rowposition')) + 1;
				$templateRow.nextAll('.template-row').each(function(index){
					$(this).attr('rowposition', $startRowPosition + index);
					if($startRowPosition + index < 10){
						$(this).find('.rownumberbadge').html('  '+($startRowPosition+index)+')');
					} else {
						$(this).find('.rownumberbadge').html(($startRowPosition+index)+')');
					}
				});
				
				//Initialize delete button
				$newRow.find('.btnDeleteModule').addClass('btnDeleteModuleOnlyAdded').removeClass('btnDeleteModule');
				//Initialize action button
				if($newRow.find('.checkButton').exists()){
					initializeActionButton($newRow.find('.btnAddAction'));
				}
				//Initialize color picker
				$newRow.find('.rowColorPicker').next('.sp-replacer').remove();
				initializeColorPicker($newRow.find('.rowColorPicker'));	
				//Initialize this new row for the triple click action
				initializeTripleClickCopy($newRow);
			} else {
				showBootstrapInfoDialog("Invalid operation", "Can't copy this template row. There are worksheets based on this template and it's therefore locked!", "warning");
			}
		});	
	});
}



