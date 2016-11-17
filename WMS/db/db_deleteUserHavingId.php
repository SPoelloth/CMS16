
<?php

	include("db_connect.php");	

	$userId =  $mysqli->real_escape_string($_POST['data']);			
	$query  = "DELETE FROM user WHERE Id = '$userId'";
	
	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
	}

	$result->close();
	$mysqli->close();

?>