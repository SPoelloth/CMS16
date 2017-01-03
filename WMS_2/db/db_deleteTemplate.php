
<?php

	include("db_connect.php");

	$templateId =  $mysqli->real_escape_string($_POST['data']);
	$query  = 'DELETE FROM template
			   WHERE id = ' . $templateId;

	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";		
		$result->close();
	}
	$mysqli->close();

?>
