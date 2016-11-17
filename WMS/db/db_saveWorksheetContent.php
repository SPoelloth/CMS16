
<?php
	
	include("db_connect.php");
	
	$worksheetContents = json_decode($_POST['data'], true);
	$lastElement = end($worksheetContents);
	
	//As rows can be re-enabled and new values transferred, all old values should be deleted from the worksheet_content table.
	$insertMultiQuery = "DELETE FROM `worksheet_content` WHERE WorksheetId=" . $mysqli->real_escape_string($lastElement['worksheetId']) . " AND TemplateRowId=" . $mysqli->real_escape_string($lastElement['templateRowId']) . " AND ResponsiblePersonId <> (SELECT Id FROM user WHERE QtbNumber='TOM_AUTOFILL'); ";
	
	//Create a multi insert query
	foreach($worksheetContents as $content) {
		$insertMultiQuery .= "INSERT INTO `worksheet_content` (ResponsiblePersonId, WorksheetId, TemplateRowId, ModuleColumnId, Value) VALUES (";
		$insertMultiQuery .= "(SELECT Id FROM `user` WHERE QtbNumber = '" . $mysqli->real_escape_string($content['responsiblePersonQtbNumber']) . "'), "; 
		$insertMultiQuery .= $mysqli->real_escape_string($content['worksheetId']) . ", " . $mysqli->real_escape_string($content['templateRowId']) . ", " . $mysqli->real_escape_string($content['moduleColumnId']) . ", '" .  $mysqli->real_escape_string($content['value']) . "'); ";
	}
	
	//Add an select to get the TimeStamp of the last inserted element	
	$insertMultiQuery .= "SELECT DATE_FORMAT(TimeStamp, '%m/%d/%Y at %H:%i:%s') FROM `worksheet_content` WHERE WorksheetId=" . $mysqli->real_escape_string($lastElement['worksheetId']) . " AND TemplateRowId=" . $mysqli->real_escape_string($lastElement['templateRowId']) . " AND ModuleColumnId=" . $mysqli->real_escape_string($lastElement['moduleColumnId']) . ";";

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

