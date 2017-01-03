<?php
	include("db_connect.php");

	$id = $mysqli->real_escape_string($_POST['data']);
	$query  = 'SELECT mc.module_id, mc.id, mc.size, e.default_value, e.name AS element_name, e.html_code, e.id AS element_id
			   FROM   module_column mc INNER JOIN element e ON mc.element_id = e.id
			   WHERE  mc.module_id = ' . $id . '
			   ORDER BY mc.position ASC';

	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
	}

	$result->close();
	$mysqli->close();
?>
