
<?php
	
	include("db_connect.php");
	
	$worksheetContents = json_decode($_POST['data'], true);
	$lastElement = end($worksheetContents);
	
	//As rows can be re-enabled and new values transferred, all old values should be deleted from the worksheet_content table.
	//For all radio-buttons and check-boxes
	//$insertMultiQuery = "DELETE FROM `worksheet_content` WHERE WorksheetId=" . $lastElement['worksheetId'] . " AND TemplateRowId=" . $lastElement['templateRowId'] . " AND Value='checked'; ";
	//For the check button if the row was skipped previously, then re-enabled and now filled with input
	//$insertMultiQuery .= "DELETE FROM `worksheet_content` WHERE WorksheetId=" . $lastElement['worksheetId'] . " AND TemplateRowId=" . $lastElement['templateRowId'] . " AND ModuleColumnId IN(SELECT mc.Id AS ModuleColumnId FROM element e RIGHT JOIN module_column mc ON e.Id = mc.ElementId WHERE e.Name = 'Check Button'); ";
	//For all text elements
	// foreach($worksheetContents as $content) {
		// $insertMultiQuery .= "DELETE FROM `worksheet_content` WHERE WorksheetId=" . $content['worksheetId'] . " AND TemplateRowId=" . $content['templateRowId'] . " AND ModuleColumnId=" . $content['moduleColumnId'] . "; ";
	// }
	$insertMultiQuery = "DELETE FROM `worksheet_content` WHERE WorksheetId=" . $lastElement['worksheetId'] . " AND TemplateRowId=" . $lastElement['templateRowId'] . "; ";
	
	//Create a multi insert query
	foreach($worksheetContents as $content) {
		$insertMultiQuery .= "INSERT INTO `worksheet_content` (ResponsiblePersonId, WorksheetId, TemplateRowId, ModuleColumnId, Value) VALUES (";
		$insertMultiQuery .= "(SELECT Id FROM `user` WHERE QtbNumber = '" . $content['responsiblePersonQtbNumber'] . "'), "; 
		$insertMultiQuery .= $content['worksheetId'] . ", " . $content['templateRowId'] . ", " . $content['moduleColumnId'] . ", '" .  $content['value'] . "'); ";
	}
	
	//Add an select to get the TimeStamp of the last inserted element	
	$insertMultiQuery .= "SELECT DATE_FORMAT(TimeStamp, '%m/%d/%Y at %H:%i:%s') FROM `worksheet_content` WHERE WorksheetId=" . $lastElement['worksheetId'] . " AND TemplateRowId=" . $lastElement['templateRowId'] . " AND ModuleColumnId=" . $lastElement['moduleColumnId'] . ";";

	//Check if the query worked and extract the TimeStamp
 	if (!$mysqli->multi_query($insertMultiQuery)) {
		echo "$insertMultiQuery\n";
		die("('INVALID QUERY!".mysql_error()."')");
		
	} else {		
 		while($mysqli->more_results()) {
			$mysqli->next_result();
		}
		if ($result = $mysqli->store_result()) {
			$row = $result->fetch_row();
			echo $row[0];	
			$result->free();
		} 
	} 
	
	$mysqli->close();

?>

