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
	$templateId = $mysqli->real_escape_string($firstElement['templateId']);
	$templateName = $mysqli->real_escape_string($firstElement['templateName']);
	$templateAuthor = $mysqli->real_escape_string($firstElement['templateAuthor']);
	$templateNo = $mysqli->real_escape_string($firstElement['templateNo']);
	$templateVersionNo = $mysqli->real_escape_string($firstElement['templateVersionNo']);
	$templateStatus = $mysqli->real_escape_string($firstElement['templateStatus']);
	$templateValidFor = $mysqli->real_escape_string($firstElement['templateValidFor']);
	$templateCategoryId = $mysqli->real_escape_string($firstElement['templateCategoryId']);


	//1. Create a new template if necessary
	//Create a new template
	if (($lastTemplateId == null) && ($templateId == null)) {
		$templateQuery = "INSERT INTO template(Name, No, VersionNo, Status, ValidFor, AuthorId, CategoryId) VALUES ('$templateName', '$templateNo', '$templateVersionNo', '$templateStatus', '$templateValidFor', (SELECT Id FROM user WHERE Username = '$templateAuthor'), '$templateCategoryId');";
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery";
			die("Couldn't create new template:" . mysql_error());
		}
		//Save templateId for further use
		$lastTemplateId = $mysqli->insert_id;
		$templateUpdated = true;
		$returnData['NewTemplateId'] = $lastTemplateId;
	//Update otherwise (only once!!!)
	} else if (!$templateUpdated) {
		//If no attributes in the template table change also the creation date isn't updated. Therefore the current template is first altered with random values and then recreated with it's own values
		$templateQuery = "UPDATE template SET Name='$templateName', No='$templateNo', VersionNo='$templateVersionNo', Status='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', ValidFor='$templateValidFor', AuthorId=(SELECT Id FROM `user` WHERE Username = '$templateAuthor'), CategoryId='$templateCategoryId' WHERE Id='$templateId';";
		//Execute this query
		$mysqli->query($templateQuery);
		//Create right update query
		$templateQuery = "UPDATE template SET Name='$templateName', No='$templateNo', VersionNo='$templateVersionNo', Status='$templateStatus', ValidFor='$templateValidFor', AuthorId=(SELECT Id FROM `user` WHERE Username = '$templateAuthor'), CategoryId='$templateCategoryId' WHERE Id='$templateId';";
		//Execute Query
		$result = $mysqli->query($templateQuery);
		if(!$result) {
			echo "$templateQuery";
			die("Couldn't update template:" . mysql_error());
		}
		$lastTemplateId = $templateId;
		$templateUpdated = true;
		$isAnUpdate = true;
		$returnData['NewTemplateId'] = $templateId;
	}


	//2. Get the TemplateCreated (TimeStamp) attribute of this template
	$templateCreatedQuery = "SELECT DATE_FORMAT(TemplateCreated, '%m/%d/%Y at %H:%i:%s') AS TemplateCreated FROM `template` WHERE Id='$lastTemplateId'";
	if ($result = $mysqli->query($templateCreatedQuery)) {
		while($date = $result->fetch_array(MYSQLI_ASSOC)) {
			$returnData['NewTemplateCreationDate'] = $date['TemplateCreated'];
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
			$id = $deleteEntry['templateRowId'];
			$currentRowPosition = $deleteEntry['rowPos'];
			if(!(strcmp($id, 'undefined') === 0) && $lastRowPosition !== $currentRowPosition){
				$deleteTemplateRowContentQuery .= "DELETE FROM template_row_content WHERE TemplateRowId=$id; ";
			}
			$lastRowPosition = $currentRowPosition;
		}
		if (!$mysqli->multi_query($deleteTemplateRowContentQuery)) {
			echo "$deleteTemplateRowContentQuery";
			die("Couldn't delete template_row_contents from DB:" . mysql_error());
		} else {
			while ($mysqli->next_result()) {;} // flush multi_queries
		}
	}


	//4. Insert new or update old template rows.
	//Two cases: 	1#	It's an update so those entries already having an id are updated, the others are inserted
	//				2#	It's a new template so all rows are inserted
	$rowQuery = '';
	$lastRowNo = null;
	$lastTemplateRowId = null;

	foreach($data as &$row) {
		$currentRowNo =  $mysqli->real_escape_string($row['rowPos']);
		if($currentRowNo !== $lastRowNo) {
			//Gather the data of the new row
			$moduleId = $mysqli->real_escape_string($row['moduleId']);
			$colorCode = $mysqli->real_escape_string($row['colorCode']);
			$colorCode = (strcmp($colorCode, "undefined") === 0 ? "" : $colorCode);
			$templateRowId = $mysqli->real_escape_string($row['templateRowId']);
			$templateRowId = (strcmp($templateRowId, "undefined") === 0 ? NULL : $templateRowId);
			//Now distinguish between an update and an insert
			if(is_null($templateRowId) || !$isAnUpdate){
				$rowQuery .= "INSERT INTO template_row(ColorCode, RowNo, TemplateId, ModuleId) VALUES ('$colorCode', '$currentRowNo', '$lastTemplateId', '$moduleId'); ";
			} else {
				$rowQuery .= "UPDATE template_row SET ColorCode='$colorCode', RowNo='$currentRowNo', TemplateId='$lastTemplateId', ModuleId='$moduleId' WHERE Id='$templateRowId'; ";
			}
		}
		$lastRowNo = $currentRowNo;
	}

	//Launch the multi query and refresh the row Ids
	if (!$mysqli->multi_query($rowQuery)) {
		echo "$rowQuery";
		die("Couldn't delete old template_rows:" . mysql_error());
	} else {
		$currentIndex = 0;
		$isFirstResult = true;

		do{
			//As an update doesn't returns an id those entries already having an id have to be skipped
			while($currentIndex < count($data) && !(strcmp($data[$currentIndex]['templateRowId'], 'undefined') === 0)){
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

			$currentTemplateRowNo = $data[$currentIndex]['rowPos'];
			$lastTemplateRowNo = $currentTemplateRowNo;

			//Fill the elements' template rows ids as long as a new row begins
			while($lastTemplateRowNo === $currentTemplateRowNo){
				$data[$currentIndex]['templateRowId'] = $currentTemplateRowId;
				$lastTemplateRowNo = $currentTemplateRowNo;
				$currentIndex++;
				if($currentIndex === count($data)){break;}
				$currentTemplateRowNo = $data[$currentIndex]['rowPos'];
			}

		} while($mysqli->more_results());
	}

	//Flush results if there are still some
	while ($mysqli->next_result()) {;} // flush multi_queries

	//Create a new array that matches every row no (=rowposition) with an id
	$noAndIdArray = array();
	foreach($data as $currentContent) {
		array_push($noAndIdArray, array('rowPos' => $currentContent['rowPos'], 'templateRowId' => $currentContent['templateRowId']));
	}
	$returnData['noAndIdArray'] = $noAndIdArray;

	//7. Now create new template_row_content
	$templateRowContentQuery = '';

	foreach($data as $rowContent) {

		$contentText =  $mysqli->real_escape_string($rowContent['contentText']);
		$moduleColumnId = $mysqli->real_escape_string($rowContent['moduleColumnId']);
		$templateRowId = $rowContent['templateRowId'];

		//Enter content of in table template_row_content
		//First extract a maybe given number in [] brackets from TOM
		preg_match_all('/[\[][0-9]+[\]]/', $contentText, $out);
		$replaceNumberByTom = "";
		$noOfMatches = count($out[0]);
		$currentPosition = 0;
		for($i = $currentPosition; $i < $noOfMatches; $i++){
			$replaceNumberByTom .= $out[0][$i];
			if($i < $noOfMatches - 1)
				$replaceNumberByTom .= chr(10);
		}



	/* 	if (isset($out[0][0])){
			$replaceNumberByTom = $out[0][0];
		} else {
			$replaceNumberByTom = "";
		} */

		//Now build the query string
		$templateRowContentQuery .= "INSERT INTO template_row_content(TemplateRowId, ModuleColumnId, Value, ReplaceNumberByTom) VALUES ($templateRowId, $moduleColumnId, '$contentText', '$replaceNumberByTom'); ";
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
