

//******************************************************
// Get the highest template version with
// templateName out of the data array
//******************************************************
function getHighestTemplateVersionWithName(data, templateName) {
	var currentHighestVersion = {dataIndex: null, versionHighNumber: null, versionLowNumber: null};

	//Finding the highest versionNo of the template with the same name
 	$.each(data, function(index, element) {

		if(templateName === element.Name){
			var tmpSplitVersionNumber = element.VersionNo.split(".");
			var tmpVersionHighNumber = Number(tmpSplitVersionNumber[0]);
			var tmpVersionLowNumber = Number(tmpSplitVersionNumber[1]);

			//It is the first element found with the same name
			if(currentHighestVersion.dataIndex === null){
				currentHighestVersion.dataIndex = index;
				currentHighestVersion.versionHighNumber = tmpVersionHighNumber;
				currentHighestVersion.versionLowNumber = tmpVersionLowNumber;
			//The element has an higher versionHighNumber than the previous one
			} else if (tmpVersionHighNumber > currentHighestVersion.versionHighNumber) {
				currentHighestVersion.dataIndex = index;
				currentHighestVersion.versionHighNumber = tmpVersionHighNumber;
				currentHighestVersion.versionLowNumber = tmpVersionLowNumber;
			//The element has the same versionHighNumber than the previous one
			} else if (tmpVersionHighNumber === currentHighestVersion.versionHighNumber) {
				//The element has a higher versionLowNumber than the previous one
				if(tmpVersionLowNumber > currentHighestVersion.versionLowNumber) {
					currentHighestVersion.dataIndex = index;
					currentHighestVersion.versionHighNumber = tmpVersionHighNumber;
					currentHighestVersion.versionLowNumber = tmpVersionLowNumber;
				}
			}
		}
	});

	return currentHighestVersion;
}


//******************************************
// Manipulate the alignment of some elements
//******************************************
function alignAllElements() {
	$(".editableCheckbox").parent().css({"text-align": "center"});
	$(".editableRadiobutton").parent().css({"text-align": "center"});
	$(".editableImg").parent().css({"text-align": "center"});
}


//******************************************************
// String check function
//******************************************************
function isEmpty(str) {
  return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}


//******************************************************
// Get user information from DB and set
// information into the session storage
//******************************************************
function setUserInformation(){
	if(!sessionStorage.getItem('FirstName')) {
		$.ajax({
				type: "POST",
				url: 'db/db_getUserByQtbNumber.php',
				data: {'username': sessionStorage.getItem('qtbNumber'), 'password': ''},
				dataType:'json',
				success: function(data){
					if(data.length > 0){
						sessionStorage.setItem('FirstName', data[0].FirstName);
						sessionStorage.setItem('LastName', data[0].LastName);
						$("#hiddenUsername").text(data[0].FirstName + " " + data[0].LastName + " (" + sessionStorage.getItem('qtbNumber') + ")");
					} else {
						sessionStorage.removeItem('qtbNumber');
						location.href = 'index.html';
					}
				}
			}).fail(function(){
				alert("Error - Can't get user information from DB.");
		});
	} else {
		$("#hiddenUsername").text(sessionStorage.getItem('FirstName') + " " + sessionStorage.getItem('LastName') + " (" + sessionStorage.getItem('qtbNumber') + ")");
	}
}

//*************************************
// Find the best fitting contrast-color
//*************************************
jQuery.Color.fn.contrastColor = function() {
    var r = this._rgba[0], g = this._rgba[1], b = this._rgba[2];
    return (((r*299)+(g*587)+(b*144))/1000) >= 131.5 ? "black" : "white";
};



//*************************************
// Set new registry print settings
//*************************************
function setPageSetupRegistry(properties, wsh){
	var keyPage = 			'HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\';
	wsh.RegWrite(keyPage+'footer', properties['footer'], 'REG_SZ');
	wsh.RegWrite(keyPage+'header', properties['header'], 'REG_SZ');
	wsh.RegWrite(keyPage+'Print_Background', properties['printBackground'], 'REG_SZ');

	return true;
}


