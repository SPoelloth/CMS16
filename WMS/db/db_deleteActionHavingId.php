
<?php

	include("db_connect.php");	

	$actionId =  $mysqli->real_escape_string($_POST['actionId']);			
	$query  = "DELETE FROM action WHERE Id = '$actionId'";
	
	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
	}

	$result->close();
	$mysqli->close();

?>