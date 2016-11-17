
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
			$("#response").html(data);	
			
		}				
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get Templates from DB!", 'danger');
	}).done(function() {
		//alert($(templateId).exists() + ' - ' + templateId + ' - ' + templateId.length);
		//alert(templateId.length !== 0);
		if(templateId !== null){
			$('#hiddenTemplateId').text(templateId);
			//Load Content
			$.ajax({
			type: "POST",
			url: 'db/db_getWholeTemplateById.php',
			data: {data:templateId},
			dataType:'json',
			success: function(data){
			
				var appendCode = "";
				var lastRowPosition = null;
				var deleteButtonCode = "<td><button type='button' class='btn btn-danger btnDeleteModule'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>";
				var colorpickerButtonCode = "<td><input type='text' class='basic'/><div id='colorValue' style='display: none;'></div></td>"
				
				$("#templateHeadlineName").val(data[0]["TemplateName"]);			
				$('#templateNo').val(data[0]["TemplateNo"]);
				$('#templateVersion').val(data[0]["TemplateVersionNo"]);
				$('#templateStatus').val(data[0]["TemplateStatus"]);
				$('#templateValidFor').val(data[0]["TemplateValidFor"]);
				$('#templateCategory').val(data[0]["TemplateCategoryId"]);	
				$('.templateCreatorUsername').text(data[0]["FirstName"]+' '+data[0]["LastName"]+' ('+data[0]["QtbNumber"]+')');	
				$('.currentDateStamp').text(data[0]["TemplateCreated"]);	
				//$('#hiddenTemplateId').text(data[0]["TemplateId"]);
				
				$.each(data, function(index, element) {		
				var frontRowNumber = "<td><span class='rownumberbadge'>"+element.RowNo+")</span></td>";
					if (lastRowPosition == null) {
						appendCode = "<li class='ui-sortable-handle' id='" + element.TemplateRowId + "' rowposition='" + element.RowNo + "' colorid='" + element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					else if (lastRowPosition != element.RowNo){
						appendCode += deleteButtonCode + colorpickerButtonCode + "</tr></table></form></li><li class='ui-sortable-handle' id='" + element.TemplateRowId + "' rowposition='"+element.RowNo + "' colorid='"+element.ColorCode + "' mId='" + element.ModuleId + "'><form><table><tr>" + frontRowNumber;
					}
					
						appendCode +=	"<td class='moduleElement' style='width:"+element.Size+"%'>"	;					
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
	
}));	