//*************************************
// Read current registry print settings
//*************************************
function readPageSetupRegistry(wsh){
	var keyPage = 			'HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\PageSetup\\';
	var $footer, $header, $printBackground;
	//Try to read  all initial reg keys first. If they don't exist an error is thrown and catch. Then the reg key is created.
	try {
		$footer = wsh.RegRead(keyPage+'footer');
	} catch(err){
		wsh.RegWrite(keyPage+'footer', '', 'REG_SZ');
		$footer = '';
	}
	try {
		$header = wsh.RegRead(keyPage+'header');
	} catch(err){
		wsh.RegWrite(keyPage+'header', '', 'REG_SZ');
		$header = '';
	}
	try {
		$printBackground = wsh.RegRead(keyPage+'Print_Background');
	} catch(err){
		wsh.RegWrite(keyPage+'Print_Background', 'no', 'REG_SZ');
		$printBackground = 'no';
	}

	//Save values in the properties object
 	var properties = {
		footer: 			$footer,
		header: 			$header,
		printBackground: 	$printBackground
	};

	return properties;
}


//*************************************
// Function to set the background-color
// important for printing
//*************************************
(function($) {
  if ($.fn.style) {
    return;
  }

  // Escape regex chars with \
  var escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };

  // For those who need them (< IE 9), add support for CSS functions
  var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
  if (!isStyleFuncSupported) {
    CSSStyleDeclaration.prototype.getPropertyValue = function(a) {
      return this.getAttribute(a);
    };
    CSSStyleDeclaration.prototype.setProperty = function(styleName, value, priority) {
      this.setAttribute(styleName, value);
      var priority = typeof priority != 'undefined' ? priority : '';
      if (priority != '') {
        // Add priority manually
        var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
            '(\\s*;)?', 'gmi');
        this.cssText =
            this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
      }
    };
    CSSStyleDeclaration.prototype.removeProperty = function(a) {
      return this.removeAttribute(a);
    };
    CSSStyleDeclaration.prototype.getPropertyPriority = function(styleName) {
      var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
          'gmi');
      return rule.test(this.cssText) ? 'important' : '';
    }
  }

  // The style function
  $.fn.style = function(styleName, value, priority) {
    // DOM node
    var node = this.get(0);
    // Ensure we have a DOM node
    if (typeof node == 'undefined') {
      return this;
    }
    // CSSStyleDeclaration
    var style = this.get(0).style;
    // Getter/Setter
    if (typeof styleName != 'undefined') {
      if (typeof value != 'undefined') {
        // Set style property
        priority = typeof priority != 'undefined' ? priority : '';
        style.setProperty(styleName, value, priority);
        return this;
      } else {
        // Get style property
        return style.getPropertyValue(styleName);
      }
    } else {
      // Get CSSStyleDeclaration
      return style;
    }
  };
})(jQuery);



//*******************************************
// Extract information from URI
//*******************************************
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? null : sParameterName[1];
        }
    }
	return null;
}


//*******************************************
// Bootstrap dialog informationhelper function
//*******************************************
function showBootstrapInfoDialog($title, $message, $level) {
	var $dialogType, $buttonType;
	switch($level) {
		case 'warning':
			$dialogType = BootstrapDialog.TYPE_WARNING;
			$buttonType = 'btn-warning';
			break;
		case 'info':
			$dialogType = BootstrapDialog.TYPE_INFO;
			$buttonType = 'btn-info';
			break;
		case 'danger':
			$dialogType = BootstrapDialog.TYPE_DANGER;
			$buttonType = 'btn-danger';
			break;
		case 'success':
			$dialogType = BootstrapDialog.TYPE_SUCCESS;
			$buttonType = 'btn-success';
			break;
		default:
			$dialogType = BootstrapDialog.TYPE_Primary;
			$buttonType = 'btn-primary';
			break;
	}

	var $dialog = BootstrapDialog.show({
		type: $dialogType,
		title: $title,
		message: $message,
		draggable: true,
		closable: true,
		buttons: [{
			label: "Close",
			cssClass: $buttonType,
			action: function(dialogItself) {dialogItself.close();}
		}]
	});
	return $dialog;
}

//*******************************************
// Bootstrap dialog confirmation helper function
//*******************************************
function showBootstrapConfirmDialog($title, $message, $level, $callback) {
	var $btnOkLevel, $dialogType;
	switch($level) {
		case 'warning':
			$dialogType = BootstrapDialog.TYPE_WARNING;
			$btnOkLevel = 'btn-warning';
			break;
		case 'info':
			$dialogType = BootstrapDialog.TYPE_INFO;
			$btnOkLevel = 'btn-info';
			break;
		case 'danger':
			$dialogType = BootstrapDialog.TYPE_DANGER;
			$btnOkLevel = 'btn-danger';
			break;
		case 'success':
			$dialogType = BootstrapDialog.TYPE_SUCCESS;
			$btnOkLevel = 'btn-success';
			break;
		default:
			$dialogType = BootstrapDialog.TYPE_Primary;
			$btnOkLevel = 'btn-primary';
			break;
	}

	var $dialog = BootstrapDialog.confirm({
		title: $title,
		message: $message,
		type: $dialogType,
		closable: true,
		draggable: true,
		btnOKLabel: 'Confirm',
		btnOKClass: $btnOkLevel,
		btnCancelLabel: 'Cancel',
		btnCancelClass: 'btn-danger',
		callback: function(result) {if ($callback) $callback(result)}
	});

	return $dialog;
}



