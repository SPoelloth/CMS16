<?php
	include("db_connect.php");	
	
	$elementId = $mysqli->real_escape_string($_POST['eid']);
	$query  = "SELECT * FROM trigger_value_operator WHERE ElementId = $elementId";
	
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