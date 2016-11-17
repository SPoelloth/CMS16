<?php

	include("db_connect.php");	
	
	$query  = "SELECT DATE_FORMAT(CURDATE(), '%Y') AS year";
	$myArray = array();
	if ($result = $mysqli->query($query)) {

		while($row = $result->fetch_array(MYSQL_ASSOC)) {
				$myArray[] = $row;
		}
//		$_SESSION["footer"] = "&copy; BMW 2015-" + myArray[0].year;
		echo json_encode($myArray);
	}
	
	$result->close();
	$mysqli->close();

?>