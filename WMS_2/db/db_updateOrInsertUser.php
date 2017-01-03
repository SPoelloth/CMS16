<?php

	include("db_connect.php");

	$userInfo  =  $_POST['data'];
	$firstName = $mysqli->real_escape_string($userInfo['firstName']);
	$lastName  = $mysqli->real_escape_string($userInfo['lastName']);
	$username  = $mysqli->real_escape_string($userInfo['username']);
	$userGroup = $mysqli->real_escape_string($userInfo['userGroup']);
	$password  = $mysqli->real_escape_string($userInfo['password']);
	$userId    = isset($userInfo['userId']) ? $mysqli->real_escape_string($userInfo['userId']) : '';

	// A higher "cost" is more secure but consumes more processing power
	$cost = 10;

	// Create a random salt
	$salt = strtr(base64_encode(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM)), '+', '.');

	//hash the password with the salt
	$hash = crypt($password, $salt);

	if($userId === '') {
		$query = 'INSERT INTO user (username, password, salt, first_name, last_name, user_group_id)
				  VALUES	("' . $username . '", "' . $hash . '", "' . $salt . '", "' . $firstName . '", "' . $lastName . '", (SELECT id
				  																												FROM   user_group
																																WHERE  group_name = "' . $userGroup . '"))';
	} else {
		$query = 'UPDATE user
				  SET first_name= "' . $firstName . '",
				  	  last_name = "' . $lastName  . '",
					  username  = "' . $username  . '",
					  password  = "' . $hash      . '",
					  salt      = "' . $salt      . '",
					  user_group_id = (SELECT id
					  				   FROM user_group
									   WHERE group_name= "' . $userGroup . '")
				  WHERE id= ' . $userId;
	}

	if ($result = $mysqli->query($query)) {
		echo "Update was successful!";
	}

	$result->close();
	$mysqli->close();
?>
