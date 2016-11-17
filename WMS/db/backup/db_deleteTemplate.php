
<?php

	include("db_connect.php");	

	$templateId =  $_POST['data'];			
	$query  = "DELETE FROM template WHERE Id = '$templateId'";
	
	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
	}

	$result->close();
	$mysqli->close();

?>