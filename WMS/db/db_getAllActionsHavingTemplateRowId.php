<?php
	include("db_connect.php");	
	
	$templateRowId = $mysqli->real_escape_string($_POST['templateRowId']);
	$query  = "SELECT * FROM action WHERE TemplateRowId = $templateRowId ORDER BY ActionName";
	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
	}
	
	$result->close();
	$mysqli->close();
?>