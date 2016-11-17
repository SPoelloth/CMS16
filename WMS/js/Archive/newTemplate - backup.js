$(document).ready($(function(){ 	
	var $selection;
	//*************************************
	// Initialize
	//*************************************
	$( ".templateHeader" ).load( "templateHead.html" );
	
	//*************************************
	//Get Username & Current Date
	//************************************	
	var dt = new Date().toLocaleDateString('en-US');
	$('.currentDateStamp').text(dt);
	$(".usernameID").text(sessionStorage.getItem('qtbNumber'));
	
	
	//*************************************
	// Get Categories for the Header
	//************************************
	$.ajax({
		type: "POST",
		url: 'db/db_getAllCategories.php',		
		dataType:'json',
		success: function(data){			
			//var appendCode = "";	
			
			$.each(data, function(index, element) {		
					$('.templateCategory').append( "<option value='"+element.Id+"'>"+element.Name+"</option>" );				
			});
			
		}				
	}).fail(function(){
		alert("Error - Can't get Categories from DB!");
	});   
	
	
	//*************************************
	// For all Checkboxes
	//************************************
	$(document).on("change",'input.editableCheckbox', function(){
		var c = this.checked ? 'checked' : 'unchecked';
		$(this).siblings("div").text(c);
	});
	
	
	//*************************************
	// Add Button
	//*************************************
/* 	$('.addNewModule2').on('click',function() {
		var selection = prompt("Please enter the Module Number", "2");		
		if (selection != null) {
			$.ajax({
				type: "POST",
				url: 'db/db_selectModule.php',
				data: {data:selection},
				dataType:'json',
				success: function(data){
					var appendCode = "<li class='ui-sortable-handle'><form><table><tbody><tr>"				
					$.each(data, function(index, element) {							
							appendCode +=" <td style='width:"+element.Size+"%'><div mcId='"+element.id+"' class='singleElement'>"+element.htmlcode.replace(/\[VALUE\]/g, element.defaultvalue);+"</div></td>";
					});
					$("#list ul").append(appendCode+"</tr> </tbody></table></form></li>");
					
					//Make the div editable
					$('div.editableText').attr('contenteditable','true');
					$('div.editableText').addClass('editable');
					
					//Refresh row numbers
					$('#items-list li ').each(function (index) {
						$(this).attr('rowposition', index);
					});
				}				
			}).fail(function(){
				alert("Error - Can't get Module from DB!");
			});                 					
	
		}		
	}); */
	
	
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
		
		if(!checkVersionNo($tmpVersionNr, $tmpHeadlineName)){
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
		
		alert("No of errors: " + $error);
		//alert("arriving here?");
		if($error == 0){
			//Set the order number for each module
			$('#items-list li ').each(function (index) {
				$(this).attr('rowposition', index);
			});
		
		
			//Collect all Elements from the modules
			var dataArray = $('div.singleElement').map(function(){		
			
				//Information for table template_row_content
				var $mcId = $(this).attr("mcId");			
					
				//var $trId = $(this).closest("li").attr('id');
				//var $cpId = $(this).attr("cpid");
				
				//Information for table template_row
				var $modId = $(this).attr("moduleid");
				var $tmpId = $('#hiddenTemplateId').text();
				var $colorCode = $(this).closest("li").attr('colorid');
				var $rowPos = $(this).closest("li").attr('rowposition');	
				
				if(typeof $colorCode == 'undefined'){$colorCode = null;}
				if(typeof $tmpId == 'undefined'){$tmpId = null;}
				//if(typeof $trId == 'undefined'){$trId = null;}
				//if(typeof $cpId == 'undefined'){$cpId = null;}
				if(typeof $modId == 'undefined'){$modId = null;}
				
				return {contentText: $.trim($(this).children("div").text()), moduleColumnId: $mcId, moduleId: $modId, templateId: $tmpId, colorCode: $colorCode, rowPos: $rowPos, templateName: $tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNr: $tmpVersionNr, templateStatus: $tmpStatus, templateValidFor: $tmpValidFor, templateCategoryId: $tmpCategoryId};
				//return {contentText: $.trim($(this).children("div").text()), moduleColumnId: $mcId, templateRowId: $trId, rowPos: $rowPos, contentPosId:$cpId, templateId:$tmpId, templateName:$tmpHeadlineName, templateAuthor: $tmpAuthor, templateNo: $tmpNo, templateVersionNr: $tmpVersionNr, templateStatus:$tmpStatus, templateValidFor:$tmpValidFor, templateCategoryId:$tmpCategoryId, colorCode:$colorCode };
			}).get();
			
			// D A T A B A S E		
			// CONTENT DB
			// Update the Value for each Element
			if (!jQuery.isEmptyObject(dataArray)){
				$.ajax({
					type: "POST",
					url: 'db/db_saveTemplate.php',
					data: {data:dataArray},
					success: function(data){			
						alert("Arriving here?");
						$("#response").html(data);							
						var result = jQuery.parseJSON(data);
						$('#hiddenTemplateId').text(result.newtemplateid);
						//window.location.href = "http://localhost/WMS/editTemplate.html?templateid="+result.newtemplateid;
						window.location.href = "editTemplate.html?templateid="+result.newtemplateid;
						//$("#response").html(data);		
																				
					}
				}).fail(function(){
					alert("Error - Can't get Module from DB!");
				}); 
			} else {
				alert("There is nothing to save. Please add at least one module.");
			}
			//Change To Edit Window
			//;
		}			
	});

	//*************************************
	// Drag & Drop for List
	//*************************************
	
	$("#list ul").sortable({cancel: ':input,button,[contenteditable]', opacity: 0.8, cursor: 'move', update: function() {					
			//Refresh row numbers
			$('#items-list li ').each(function (index) {
				($(this).find(".rownumberbadge")).text(index+1 +")");
				$(this).attr('rowposition', index);
			});
		}								  	
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
	
	
	
	
	//TEST - TO BE DELETED
	var cont = document.getElementById("testcontainer");
	//var appendText ="";
	cont.innerHTML = "<br><b>Found following pictures:</b><br>";
	$.getJSON('db/db_upload.php', function(data) {
		  $.each(data, function(index, val) {
			//appendText += index + ": " + val.name + " (" + val.size + ")";
			//appendText += "sers";
			cont.innerHTML += index + ": " + val.name + " (" + val.size/1000 + " kB)<br>";
			
		  });
	});  
	
	
	//*************************************
	// Activate tooltips
	//************************************	
	 $(function () {
	  $("body").tooltip('fixTitle').tooltip({ selector: '[data-toggle=tooltip]'});
	}); 
	
}));	


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
				var appendCode = "<li class='ui-sortable-handle'><form><table><tbody><tr>"	+ frontRowNumber;
				var deleteButtonCode = "<td><button type='button' class='btn btn btn-danger btnDeleteModuleOnlyAdded'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";										
				var colorPickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>";
				$.each(data, function(index, element) {							
						appendCode += "<td style='width:"+element.Size+"%'><div mcId='"+element.Id+"' moduleId='"+element.ModuleId+ "' class='singleElement'>"+element.HtmlCode.replace(/\[VALUE\]/g, element.DefaultValue);+"</div></td>";
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

