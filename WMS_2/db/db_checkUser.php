<?php
	include("db_connect.php");

	$username =  $mysqli->real_escape_string($_POST['username']);
  	$password =  $mysqli->real_escape_string($_POST['password']);

	$query = 'SELECT *
			  FROM user
			  WHERE username = "' . $username . '"';

	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
			$hash = $row['password'];
			$salt = $row['salt'];
			if(hash_equals($hash, crypt($password, $salt))) {
				$myArray[] = $row;
				break;
			}
		}
		if(sizeOf($myArray) == 1) echo "User exists!";
		$result->close();
	}
	$mysqli->close();
?>
