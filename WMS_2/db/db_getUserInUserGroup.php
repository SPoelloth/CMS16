<?php
	include("db_connect.php");

	$groupName =  $mysqli->real_escape_string($_POST['data']);
	$query = 'SELECT u.username, u.first_name, u.last_name, u.id, ug.group_name
			  FROM 	 user_group ug RIGHT JOIN user u ON ug.id = u.user_group_id
			  WHERE  ug.group_name = "' . $groupName . '"
			  ORDER BY u.first_name ASC';

	$rows = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
			array_push($rows, $row);
		}
		echo json_encode($rows);
	}

	$result->close();
	$mysqli->close();
?>