//*******************************************
// Check if the user is permitted to enter
// the user management
//*******************************************
function enterUserManagement(setUrl, callback) {
	var $qtbNumber = sessionStorage.getItem('qtbNumber');
	console.log("QTB number: " + $qtbNumber);
	return $.ajax({
		type: "POST",
		url: 'db/db_getUserByQtbNumber.php',
		data: {'username': $qtbNumber, 'password': ''},
		dataType:'json',
		success: function(data){
			//var $container = $('#userInformationContainer');
			if(data.length > 0){
				if(data[0].GroupName === 'admin'){
					if(setUrl){
						location.href = 'index.html?site=userManagement';
					}
					if(callback !== null){
						callback(true);
					}
				} else {
					if(callback !== null){
						callback(false);
					}
				}
			} else {
				showBootstrapInfoDialog("The DB doesn't know you!", "Your qtb-number can't be found in the DB. How did you even get here?", 'warning');
				sessionStorage.removeItem('qtbNumber');
				location.href = 'index.html';
				if(callback !== null){
					callback(false);
				}
			}
		}
	}).fail(function(){
		showBootstrapInfoDialog("Error", "Can't get user from DB!", 'danger');
		if(callback !== null){
			callback(false);
		}
	});
}

//*******************************************
// Create a jQuery function that checks if
// an element exists
//*******************************************
$.fn.exists = function () {
    return this.length !== 0;
}


//*******************************************
// Create a jQuery function that checks if
// an element has an attribute
//*******************************************
$.fn.hasAttr = function (attrName) {
	var attr = $(this).attr(attrName);
	if (typeof attr !== typeof undefined && attr !== false) {
		return true;
	}

    return false;
}


//*******************************************
// Function that checks if
// if a list of elements contains an element
// having a certain attribute and value
//*******************************************
function listHasAttrAndValue ($elements, $attrName, $attrValue) {
	var $foundElement = $();
	//console.log('listHasAttrAndValue is trying to find attr "'+$attrName+'" with value "'+$attrValue+'"' );
	$elements.each(function(){
		if($(this).hasAttr($attrName) && $(this).attr($attrName) === $attrValue){
			//console.log('listHasAttrAndValue found an element');
			$foundElement = $(this);
			return false;			//break the each function
		}
	});
	//console.log('listHasAttrAndValue function return value: '+$foundElement);
	return $foundElement;
}



//*******************************************
// Lists and prints event handlers
//*******************************************
$.fn.listHandlers = function(events, outputFunction) {
    return this.each(function(i){
        var elem = this,
            dEvents = $(this).data('events');
        if (!dEvents) {return;}
        $.each(dEvents, function(name, handler){
            if((new RegExp('^(' + (events === '*' ? '.+' : events.replace(',','|').replace(/^on/i,'')) + ')$' ,'i')).test(name)) {
               $.each(handler, function(i,handler){
                   outputFunction(elem, 'n' + i + ': [' + name + '] : ' + handler );
               });
           }
        });
    });
};



//*******************************************
// jQuery function that marks text
//*******************************************
$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};



//*******************************************
// jQuery function for tripleclicks
//*******************************************
$.event.special.tripleclick = {

    setup: function(data, namespaces) {
        var elem = this, $elem = jQuery(elem);
        $elem.bind('click', jQuery.event.special.tripleclick.handler);
    },

    teardown: function(namespaces) {
        var elem = this, $elem = jQuery(elem);
        $elem.unbind('click', jQuery.event.special.tripleclick.handler)
    },

    handler: function(event) {
        var elem = this, $elem = jQuery(elem), clicks = $elem.data('clicks') || 0, start = $elem.data('startTimeTC') || 0;
        if ((new Date().getTime() - start)>= 1000) {
            clicks = 0;
        }
        clicks += 1;
        if(clicks === 1) {
            start = new Date().getTime();
        }

        if ( clicks === 3 ) {
            clicks = 0;

            // set event type to "tripleclick"
            event.type = "tripleclick";

            // let jQuery handle the triggering of "tripleclick" event handlers
            $elem.trigger('tripleclick');
        }

        $elem.data('clicks', clicks);
        $elem.data('startTimeTC', start);
    }

};
