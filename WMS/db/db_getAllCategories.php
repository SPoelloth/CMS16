<?php
	include("db_connect.php");	
	
	$query  = "SELECT Id, Name FROM category";
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