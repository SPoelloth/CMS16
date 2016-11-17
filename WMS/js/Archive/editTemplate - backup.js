
$(document).ready($(function(){ 	
	//*************************************
	// Initialize
	//*************************************
	$( ".templateHeader" ).load( "templateHead.html" );

	
	//Get & Set hiddenTemplateId
	var templateId = getUrlParameter('templateid');
	$('#hiddenTemplateId').text(templateId);
	
	
	
	//************************************
	// LOAD TEMPLATE
	//************************************	
	if (templateId != null) {	
	
		// Load Categories for the Header
		$.ajax({
			type: "POST",
			url: 'db/db_getAllCategories.php',		
			dataType:'json',
			success: function(data){			
				var appendCode = "";				
				$.each(data, function(index, element) {		
						$('.templateCategory').append( "<option value='"+element.Id+"'>"+element.Name+"</option>" );				
				});
				$("#response").html(data);	
				
			}				
		}).fail(function(){
			alert("Error - Can't get Templates from DB!");
		}).done(function() {
			
			//Load Content
			$.ajax({
			type: "POST",
			url: 'db/db_getWholeTemplateByID.php',
			data: {data:templateId},
			dataType:'json',
			success: function(data){
			
				var appendCode = "";
				var lastRowPosition = null;
				var deleteButtonCode = "<td><button type='button' class='btn btn btn-danger btnDeleteModule'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";
				var colorpickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>"
				
				$("#templateHeadlineName").val(data[0]["TemplateName"]);			
				$('#templateNo').val(data[0]["TemplateNo"]);
				$('#templateVersion').val(data[0]["TemplateVersionNo"]);
				$('#templateStatus').val(data[0]["TemplateStatus"]);
				$('#templateValidFor').val(data[0]["TemplateValidFor"]);
				$('#templateCategory').val(data[0]["TemplateCategoryId"]);	
				$('.usernameID').text(data[0]["QtbNumber"]);	
				$('.currentDateStamp').text(data[0]["TemplateCreated"]);	
				$('#hiddenTemplateId').text(data[0]["TemplateId"]);
				

				$.each(data, function(index, element) {		
				var frontRowNumber = "<td><span class='rownumberbadge'>"+element.RowNo+")</span></td>";
					if (lastRowPosition == null) {
						appendCode = "<li class='ui-sortable-handle' id='" + element.TemplateRowId + "' rowposition='" + element.RowNo + "' colorid='" + element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					else if (lastRowPosition != element.RowNo){
						appendCode += deleteButtonCode + colorpickerButtonCode + "</tr></table></form></li><li class='ui-sortable-handle' id='" + element.TemplateRowId + "' rowposition='"+element.RowNo + "' colorid='"+element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					
						appendCode +=	"<td style='width:"+element.Size+"%'>"	;					
							appendCode += "<div mcId='"+element.ModuleColumnId+"' eId='"+element.ElementId+"' class='singleElement'>";							
								appendCode += element.HtmlCode.replace(/\[VALUE\]/g, element.Value);
							appendCode += "</div>";		
						appendCode +=	"</td>";																
					
					lastRowPosition = element.RowNo;
				});
				$("#items-list").append(appendCode+deleteButtonCode+colorpickerButtonCode+"</tr></table></form></li>");	
				$('div.editableText').attr('contenteditable','true');
				$('div.editableText').addClass( "editable" )				
			}				
			}).fail(function(){
				alert("Error - Can't get Template from DB!");
			}).done(function(){
											
				$(".basic").spectrum({
					color: "#f00",
					move: function(color) {
						$(this).closest("li").attr('colorid', color.toHexString());
						$(this).closest("li").css( "background-color", color.toHexString());
					}
				});
				
				//Set background colors
				$('#items-list li ').each(function (index) {
					$(this).css( "background-color",$(this).attr('colorid'));
				});

				
			}); 
			
		}); 
	
	
                					

	}
	

		
	//*************************************
	// For all Checkboxes
	//************************************
	$(document).on("change",'input.editableCheckbox', function(){
		var c = this.checked ? 'checked' : 'unchecked';
		$(this).siblings("div#hiddenElementValue").text(c);
	});
	
	
	// HAS TO BE REWORKED - WHAT HAPPENS IF THERE ARE DOCUMENTS BASED ON THIS TEMPLATE? A NEW TEMPLATE VERSION-NR SHOULD BE CREATED OR DELETING SHOULDN'T BE ALLOWED!
	//*************************************
	// Delete Button for each Module in DB
	//************************************		
	$(document).on("click",".btnDeleteModule",function(e) {
		if (confirm('Are you sure you want to perform this action? This will affect all Documents based on this Template!')) {
			var $tlid = $(this).closest("li").attr('id');
			
			$.ajax({
					type: "POST",
					url: 'db/db_deleteModuleFromTemplate.php',
					data: {'templatelayoutid': $tlid},			
					success: function(data){
						$( "li#"+$tlid ).remove();
					}				
				}).fail(function(){
					alert("Error - Can't get Module from DddB!");
				});
			
			
		} else {
			return false;
		}
    });
	
	//*************************************
	// Delete Button for each Module not in DB
	//************************************		
	$(document).on("click",".btnDeleteModuleOnlyAdded",function(e) {		
		var $tlid = $(this).closest("li").remove();				
	});
	

				
	//*************************************
	// Add New Module Menu 
	//************************************				
	  $("body").on('click', '.addNewModule', function(){
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
								appendCode = "<li class='ui-sortable-handle'><form><table><tbody><tr>";		
							}
							else{
								//between two elements close,open
								var addButtonCode = "<td><button type='button' moduleID='"+lastModuleId+"' class='btn btn-success btnAddModule'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></td>";
								appendCode += addButtonCode+"</tr></tbody></table></form></li><li class='ui-sortable-handle'><form><table><tbody><tr>";				
							}
						}
						
						//Add content
						appendCode +=" <td style='width:"+element.Size+"%'><div mcId='"+element.Id+"' moduleId='"+element.ModuleId+"'>"+element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue);+"</div></td>";
						
						//Last module
						if(data.length-1 == index){
							//Last Element just close
							var addButtonCode = "<td><button type='button' moduleID='"+lastModuleId+"' class='btn btn-success btnAddModule'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span></button></td>";
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
				alert("Error - Can't get modules from DB!");
			});     		
			//has something to do with picture picking
			$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
			$(".modal-body #hiddenrowpos").text($(this).closest("li").attr('rowposition'));	
      });
	
	//*************************************
	// Add Button for each Module in the Menu
	//************************************		
	$(document).on("click",".btnAddModule",function(e) {		
			var $mcId = $(this).attr('moduleID');			
			addSelectedModule($mcId);
    });	
	

	
	//*************************************
	// Save Button
	//*************************************
	$('.saveAll').on('click', function() {	
		
		//information for table template	
		var $tmpAuthor = sessionStorage.getItem('qtbNumber');		
		var $tmpHeadlineName = $('input#templateHeadlineName').val();
		var $tmpNo = $('#templateNo').val();
		var $tmpVersionNr = $('#templateVersion').val();
		var $tmpStatus = $('#templateStatus').val();
		var $tmpValidFor = $('#templateValidFor').val();
		var $tmpCategoryId = $('#templateCategory option:selected').val();	
		var $error = 0;
			
		$('input#templateHeadlineName').parents(".input-group").removeClass('has-error');
		$('input#templateNo').parents(".input-group").removeClass('has-error');
		$('input#templateVersion').parents(".input-group").removeClass('has-error');
		$('input#templateStatus').parents(".input-group").removeClass('has-error');
		$('input#templateValidFor').parents(".input-group").removeClass('has-error');
		$('#templateCategory').parents(".input-group").removeClass('has-error');
		
		if ($tmpHeadlineName == '') {
			$error++;
			$('input#templateHeadlineName').parents(".input-group").addClass('has-error');
		}
		if ($tmpNo == '') {
			$error++;
			$('input#templateNo').parents(".input-group").addClass('has-error');
		}
		if ($tmpVersionNr == '') {
			$error++;
			$('input#templateVersion').parents(".input-group").addClass('has-error');
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
		if($error == 0){
			//Set the order number for each module
			$('#items-list li ').each(function (index) {
				$(this).attr('rowposition', index);
			});
		
			var $debugString = "";
			
			//Collect all Elements from the modules
			var dataArray = $('div.singleElement').map(function(){		
			
				//Information for table template_row_content
				var $mcId = $(this).attr("mcId");			
					
				//var $trId = $(this).closest("li").attr('id');
				//var $cpId = $(this).attr("cpid");
				
				//Information for table template_row
				var $modId = $(this).closest("li").attr("mid");
				var $tmpId = $('#hiddenTemplateId').text();
				
				var $colorCode = $(this).closest("li").attr('colorid');
				var $rowPos = $(this).closest("li").attr('rowposition');	
				
				if(typeof $colorCode == 'undefined'){$colorCode = null;}
				if(typeof $tmpId == 'undefined'){$tmpId = null;}
				//if(typeof $trId == 'undefined'){$trId = null;}
				//if(typeof $cpId == 'undefined'){$cpId = null;}
				if(typeof $modId == 'undefined'){$modId = null;}
				$debugString += " mcId: "+$mcId+"; modId: "+$modId+"; tmpId: "+$tmpId+"; colorCode: "+$colorCode+"; rowPos: "+$rowPos+";";
				
				return {contentText: $.trim($(this).children("div").text()), moduleColumnId: $mcId, moduleId: $modId, templateId: $tmpId, colorCode: $colorCode, rowPos: $rowPos, templateName: $tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNr: $tmpVersionNr, templateStatus: $tmpStatus, templateValidFor: $tmpValidFor, templateCategoryId: $tmpCategoryId};
				//return {contentText: $.trim($(this).children("div").text()), moduleColumnId: $mcId, templateRowId: $trId, rowPos: $rowPos, contentPosId:$cpId, templateId:$tmpId, templateName:$tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNr: $tmpVersionNr, templateStatus:$tmpStatus, templateValidFor:$tmpValidFor, templateCategoryId:$tmpCategoryId, colorCode:$colorCode };
			}).get();
			
			$("#response").html($debugString);
			
			
			// D A T A B A S E		
			// CONTENT DB
			// Update the Value for each Element
			if (!jQuery.isEmptyObject(dataArray)){
				$.ajax({
					type: "POST",
					url: 'db/db_saveTemplate.php',
					data: {data:dataArray},
					success: function(data){			
						
						//$("#response").html(data);							
						var result = jQuery.parseJSON(data);
						$('#hiddenTemplateId').text(result.newtemplateid);
						//window.location.href = "http://localhost/WMS/editTemplate.html?templateid="+result.newtemplateid;
						//$("#response").html(data);		
																				
					}
				}).fail(function(){
					alert("Error - Can't get Module from DB!");
				}); 
			}
			
			//Change To Edit Window
			//;
		}			
	});

	//*************************************
	// Drag & Drop for List
	//*************************************
	$(function() {
		$("#list ul").sortable({cancel: ':input,button,[contenteditable]', opacity: 0.8, cursor: 'move', update: function() {
			$('#items-list li ').each(function (index) {
				($(this).find(".rownumberbadge")).text(index+1 +")");
				$(this).attr('rowposition', index);
			});
		}								  	
		});
	});		
		
	
	//*************************************
	// PopUp for Image
	//*************************************
	
	$("body").on('click', '.editableImg', function(){
		$('.bs-example-modal-lg').modal('toggle');
		$(".modal-body #hiddenmcid").text($(this).parents(".singleElement").attr("mcId"));		 
		$(".modal-body #hiddenrowpos").text($(this).closest("li").attr('rowposition'));	
	});
	//Disabled for Images in the Modal Body (PopUp Window)
	$(".modal-body").on('click', '.editableImg', function(){
		return false;
	});	

	
}));	


//*************************************
// Extract templateId from URI
//*************************************
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
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
				var deleteButtonCode = "<td><button type='button' class='btn btn btn-danger btnDeleteModuleOnlyAdded'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";										
				var colorPickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>";
				$.each(data, function(index, element) {							
						appendCode += "<td style='width:"+element.Size+"%'><div mcId='"+element.Id+"' eid='"+element.eId+"' moduleId='"+element.ModuleId+ "' class='singleElement'>"+element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue);+"</div></td>";
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
			alert("Error - Can't get modules from DB!");
		}).done(function(){
			$(".basic").spectrum({
				color: "#f00",
				move: function(color) {
					$(this).closest("li").attr('colorID', color.toHexString());
					$(this).closest("li").css( "background-color", color.toHexString());
				}
			});
		});                         					
	
	}	
		
}