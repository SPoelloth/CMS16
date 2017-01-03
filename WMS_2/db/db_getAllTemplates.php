<?php
	include("db_connect.php");

	$query  = 'SELECT id, name, template_created
			   FROM template
			   ORDER BY LOWER(name) ASC, id DESC';
	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
		$result->close();
	}
	$mysqli->close();
?>
