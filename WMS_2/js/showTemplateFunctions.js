$(document).ready($(function(){

        //*************************************
        // Initialize
        //*************************************

        //Get & Set hidden TemplateId
        var templateId = getUrlParameter('templateid');
        if(templateId !== null){
            $("#new_template_id").text(templateId);
            loadTemplate(templateId);
            //Initialize picture modal
            checkForLockedTemplate(intializePictureModal);
            //Initialize drag and drop
            initializeDragAndDrop();
        } else {
            // kein Template ausgewählt
            var dt = new Date().getFullYear();
            $('#new_template_current_date').text(dt);
            $("#new_template_creator_name").text(sessionStorage.getItem('FirstName')+' '+sessionStorage.getItem('LastName')+' ('+  sessionStorage.getItem('username')+')');
            //Initialize picture modal
            checkForLockedTemplate(intializePictureModal);
            //Initialize drag and drop
            initializeDragAndDrop();
        }

        initAddModule();

        initSaveTemplate();

        initDeleteUnsavedModules();
        initDeleteSavedModules();
 }));

function initDeleteUnsavedModules() {
    $("#new_template_module_list").on("click", ".template-module-delete-unsaved", function(event) {
		$(event.currentTarget).parents(".module").remove();
		$('#new_template_module_list .module').each(function(index){
			$(this).find(".template-module-row-count").text(index+1);
		});
	});
}

function initDeleteSavedModules() {
    $("#new_template_module_list").on("click",".template-module-delete-saved",function(e) {
        deleteTemplateRow($(e.currentTarget).parents(".module"));
    });
}

 //*************************************
 // Drag & Drop for List
 //*************************************
 function initializeDragAndDrop(){

 	checkForLockedTemplate(function isLocked(locked){
 		if(!locked){
 			$("#new_template_module_list").sortable({
 				cancel: ':input,button,[contenteditable],.sp-replacer',
 				opacity: 0.8,
 				cursor: 'move',
 				update: function(event, ui) {
 					$('#new_template_module_list .module').each(function (index) {
						$(this).find(".template-module-row-count").text(index+1);
					});
 				}
 			});

 		} else {
 			$("#new_template_module_list").sortable({
 				cancel: ':input,button,[contenteditable],.sp-replacer',
 				opacity: 0.8,
 				cursor: 'move',
 				beforeStop: function() {
 					showBootstrapInfoDialog("Invalid operation", "Can't change row order. There are websites based on this template and it's therefore locked!", "warning");
 					$(this).sortable('cancel');
 				}
 			});
 		}
 	});

 }


 //*************************************
 // Dialog for Image
 //*************************************
