<?php

	include("db_connect.php");

	//Variables needed in the code
	$data 			 = $_POST['data'];
	$lastTemplateId	 = null;
	$templateUpdated = false;
	$isAnUpdate 	 = false;
	$returnData 	 = null;

	//First element of the array for the template information
	$firstElement = reset($data);

	//Extract the template information
	$templateId 	= $mysqli->real_escape_string($firstElement['template_id']);
	$templateName   = $mysqli->real_escape_string($firstElement['template_name']);
	$templateAuthor = $mysqli->real_escape_string($firstElement['template_author']);


	//1. Create a new template if necessary
	//Create a new template
	if (($lastTemplateId == null) && ($templateId == null)) {
		$templateQuery = 'INSERT INTO template(name, author_id)
						  VALUES ("' . $templateName . '", (SELECT id
						  									FROM   user
															WHERE  username = "' . $templateAuthor . '"));';
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery";
			die("Couldn't create new template:" . mysql_error());
		}
		//Save templateId for further use
		$lastTemplateId = $mysqli->insert_id;
		$templateUpdated = true;
		$returnData['new_template_id'] = $lastTemplateId;
	//Update otherwise (only once!!!)
	} else if (!$templateUpdated) {
		$templateQuery = 'UPDATE template
						  SET name		= "' . $templateName . '",
						  	  author_id = (SELECT id
							  			   FROM   user
										   WHERE  username = "' . $templateAuthor . '")
					      WHERE id = ' . $templateId;
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery";
			die("Couldn't update template:" . mysql_error());
		}
		$lastTemplateId = $templateId;
		$templateUpdated = true;
		$isAnUpdate = true;
		$returnData['new_template_id'] = $templateId;
	}


	//2. Get the TemplateCreated (TimeStamp) attribute of this template
	$templateCreatedQuery = 'SELECT DATE_FORMAT(template_created, "%m/%d/%Y at %H:%i:%s") AS template_created
							 FROM 	template
							 WHERE  id = ' .$lastTemplateId;
	if ($result = $mysqli->query($templateCreatedQuery)) {
		while($date = $result->fetch_array(MYSQLI_ASSOC)) {
			$returnData['new_template_creation_date'] = $date['template_created'];
		}
	} else {
		echo "$templateCreatedQuery";
		die("Couldn't get template creation date:" . mysql_error());
	}


	//3. Delete old template_row_contents first as they don't have an own Id - if it's an update
 	if($isAnUpdate) {
		$deleteTemplateRowContentQuery = '';

		$lastRowPosition = null;
		foreach($data as $deleteEntry) {
			$id = $deleteEntry['template_row_id'];
			$currentRowPosition = $mysqli->real_escape_string($deleteEntry['row_pos']);
			if(!(strcmp($id, 'undefined') === 0) && $lastRowPosition != $currentRowPosition){
				$deleteTemplateRowContentQuery .= 'DELETE FROM template_row_content WHERE template_row_id = ' .$id . '; ';
			}
			$lastRowPosition = $currentRowPosition;
		}
		if (strlen($deleteTemplateRowContentQuery) > 0) {
			if (!$mysqli->multi_query($deleteTemplateRowContentQuery)) {
				echo "$deleteTemplateRowContentQuery";
				die("Couldn't delete template_row_contents from DB:" . mysqli_error($mysqli));
			} else {
				while ($mysqli->next_result()) {;} // flush multi_queries
			}
		}
	}


	//4. Insert new or update old template rows.
	//Two cases: 	1#	It's an update so those entries already having an id are updated, the others are inserted
	//				2#	It's a new template so all rows are inserted
	$rowQuery = '';
	$lastRowNo = null;
	$lastTemplateRowId = null;

	foreach($data as &$row) {
		$currentRowNo =  $mysqli->real_escape_string($row['row_pos']);
		if($currentRowNo !== $lastRowNo) {
			//Gather the data of the new row
			$moduleId = $mysqli->real_escape_string($row['module_id']);
			$colorCode = $mysqli->real_escape_string($row['color_code']);
			$colorCode = (strcmp($colorCode, "undefined") === 0 ? "" : $colorCode);
			$templateRowId = $mysqli->real_escape_string($row['template_row_id']);
			$templateRowId = (strcmp($templateRowId, "undefined") === 0 ? NULL : $templateRowId);
			//Now distinguish between an update and an insert
			if(is_null($templateRowId) || !$isAnUpdate){
				$rowQuery .= 'INSERT INTO template_row(color_code, row_num, template_id, module_id)
							  VALUES ("' . $colorCode . '", ' . $currentRowNo . ', ' . $lastTemplateId . ', ' . $moduleId . '); ';
			} else {
				$rowQuery .= 'UPDATE template_row
							  SET color_code  = "' . $colorCode . 	   '",
							  	  row_num     =  ' . $currentRowNo .   ',
								  template_id =  ' . $lastTemplateId . ',
								  module_id   =  ' . $moduleId .       '
							  WHERE id = ' . $templateRowId . '; ';
			}
		}
		$lastRowNo = $currentRowNo;
	}

	//Launch the multi query and refresh the row Ids
	if (!$mysqli->multi_query($rowQuery)) {
		echo $rowQuery;
		die("Couldn't delete old template_rows:" . mysqli_error($mysqli));
	} else {
		$currentIndex = 0;
		$isFirstResult = true;

		do{
			//As an update doesn't returns an id those entries already having an id have to be skipped
			while($currentIndex < count($data) && !(strcmp($data[$currentIndex]['template_row_id'], 'undefined') === 0)){
				$currentIndex++;
			}
			//Break the whole loop when the end of the data array is reached
			if($currentIndex >= count($data)){
				break;
			}

			//It starts with the first result, the next one is needed in the second do-while loop
			if(!$isFirstResult){
				$mysqli->next_result();
			}

			$currentTemplateRowId = $mysqli->insert_id;
			$isFirstResult = false;

			//When the current result was an update the id is 0, so one of the following results contains the right id
			if($currentTemplateRowId === 0){
				continue;
			}

			$currentTemplateRowNo = $data[$currentIndex]['row_pos'];
			$lastTemplateRowNo = $currentTemplateRowNo;

			//Fill the elements' template rows ids as long as a new row begins
			while($lastTemplateRowNo === $currentTemplateRowNo){
				$data[$currentIndex]['template_row_id'] = $currentTemplateRowId;
				$lastTemplateRowNo = $currentTemplateRowNo;
				$currentIndex++;
				if($currentIndex === count($data)){break;}
				$currentTemplateRowNo = $data[$currentIndex]['row_pos'];
			}

		} while($mysqli->more_results());
	}

	//Flush results if there are still some
	while ($mysqli->next_result()) {;} // flush multi_queries

	//Create a new array that matches every row num (=row_pos) with an id
	$posAndIdArray = array();
	foreach($data as $currentContent) {
		array_push($posAndIdArray, array('row_pos' => $currentContent['row_pos'], 'template_row_id' => $currentContent['template_row_id']));
	}
	$returnData['posAndIdArray'] = $posAndIdArray;

	//7. Now create new template_row_content
	$templateRowContentQuery = '';

	foreach($data as $rowContent) {

		$contentText 	= $mysqli->real_escape_string($rowContent['content_text']);
		$moduleColumnId = $mysqli->real_escape_string($rowContent['module_column_id']);
		$templateRowId  = $rowContent['template_row_id'];

		//Now build the query string
		$templateRowContentQuery .= 'INSERT INTO template_row_content(template_row_id, module_column_id, value)
									 VALUES (' . $templateRowId . ', ' . $moduleColumnId . ', "' . $contentText . '"); ';
	}

	//Execute the query and return some data to the js-Script
	if (!$mysqli->multi_query($templateRowContentQuery)) {
		echo "$templateRowContentQuery";
		die("Couldn't insert new template_row_contents:" . mysql_error());
	} else {
		while ($mysqli->next_result()) {;} // flush multi_queries
	}


	echo json_encode($returnData);
	$mysqli->close();

?>
