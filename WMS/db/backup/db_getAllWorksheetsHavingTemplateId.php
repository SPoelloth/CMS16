<?php
	include("db_connect.php");	
	
	$templateId = $_POST['data'];
	$query = "SELECT t.Id AS TemplateId, t.Name AS TemplateName, w.Id AS WorksheetId, w.Name AS WorksheetName FROM template t INNER JOIN worksheet w ON w.TemplateId = t.Id AND t.Id = '$templateId'";
	
	$myArray = array();
	if ($result = $mysqli->query($query)) {

		while($row = $result->fetch_array(MYSQL_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
	}
	
	$result->close();
	$mysqli->close();

?>