function intializePictureModal(){
    $("#new_template_module_list").on('click', '.editableImg', function() {
        var $pictureDialog = $("#new_template_picture_dialog");
        $pictureDialog.find("#hidden_module_col_id").text($(this).parents(".template-module-element").attr("module-column-id"));
        $pictureDialog.find("#hidden_row_count").text($(this).parents("tr").find(".template-module-row-count").text());
        $pictureDialog.modal('toggle');
    });
}


 //*************************************
 // Check if the template is locked:
 // If there are websites based on
 // this template, it's locked!
 //************************************
 function checkForLockedTemplate(callback) {
 	//Check if changes in this template are applicable
 	var tplId = $('#new_template_id').html();
	return $.ajax({
			type: "POST",
			url: 'db/db_getAllWebsitesWithTemplateId.php',
			data: {data: tplId},
			dataType:'json',
			success: function(data){
				//Check if there are websites that are based on this template
				if(!jQuery.isEmptyObject(data)) {
					callback(true);
				} else {
					callback(false);
				}
			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get Website from DB!", 'danger');
			callback(true);
		});
 }

function initAddModule() {
    $("#new_template_add_module").click(showAddModuleDialog);
}

function showAddModuleDialog(event) {
    checkForLockedTemplate(function isLocked(locked){
        if(locked){
            showBootstrapInfoDialog("Invalid operation", "This template is locked. There are websites based on this template!", "warning");
        } else {
            $('#new_template_module_dialog').modal('toggle');
            $.ajax({
                type: "POST",
                url: 'db/db_getAllModules.php',
                dataType:'json',
                success: function(data) {
                    var lastModuleId = null;

                    var $moduleList    = $("#new_template_module_dialog_module_list");
                    $moduleList.empty();
                    var $module          = null;
                    var tplModuleCell    = _.template($("#new_template_module_dialog_module_cell").html());
                    var tplModuleElement = null;
                    var tplModuleAdd     = _.template($("#new_template_module_dialog_module_add").html());

                    $.each(data, function(index, element) {
                        //Any new module
                        if (element.module_id != lastModuleId){
                            if(index == 0){
                                // neues li Element
                                $module = $($("#new_template_module_dialog_module").html());
                            }
                            else{
                                $module.find("tr").append(tplModuleAdd({last_module_id: lastModuleId}));
                                $module.on("click", ".module-add", addSelectedModule);
                                $moduleList.append($module);
                                $module = $($("#new_template_module_dialog_module").html());
                            }
                        }

                        tplModuleElement = _.template(element.html_code);
                        var elementData = {element_value: element.default_value};

                        var elementCellData = {
                            element_size: element.size,
                            element_id:   element.id,
                            module_id:    element.module_id,
                            element_html: tplModuleElement(elementData)
                        }

                        $module.find("tr").append(tplModuleCell(elementCellData));

                        //Last module
                        if(data.length-1 == index){
                            $module.find("tr").append(tplModuleAdd({last_module_id: lastModuleId}));
                            $module.on("click", ".module-add", addSelectedModule);
                            $moduleList.append($module);
                        }
                        lastModuleId = element.module_id;
                    });

                    centerAllElements();

                }
            }).fail(function(){
                showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
            });

        }
    });
}

/*
    Add selected Module to Template
*/
function addSelectedModule(event) {
    var selectedModuleId = $(event.currentTarget).attr("module-id");
    console.log("selectedModuleId: " + selectedModuleId);
	if (selectedModuleId != null) {
		$.ajax({
			type: "POST",
			url: 'db/db_selectModule.php',
			data: {data:selectedModuleId},
			dataType:'json',
			success: function(data){
                renderModule(data);

                var $module = $("#new_template_module_list .module[module-id=" + selectedModuleId + "]");

                // module added and not saved -> set right delete button
                $module.find(".template-module-delete-saved").addClass('template-module-delete-unsaved').removeClass('template-module-delete-saved');
                //Initialize colorpicker, and align element
                initializeColorPicker($module);
                centerAllElements();

				//Initialize the copy function
				initializeTripleClickCopy($module);

			}
		}).fail(function(){
			showBootstrapInfoDialog("Error", "Can't get modules from DB!", 'danger');
		});
	}

}

function renderModule(data) {
    console.log(data);
    var $templateModules = $("#new_template_module_list");
    var moduleCount      = $templateModules.find("li").length + 1;

    var tplModule     = _.template($("#new_template_module").html());

    var $elementsHtml = $("<div>");
    var tplElement   = _.template($("#new_template_module_element").html());

    $.each(data, function(index, element) {
        var tplElementHtml = _.template(element.html_code);
        var elementHtml    = tplElementHtml({element_value: element.default_value});
        var elementData = {
            element_size:    (element.size * 91.7)/100,
            module_column_id: element.id,
            element_id:       element.element_id,
            element_html:     elementHtml
        }
        $elementsHtml.append(tplElement(elementData));
    });

    var colorCode = (data[0].color_code == null) ? "" : data[0].color_code;
    var templateRowID = (data[0].template_row_id == null) ? "" : data[0].template_row_id;

    var moduleData       = {
        module_id:            data[0].module_id,
        color_code:           colorCode,
        template_row_id:      templateRowID,
        module_count:         moduleCount,
        module_elements_html: $elementsHtml.html()
    };

    $templateModules.append(tplModule(moduleData));
}

function initializeColorPicker($module) {
	//initialize colorpicker
	var elementColor = $module.attr('color-id');

	if(elementColor === '' || elementColor == null) {
		elementColor = '#FFFFFF';
	}

	var contrastColor = jQuery.Color(elementColor).contrastColor();
	var contrastColor2 = (contrastColor == 'white' ? 'black' : 'white');

    var $colorpicker = $module.find(".template-module-colorpicker");

	checkForLockedTemplate(function isLocked(locked){
		if(locked){
            $colorpicker.click(function() {
                showBootstrapInfoDialog("Invalid operation", "Can't change this row color. There are websites based on this template!", "warning");
            });
        } else {
			$colorpicker.spectrum({
				color: elementColor,
				move:   function(color) {changeRowColor($module, color);},
				change: function(color) {changeRowColor($module, color);},
				show:   function(color) {changeRowColor($module, color);},
				allowEmpty: true,
				preferredFormat: "hex",
				showInput: true,
				showButtons: false,
				containerClassName: 'colorpicker'
			});
		}

        $module.siblings("div").find(".sp-preview-inner").html("<span class='glyphicon glyphicon-tint' aria-hidden='true' style='color: #fff;'></span>");
        $module.css("background-color", elementColor);
        $module.siblings("div").find(".sp-preview").css('border-color', contrastColor2);
        $module.siblings("div").find(".sp-preview-inner").css('background-color', contrastColor);
        $module.siblings("div").find(".glyphicon").css('color', contrastColor2);
        $module.parents('tr').find('.template-module-row-count').css({'background-color': contrastColor, 'color': contrastColor2});
        $module.parents('tr').find('.template-module-delete-saved, .template-module-delete-unsaved, .checkButton').css({'background-color': contrastColor, 'color': contrastColor2});
        $module.parents('tr').find('.template-module-button').css({'border-color': contrastColor2});
    });

}

//*************************************
// Change row and element colors
//*************************************
function changeRowColor($module, color) {
	//Change row color, add color as attribute and also change the color of the button and glyphicon
    if(color == null) color = "#FFF";
    else color = color.toHexString();
    var contrastColor  = jQuery.Color(color).contrastColor();
	var contrastColor2 = (contrastColor == 'white' ? 'black' : 'white');
	$module.attr('color-id', color);									//set attribute
	$module.css( "background-color", color);							//set row's background color
	$module.find(".template-module-colorpicker").siblings("div").find(".sp-preview").css({'border-color': contrastColor2});			//set border color of colorpicker
	$module.find(".template-module-colorpicker").siblings("div").find(".sp-preview-inner").css({'background-color': contrastColor});	//set background color of colorpicker
	$module.find(".template-module-colorpicker").siblings("div").find(".glyphicon").css('color', contrastColor2);						//set icon color of colorpicker
	$module.find('.template-module-row-count').css({'background-color': contrastColor, 'color': contrastColor2});	//set color of row-count
	$module.find('.template-module-delete-saved, .template-module-delete-unsaved, .checkButton').css({'background-color': contrastColor, 'color': contrastColor2});	//set delete button colors
	$module.find('.template-module-button').css({'border-color': contrastColor2});
}

//*************************************
// Prepare template for duplication
//************************************
function initializeTripleClickCopy($module){
	$module.bind('tripleclick', function(){
		checkForLockedTemplate(function isLocked(locked){
			if(!locked){
                copyModule($module);
			} else {
				showBootstrapInfoDialog("Invalid operation", "Can't copy this template row. There are websites based on this template and it's therefore locked!", "warning");
			}
		});
	});
}

function copyModule($module) {
    //Copy this row and set it below this row
    var $newModule = $module.clone();
    //$newModule.removeAttr('id');
    $module.after($newModule);
    var startRowCount = parseInt($module.find(".template-module-row-count").text()) + 1;

    $module.nextAll('.module').each(function(index){
        $(this).find(".template-module-row-count").text(startRowCount + index);
    });

    //Initialize delete button
    $newModule.find('.template-module-delete-saved').addClass('template-module-delete-unsaved').removeClass('template-module-delete-saved');

    //Initialize color picker
    $newModule.find('.template-module-colorpicker').next('.sp-replacer').remove();
    initializeColorPicker($newModule);
    //Initialize this new row for the triple click action
    initializeTripleClickCopy($newModule);
}

function initSaveTemplate() {
    $("#new_template_save").click(saveTemplate);
}

function saveTemplate(){
    // template values
    var author = sessionStorage.getItem('username');
    var templateName = $("#new_template_header_name_input").val();
    var errors = 0;
    var valid = true;
    var isANewTemplate = false;


	$('#new_template_header_name_input').removeClass('has-error');

    if (templateName == '') {
		valid = false;
		$('#new_template_header_name_input').addClass('has-error');
	}

    if(valid) {
        // valid template paramters
        var dataArray = $('div.template-module-element').map(function(){

			//Information for table template_row_content
			var moduleColumnId = $(this).attr("module-column-id");
			var contentText = '';
			if($(this).children(".editableText").exists()){
				contentText = $.trim($(this).children("div").text()).replace(/(\r\n|\n|\r)/gm," ");
			} else if($(this).children('.editableImg').exists()){
				contentText = $(this).children('.editableImg').attr('src');
			}

			//Information for table template_row
			var moduleId      = $(this).parents(".module").attr("module-id");
			var templateRowId = $(this).parents(".module").attr("template-row-id");
			var templateId    = $('#new_template_id').text();
			var colorCode     = $(this).parents(".module").attr('color-id');
			var rowPos        = parseInt($(this).parents(".module").find(".template-module-row-count").text());

			if(isEmpty(templateId)){
				templateId     = null;
				isANewTemplate = true;
				templateRowId  = 'undefined';
			}

			if(typeof colorCode == 'undefined')     {colorCode     = 'undefined';}
			if(typeof templateRowId == 'undefined' || templateRowId == "") {templateRowId = 'undefined';}

			return {
                    content_text:     contentText,
                    module_column_id: moduleColumnId,
                    module_id:        moduleId,
                    template_row_id:  templateRowId,
                    template_id:      templateId,
                    color_code:       colorCode,
                    row_pos:          rowPos,
                    template_name:    templateName,
                    template_author:  author
                };

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
                $('#new_template_id').text(data['new_template_id']);
                $('.currentDateStamp').text(data['new_template_creation_date']);
                if(isANewTemplate){
                    window.history.pushState('WMS', 'Website Management System', "index.html?site=showTemplate&templateid="+$('#new_template_id').text());
                }

                //Assign the Ids of newly added rows that where saved for the first time to the rows
                $.each(data['posAndIdArray'], function(index, element){
                    var $module = $("#new_template_module_list").find(".module:eq(" + (element.row_pos - 1) + ")");
                    $module.attr("template-row-id", element.template_row_id);
                });

                //Initialize the delete buttons of those rows just saved
                $('#new_template_module_list .module .template-module-delete-unsaved').addClass('template-module-delete-saved').removeClass('template-module-delete-unsaved');

            });
        } else {
            showBootstrapInfoDialog("Empty template", "There is nothing to save. Please add at least one module.", 'info');
        }
    }

	return null;
}

