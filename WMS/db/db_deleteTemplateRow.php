
<?php

	include("db_connect.php");	

	$templateRowId =  $mysqli->real_escape_string($_POST['templateRowId']);			
	$query  = "DELETE FROM template_row WHERE Id = $templateRowId";
	
	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
	}

	$result->close();
	$mysqli->close();

?>