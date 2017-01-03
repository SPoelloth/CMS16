
<?php

	include("db_connect.php");

	$userId =  $mysqli->real_escape_string($_POST['data']);
	if(is_numeric($userId)) {
		$query  = 'DELETE FROM user WHERE id = ' . $userId;

		if ($result = $mysqli->query($query)) {
			echo "Delete was successful!";
		}

		$result->close();

	}

	$mysqli->close();

?>
