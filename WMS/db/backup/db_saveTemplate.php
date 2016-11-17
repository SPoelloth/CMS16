<?php 

	include("db_connect.php");	

	//Variables needed in the code
	$data = $_POST['data'];
	$lastTemplateId = null;
	$templateUpdated = false;
	$isAnUpdate = false;
	$returnData = null;
	
	//First element of the array for the template information
	$firstElement = reset($data);
	
	//Extract the template information
	$templateId = mysql_real_escape_string ($firstElement['templateId']);
	$templateName = mysql_real_escape_string($firstElement['templateName']);
	$templateAuthor = mysql_real_escape_string($firstElement['templateAuthor']);			
	$templateNo = mysql_real_escape_string($firstElement['templateNo']);
	$templateVersionNo = mysql_real_escape_string($firstElement['templateVersionNo']);
	$templateStatus = mysql_real_escape_string($firstElement['templateStatus']);
	$templateValidFor = mysql_real_escape_string($firstElement['templateValidFor']);
	$templateCategoryId = mysql_real_escape_string($firstElement['templateCategoryId']);
			
		
	//1. Create a new template if necessary
	//Create a new template
	if (($lastTemplateId == null) && ($templateId == null)) {
		$templateQuery = "INSERT INTO template(Name, No, VersionNo, Status, ValidFor, AuthorId, CategoryId) VALUES ('$templateName', '$templateNo', '$templateVersionNo', '$templateStatus', '$templateValidFor', (SELECT Id FROM user WHERE QtbNumber = '$templateAuthor'), '$templateCategoryId');";											
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery\n";
			die("Couldn't create new template:\n" . mysql_error());
		}				
		//Save templateId for further use			
		$lastTemplateId = $mysqli->insert_id;
		$templateUpdated = true;
		$returnData['NewTemplateId'] = $lastTemplateId;	
	//Update otherwise (only once!!!)	
	} else if (!$templateUpdated) {
		//If no attributes in the template table change also the creation date isn't updated. Therefore the current template is first altered with random values and then recreated with it's own values
		$templateQuery = "UPDATE template SET Name='$templateName', No='$templateNo', VersionNo='$templateVersionNo', Status='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', ValidFor='$templateValidFor', AuthorId=(SELECT Id FROM `user` WHERE QtbNumber = '$templateAuthor'), CategoryId='$templateCategoryId' WHERE Id='$templateId';";
		//Execute this query
		$mysqli->query($templateQuery);	
		//Create right update query
		$templateQuery = "UPDATE template SET Name='$templateName', No='$templateNo', VersionNo='$templateVersionNo', Status='$templateStatus', ValidFor='$templateValidFor', AuthorId=(SELECT Id FROM `user` WHERE QtbNumber = '$templateAuthor'), CategoryId='$templateCategoryId' WHERE Id='$templateId';";
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery\n";
			die("Couldn't update template:\n" . mysql_error());
		}
		$lastTemplateId = $templateId;
		$templateUpdated = true;
		$isAnUpdate = true;
		$returnData['NewTemplateId'] = $templateId;				
	}

		
	//2. Get the TemplateCreated (TimeStamp) attribute of this template
	$templateCreatedQuery = "SELECT DATE_FORMAT(TemplateCreated, '%m/%d/%Y at %H:%i:%s') AS TemplateCreated FROM `template` WHERE Id='$lastTemplateId'";			
	if ($result = $mysqli->query($templateCreatedQuery)) {
		while($date = $result->fetch_array(MYSQL_ASSOC)) {
			$returnData['NewTemplateCreationDate'] = $date['TemplateCreated'];
		}	
	} else {
		echo "$templateCreatedQuery\n";
		die("Couldn't get template creation date:\n" . mysql_error());
	}
	
	
	//3. Get all current template_rows to reuse them
	$currentTemplateRows = array();
	if($isAnUpdate) {
		$getAllCurrentTemplateRowsQuery = "SELECT Id FROM `template_row` WHERE TemplateId=$lastTemplateId";	
		if ($result = $mysqli->query($getAllCurrentTemplateRowsQuery)) {
			while($oldTemplateRow = $result->fetch_array(MYSQL_ASSOC)) {
					$currentTemplateRows[] = $oldTemplateRow;;
			}	
		} else {
			echo "$getAllCurrentTemplateRowsQuery\n";
			die("Couldn't get template_rows from DB:\n" . mysql_error());
		}
	}
	
	//4. Delete old template_row_contents first as they don't have an own Id - if it's an update
	if($isAnUpdate) {
		$deleteTemplateRowContentQuery = '';
		foreach($currentTemplateRows as $deleteRowId) {
			$id = $deleteRowId['Id'];
			$deleteTemplateRowContentQuery .= "DELETE FROM template_row_content WHERE TemplateRowId='$id'; ";
		}
		if (!$mysqli->multi_query($deleteTemplateRowContentQuery)) {
			echo "$deleteTemplateRowContentQuery\n";
			die("Couldn't delete template_row_contents from DB:\n" . mysql_error());
		} else {
			while ($mysqli->next_result()) {;} // flush multi_queries
		}
	}
	
	
	//5. Insert or update new template rows
	$updateRowsQuery = '';
	$lastRowNo = null;
	$lastTemplateRowId = null;
	$rowsToRecycle = !empty($currentTemplateRows);

	foreach ($data as &$row) {	
		$currentRowNo =  mysql_real_escape_string($row['rowPos']) + 1;
		if($currentRowNo !== $lastRowNo) {
			$moduleId = mysql_real_escape_string ($row['moduleId']);
			$colorCode = mysql_real_escape_string($row['colorCode']);
			$currentRowId = array_shift($currentTemplateRows)['Id'];
			
			//Recycle and update row
			if($currentRowId !== null) {
				$updateRowsQuery .= "UPDATE template_row SET ColorCode='$colorCode', RowNo='$currentRowNo', TemplateId='$lastTemplateId', ModuleId='$moduleId' WHERE Id='$currentRowId'; ";
				$row['templateRowId'] = $currentRowId;
				$lastTemplateRowId = $currentRowId;
			//Create a new row if there are no old rows to recycle
			} else {
				$insertRowQuery = "INSERT INTO template_row(ColorCode, RowNo, TemplateId, ModuleId) VALUES ('$colorCode', '$currentRowNo', '$lastTemplateId', '$moduleId')";
				$result = $mysqli->query($insertRowQuery);
				if(!$result) {
					echo "$insertRowQuery\n";
					die("Couldn't create new template_row:\n" . mysql_error());
				}		
				//Get the new TemplateRowId for the template_row_contents
				$lastTemplateRowId = $mysqli->insert_id;
				$row['templateRowId'] = $lastTemplateRowId;
			}		
			
			//Launch the multiquery when all old Ids are were used
			if($rowsToRecycle && count($currentTemplateRows) === 0) {
				if (!$mysqli->multi_query($updateRowsQuery)) {
					echo "$updateRowsQuery\n";
					die("Couldn't update template_rows:\n" . mysql_error());	
				} else {
					while ($mysqli->next_result()) {;} // flush multi_queries
				}
				$rowsToRecycle = false;		
			}
		} else {
			$row['templateRowId'] = $lastTemplateRowId;
		}
		$lastRowNo = $currentRowNo;
	}
	
	
	//6. Delete old rows if they still exist but not needed any more
	if(!empty($currentTemplateRows)) {
		$deleteTemplateRowsQuery = '';
		while(!empty($currentTemplateRows)) {
			$currentRowId = array_shift($currentTemplateRows)['Id'];
			$deleteTemplateRowsQuery .= "DELETE FROM `template_row` WHERE Id='$currentRowId'; ";		
		}
		if (!$mysqli->multi_query($deleteTemplateRowsQuery)) {
			echo "$deleteTemplateRowsQuery\n";
			die("Couldn't delete old template_rows:\n" . mysql_error());
		} else {
			while ($mysqli->next_result()) {;} // flush multi_queries
		}
	}

	
	//7. Now create new template_row_content
	$templateRowContentQuery = '';

	foreach($data as $rowContent) {
	
		$contentText =  mysql_real_escape_string($rowContent['contentText']);
		$moduleColumnId = mysql_real_escape_string($rowContent['moduleColumnId']);
		$templateRowId = $rowContent['templateRowId'];

		//Enter content of in table template_row_content
		//First extract a maybe given number in [] brackets from TOM
		preg_match_all('/[\[][0-9]+[\]]/', $contentText, $out);			
		if (isset($out[0][0])){
			$replaceNumberByTom = $out[0][0];
		} else {
			$replaceNumberByTom = "";
		}
		
		//Now build the query string
		$templateRowContentQuery .= "INSERT INTO template_row_content(TemplateRowId, ModuleColumnId, Value, ReplaceNumberByTom) VALUES ('$templateRowId', '$moduleColumnId', '$contentText', '$replaceNumberByTom'); ";
	}
	
	//Execute the query and return some data to the js-Script
	if (!$mysqli->multi_query($templateRowContentQuery)) {
		echo "$templateRowContentQuery\n";
		die("Couldn't insert new template_row_contents:\n" . mysql_error());
	} else {
		while ($mysqli->next_result()) {;} // flush multi_queries
	}


	echo json_encode($returnData);
	$mysqli->close();

?>