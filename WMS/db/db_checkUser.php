<?php
	include("db_connect.php");

	$username =  $mysqli->real_escape_string($_POST['username']);
  $password =  $mysqli->real_escape_string($_POST['password']);

	$query = "SELECT ug.GroupName, u.UserGroupId, u.Username, u.Password, u.Salt, u.FirstName, u.LastName, u.Id FROM user_group ug RIGHT JOIN user u ON ug.Id = u.UserGroupId HAVING u.Username = '$username'";

	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
			  $hash = $row['Password'];
				$salt = $row['Salt'];
				if(hash_equals($hash, crypt($password, $salt))) {
					$myArray[] = $row;
				}
		}
		echo json_encode($myArray);
	}

	$result->close();
	$mysqli->close();
?>
