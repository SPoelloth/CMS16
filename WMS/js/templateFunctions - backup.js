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
			//var appendCode = "";				
			$.each(data, function(index, element) {		
				$('.templateCategory').append( "<option value='"+element.Id+"'>"+element.Name+"</option>" );				
			});
			//$("#response").html(data);	
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
	}).done(function() {
		//alert($(templateId).exists() + ' - ' + templateId + ' - ' + templateId.length);
		//alert(templateId.length !== 0);
		if(templateId !== null){
			//$('#hiddenTemplateId').text(templateId);
			//Load Content
			$.ajax({
			type: "POST",
			url: 'db/db_getWholeTemplateById.php',
			data: {data:templateId},
			dataType:'json',
			success: function(data){
			
				var appendCode = "";
				var lastRowPosition = null;
				//var deleteButtonCode = "<td><button type='button' class='btn btn-danger btnDeleteModule'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";
				var deleteButtonCode = "<td><div class='buttonContainer'><button type='button' class='btn btn-danger btnDeleteModule'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></div></td>";
				var colorpickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>"
				
				$("#templateHeadlineName").val(data[0]["TemplateName"]);			
				$('#templateNo').val(data[0]["TemplateNo"]);
				$('#templateVersion').val(data[0]["TemplateVersionNo"]);
				$('#templateStatus').val(data[0]["TemplateStatus"]);
				$('#templateValidFor').val(data[0]["TemplateValidFor"]);
				$('#templateCategory').val(data[0]["TemplateCategoryId"]);	
				$('.templateCreatorUsername').text(data[0]["FirstName"]+' '+data[0]["LastName"]+' ('+data[0]["QtbNumber"]+')');	
				$('.currentDateStamp').text(data[0]["TemplateCreated"]);	
				$('#hiddenTemplateId').text(data[0]["TemplateId"]);
				
				$.each(data, function(index, element) {		
				var frontRowNumber = "<td><span class='rownumberbadge'>"+element.RowNo+")</span></td>";
					if (lastRowPosition === null) {
						appendCode = "<li class='ui-sortable-handle template-row' id='" + element.TemplateRowId + "' rowposition='" + element.RowNo + "' colorid='" + element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					else if (lastRowPosition != element.RowNo){
						appendCode += deleteButtonCode + colorpickerButtonCode + "</tr></table></form></li><li class='ui-sortable-handle template-row' id='" + element.TemplateRowId + "' rowposition='"+element.RowNo + "' colorid='"+element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					
						appendCode +=	"<td class='moduleElement' style='width:"+element.Size+"%'>"	;					
							appendCode += "<div mcId='"+element.ModuleColumnId+"' eId='"+element.ElementId+"' class='singleElement'>";	
								if(element.ElementName !== 'Check Button') {
									appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.Value);
								} else {
									appendCode += "<div class='buttonContainer'>" + element.HtmlCode + "</div>";
								}
							appendCode += "</div>";		
						appendCode +=	"</td>";																
					
					lastRowPosition = element.RowNo;
				});
				$("#items-list").append(appendCode+deleteButtonCode+colorpickerButtonCode+"</tr></table></form></li>");	
				$('div.editableText').attr('contenteditable','true');
				$('div.editableText').addClass( "editable" )				
			}				
			}).fail(function(){
				showBootstrapInfoDialog("Error", "Can't get Template from DB!", 'danger');
			}).done(function(){
				$('.basic').each(function(element){
					initializeColorPicker(this);
				});
				alignAllElements();
				resizeHeadlineFontSize();
			}); 	
		} else {
			var dt = new Date().toLocaleDateString('en-US');
			$('.currentDateStamp').text(dt);
			$(".templateCreatorUsername").text(sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+  sessionStorage.getItem('qtbNumber')+')');
		}
	}); 
	
	
	
	//*************************************
	// Delete Button for each Module in DB
	//************************************		
	$(document).on("click",".btnDeleteModule",function(e) {
		var $button = $(this);
		showBootstrapConfirmDialog('Confirm to delete row', 'Are you sure you want to perform this action? It will only take effect if you click on the save button!', 'warning', function(result) {
			if(result){
				templateIsLocked(function isLocked(locked){	
					if(locked){
						showBootstrapInfoDialog("Invalid operation", "Can't delete this template row. There are worksheets based on this template!", "warning");
					} else {
						var $trid = $button.closest("li").attr('id');
						$( "li#"+$trid ).remove();
					}
				});
			}		
		});
    });
	
	//*************************************
	// Save Button
	//*************************************
	$('.saveAll').on('click', function() {	
		
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
			//Set the order number for each module
			$('#items-list li ').each(function (index) {
				$(this).attr('rowposition', index);
			});
		

			//Collect all Elements from the modules
			var dataArray = $('div.singleElement').map(function(){
				
				//Information for table template_row_content
				var $mcId = $(this).attr("mcId");
				//var $trId = null;
				
				//Information for table template_row
				var $modId = $(this).closest("li").attr("mid");
				var $tmpId = $('#hiddenTemplateId').text();			
				var $colorCode = $(this).closest("li").attr('colorid');
				var $rowPos = $(this).closest("li").attr('rowposition');	
				

				if(isEmpty($tmpId)){
					$tmpId = null;
					$isANewTemplate = true;
				}
				if(typeof $modId == 'undefined'){$modId = null;}
				if(typeof $colorCode == 'undefined'){$colorCode = null;}

				
				return {contentText: $.trim($(this).children("div").text()), moduleColumnId: $mcId, moduleId: $modId, templateId: $tmpId, colorCode: $colorCode, rowPos: $rowPos, templateName: $tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNo: $tmpVersionNo, templateStatus: $tmpStatus, templateValidFor: $tmpValidFor, templateCategoryId: $tmpCategoryId};				
				
			}).get();	
			
			// D A T A B A S E		
			// CONTENT DB
			// Update the Value for each Element
			if (!jQuery.isEmptyObject(dataArray)){
				$.ajax({
					type: "POST",
					url: 'db/db_saveTemplate.php',
					data: {data:dataArray},
					dataType:'json',
					success: function(data){								
						$('#hiddenTemplateId').text(data['NewTemplateId']);
						$('.currentDateStamp').text(data['NewTemplateCreationDate']);		
					}
				}).fail(function(data){
					showBootstrapInfoDialog("Error", "Can't save Template in DB!:\n" + JSON.stringify(data), 'danger');
				}).done(function(){
					//The timeout is needed. Otherwise the DB doesn't return all entries correctly and the page isn't loaded correctly
					if($isANewTemplate){
						setTimeout(function(){ window.location.href = "index.html?site=showTemplate&templateid="+$('#hiddenTemplateId').text(); }, 1000);
					}
				});
			} else {
				showBootstrapInfoDialog("Empty template", "There is nothing to save. Please add at least one module.", 'info');
			}
		}			
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
						
						//Refresh row numbers
						$('#items-list li ').each(function (index) {
							$(this).attr('rowposition', index);
						});
					}				
				}).fail(function(){
					showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
				}).done(function() {
					alignAllElements();
				});     		
				//has something to do with picture picking
				$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
				$(".modal-body #hiddenrowpos").text($(this).closest("li").attr('rowposition'));	
			}
		});

    });
	
	
	
	//*************************************
	// Drag & Drop for List
	//*************************************
	templateIsLocked(function isLocked(locked){	
		if(!locked){
			$("#list ul").sortable({cancel: ':input,button,[contenteditable]', opacity: 0.8, cursor: 'move', update: function() {					
					//Refresh row numbers
					$('#items-list li ').each(function (index) {
						($(this).find(".rownumberbadge")).text(index+1 +")");
						$(this).attr('rowposition', index);
					});
				}								  	
			});			
		} else {
			$("#list ul").sortable({opacity: 0.8, cursor: 'move', beforeStop: function() {					
					showBootstrapInfoDialog("Invalid operation", "Can't change row order. There are worksheets based on this template!", "warning");
					$(this).sortable('cancel');
				}								  	
			});	
		
		}
	});
	
	
	//*************************************
	// PopUp for Image
	//*************************************
	templateIsLocked(function isLocked(locked){	
		if(!locked){
			$("body").on('click', '.editableImg', function(){
				$('.bs-example-modal-lg').modal('toggle');
				$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
				$(".modal-body #hiddenrowpos").text($(this).closest("li").attr('rowposition'));	
			});
		}
	});
	//Disabled for Images in the Modal Body (PopUp Window)
	$(".modal-body").on('click', '.editableImg', function(){
		return false;
	});	
	
	
	//*************************************
	// Add Button for each Module in the Menu
	//************************************		
	$(document).on("click",".btnAddModule",function(e) {		
		var $mcId = $(this).attr('moduleID');			
		addSelectedModule($mcId);
    });	
	
	
	//*************************************
	// Delete Button for each Module not in DB
	//************************************
	$(document).on("click",".btnDeleteModuleOnlyAdded",function(e) {		
		var $trId = $(this).closest("li").remove();				
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
	
	
}));	



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
				var frontRowNumber = "<td><span class='rownumberbadge'></span></td>";
				var appendCode = "<li class='ui-sortable-handle' mid='"+data[0].ModuleId+"'><form><table><tbody><tr>"	+ frontRowNumber;
				var deleteButtonCode = "<td class='moduleElement'><button type='button' class='btn btn-danger btnDeleteModuleOnlyAdded'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";										
				var colorPickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>";
				$.each(data, function(index, element) {							
						appendCode += "<td class='moduleElement' style='width:"+element.Size+"%'><div mcId='"+element.Id+"' eid='"+element.eId+"' class='singleElement'>"+element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue);+"</div></td>";
				});
				$("#list ul").append(appendCode+deleteButtonCode+colorPickerButtonCode+"</tr> </tbody></table></form></li>");
				
				//Make the div editable
				$('div.editableText').attr('contenteditable','true');
				$('div.editableText').addClass('editable');
				
				//Refresh row numbers
				$('#items-list li ').each(function (index) {
					($(this).find(".rownumberbadge")).text(index+1 +")");
					$(this).attr('rowposition', index);
				});
			}				
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
		}).done(function(){
			initializeColorPicker($('.basic:last'));
			alignAllElements();
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
	var elementColor = $(row).parents('li').attr('colorid');
	
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
		$(row).parents('li').css("background-color", elementColor);
		$(row).siblings("div").find(".sp-preview").css('border-color', contrastColor2);
		$(row).siblings("div").find(".sp-preview-inner").css('background-color', contrastColor);
		$(row).siblings("div").find(".glyphicon").css('color', contrastColor2);	
		$(row).parents('tr').find('.rownumberbadge').css({'background-color': contrastColor, 'color': contrastColor2});
		$(row).parents('tr').find('.btnDeleteModule, .btnDeleteModuleOnlyAdded, .checkButton').css({'background-color': contrastColor, 'color': contrastColor2});
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
	$(rowElement).closest("li").attr('colorid', color.toHexString());									//set attribute
	$(rowElement).closest("li").css( "background-color", color.toHexString());							//set row's background color
	$(rowElement).siblings("div").find(".sp-preview").css({'border-color': contrastColor2});			//set border color of colorpicker
	$(rowElement).siblings("div").find(".sp-preview-inner").css({'background-color': contrastColor});	//set background color of colorpicker
	$(rowElement).siblings("div").find(".glyphicon").css('color', contrastColor2);						//set icon color of colorpicker
	$(rowElement).parents('tr').find('.rownumberbadge').css({'background-color': contrastColor, 'color': contrastColor2});	//set color of rownumberbadge
	$(rowElement).parents('tr').find('.btnDeleteModule, .btnDeleteModuleOnlyAdded, .checkButton').css({'background-color': contrastColor, 'color': contrastColor2});	//set delete button colors
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
	//Remove all delete and color buttons
	$(printContentObject).find('#items-list li').each(function(){
		$(this).find('.btnDeleteModule, .btnDeleteModuleOnlyAdded').parent('td').remove();
		$(this).find('.basic').parent('td').remove();
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
	$(printContentObject).find('footer:last').after("<span style='float: left;margin-top:10px;'><b>Printout of empty form for information only!</b></span>");
	$(printContentObject).find('footer hr').remove();
	$(printContentObject).find('.maincontainer footer').css('padding-top', '20px');;
	var informationHead = "<div style='padding:10px 0px 10px 10px;float:left'><h4><b>BMW</b> - Emission Lab Oxnard</h4><h5>Template Worksheet printout</h5><h5><b>Empty form for information only!</b><h5>";
	informationHead += "<h6><b>Print Date:</b> "+$.datepicker.formatDate('mm/dd/yy', new Date())+"</h6>";
	informationHead += "</div><div style='text-align:right;padding:10px 10px 10px 0px;float:right'><img src='uploads/bmw_logo.jpg' alt='BMW Logo' style='width:106px;height:119px;'></div>";
	$(printContentObject).find('#informationField').html(informationHead);
	
	//Adjust the line heights as they get bigger at some point and set a border around every row
	$(printContentObject).find('#container #list ul li form').css({'margin-bottom': '0px', 'height': '38px', 'padding-top': '4px'});
	$(printContentObject).find('#items-list li').css('border', '1px solid black');
		
	//Now extract the html content of the remaining object
	myDoc.write('<html>');
	myDoc.write(printContentObject.html());
	myDoc.write('</html>');
	
	//Add some layout properties to the page
	$(myDoc).find('head').children(':last').after('<style type="text/css" media="print">@page{size: auto letter portrait; margin: 15mm 15mm 15mm 15mm;}	 body{background-color:#FFFFFF; border: solid 1px black; margin: 0px; padding-bottom:15px;} li{page-break-inside: avoid;}</style>');
	//Set all row background-colors to important, otherwise they are not printed
	$(myDoc).find('#items-list li').each(function(){
		var $color = $(this).css('background-color');
		$(this).style('background-color', $color, 'important');
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

	mywindow.close();

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