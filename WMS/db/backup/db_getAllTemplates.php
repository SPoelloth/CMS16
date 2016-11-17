<?php
	include("db_connect.php");	
	
	$query  = "SELECT Id, Name, VersionNo, TemplateCreated, CanBeChanged FROM template ORDER BY LOWER(Name) ASC, Id DESC";
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