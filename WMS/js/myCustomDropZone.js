
new Dropzone("#my-dropzone", { 
    init: function() { 
		var storeFolder = 'uploads/';
        thisDropzone = this;
		$.getJSON('db/db_upload.php', function(data) {
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
					url: "db/db_delete.php",
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
				$('.bs-example-modal-lg').modal("hide");			
				//$("ul").find("[rowposition='"+$(".modal-body #hiddenrowpos").text()+"']").find("[mcId='" + $(".modal-body #hiddenmcid").text() + "']").children("div").text(storeFolder + file.name);
				$("ul").find("[rowposition='"+$(".modal-body #hiddenrowpos").text()+"']").find("[mcId='" + $(".modal-body #hiddenmcid").text() + "']").children("img").attr("src",storeFolder + file.name);
			});  

			// Add the buttons to the file preview element.
			file.previewElement.appendChild(buttonContainer);
		});
		
    },
	thumbnailWidth: 170,
    thumbnailHeight: 170
});		