function deleteTemplateRow($module){
    console.log($module);
	showBootstrapConfirmDialog('Confirm to delete row', "Are you sure you want to perform this action? This action can't be revoked!", 'warning', function(result) {
		if(result){
			checkForLockedTemplate(function isLocked(locked){
				if(locked){
					showBootstrapInfoDialog("Invalid operation", "Can't delete this template row. There are websites based on this template!", "warning");
				} else {
					$.ajax({
						type: "POST",
						url: 'db/db_deleteTemplateRow.php',
						data: {template_row_id: $module.attr('template-row-id')}
					}).fail(function(){
						showBootstrapInfoDialog("Error", "Can't delete template row from DB!", 'danger');
					}).done(function(){
						$module.remove();
					});
				}
			});
		}
	});
}

function loadTemplate(templateId) {
    //Load Content
    $.ajax({
    type: "POST",
    url: 'db/db_getTemplateById.php',
    data: {data:templateId},
    dataType:'json',
    success: function(data){
        console.log(data);
        var lastRowPosition = null;

        //Set template header information
        $("#new_template_header_name_input").val(data[0]["template_name"]);

        $('#new_template_current_date').text(data[0]["template_created"]);
        $("#new_template_creator_name").text(data[0]["first_name"] + ' ' + data[0]["last_name"] + ' (' + data[0]["username"] + ')');

        $("#new_template_id").text(data[0]["template_id"]);

        var lastRowNum = null;
        var modules = [];
        $.each(data, function(index, element) {
            if (element.row_num != lastRowNum) {
                if(index == 0){
                    // neues Module
                    module = [];
                } else {
                    modules.push(module);
                    module = [];
                }
            }

            var elementData = {
                default_value:   element.Value,
                color_code:      element.color_code,
                template_row_id: element.template_row_id,
                element_id:      element.element_id,
                element_name:    element.element_name,
                html_code:       element.html_code,
                id:              element.module_column_id,
                module_id:       element.module_id,
                size:            element.size
            };

            module.push(elementData);
            //Last module
            if(data.length-1 == index) {
                modules.push(module);
            }
            lastRowNum = element.row_num;
        });
        for(var i = 0; i < modules.length; i++) {
            renderModule(modules[i]);
        }

        $("#new_template_module_list .module").each(function(index) {
            var $module = $(this);
            //Initialize colorpicker, and align element
            initializeColorPicker($module);
            centerAllElements();

            //Initialize the copy function
            initializeTripleClickCopy($module);

        });

    }
    }).fail(function(){
        showBootstrapInfoDialog("Error", "Can't get Template from DB!", 'danger');
    });
}
