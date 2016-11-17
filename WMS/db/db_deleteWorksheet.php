
<?php

	include("db_connect.php");	

	$worksheetId =  $mysqli->real_escape_string($_POST['data']);			
	$query  = "DELETE FROM worksheet WHERE Id = '$worksheetId'";
	
	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
	}

	$result->close();
	$mysqli->close();

?>