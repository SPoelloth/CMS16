
new Dropzone("#new_template_picture_dialog_dropzone", {
    init: function() {
		var storeFolder = 'uploads/';
        thisDropzone = this;
		$.getJSON('db/db_uploadPicture.php', function(data) {
		  $.each(data, function(index, val) {
			var mockFile = { name: val.name, size: val.size };
			mockFile.accepted = true;
			thisDropzone.files.push(mockFile);
			thisDropzone.emit('addedfile', mockFile);
			thisDropzone.createThumbnailFromUrl(mockFile, storeFolder + val.name);
			thisDropzone.emit('complete', mockFile);
		  });
		});


		this.on("addedfile", function(file) {

			// Create the remove button
			var buttonContainer = Dropzone.createElement("<div style='text-align:center;margin-top:8px;'></div>");
			var deleteButton = Dropzone.createElement("<button class='btn btn-danger' style='margin-right: 5px;cursor:pointer;'>Del</button>");
			var selectButton = Dropzone.createElement("<button class='btn btn-primary' style='cursor:pointer;'>Select</button>");
			$(buttonContainer).append(deleteButton).append(selectButton);

			// Capture the Dropzone instance as closure.
			var _this = this;

			// Listen to the click event
		 	deleteButton.addEventListener("click", function(e) {
				// Make sure the button click doesn't submit the form:
				e.preventDefault();
				e.stopPropagation();

				// Remove the file preview.
				$.ajax({
					url: "db/db_deletePicture.php",
					type: "POST",
					data: { 'name': storeFolder + file.name}
				}).done(function( html ) {
					_this.removeFile(file)
				}).fail(function(jqXHR, ajaxOptions, thrownError){
					showBootstrapInfoDialog("Error", "File "+file.name+" not Found!", 'danger');
				});
			});

			// Listen to the click event
		  	selectButton.addEventListener("click", function(e) {
				// Make sure the button click doesn't submit the form:
				e.preventDefault();
				e.stopPropagation();
				var $pictureDialog = $('#new_template_picture_dialog');
                var rowCount       = parseInt($pictureDialog.find("#hidden_row_count").text());
                var moduleColumnId = parseInt($pictureDialog.find("#hidden_module_col_id").text());
                var $module = $("#new_template_module_list").find(".module:eq(" + (rowCount - 1) + ")");
                var $img    = $module.find(".template-module-element[module-column-id=" + moduleColumnId + "] > img");
                $img.attr("src",storeFolder + file.name);
			});

			// Add the buttons to the file preview element.
			file.previewElement.appendChild(buttonContainer);
		});

    },
	thumbnailWidth: 170,
    thumbnailHeight: 170
});
