<?php
	include("db_connect.php");

	$username =  $mysqli->real_escape_string($_POST['username']);

	$query = 'SELECT ug.group_name, u.user_group_id, u.username, u.first_name, u.last_name, u.id
			  FROM   user_group ug RIGHT JOIN user u ON ug.id = u.user_group_id
			  WHERE  u.username = "' . $username . '"';

	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$myArray[] = $row;
		}
		if(sizeOf($myArray) == 1) echo json_encode($myArray[0]);
		else echo json_encode($myArray);
	}

	$result->close();
	$mysqli->close();
?>
