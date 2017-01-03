
<?php

	include("db_connect.php");

	$templateRowId =  $mysqli->real_escape_string($_POST['template_row_id']);
	$query  = "DELETE FROM template_row WHERE id = $templateRowId";

	if ($result = $mysqli->query($query)) {
		echo "Delete was successful!";
		$result->close();
	}

	$mysqli->close();

?>
