
<?php

	include("db_connect.php");

	$userInfo =  $_POST['data'];
	$firstName = $mysqli->real_escape_string($userInfo['firstName']);
	$lastName = $mysqli->real_escape_string($userInfo['lastName']);
	$username = $mysqli->real_escape_string($userInfo['username']);
	$userGroup = $mysqli->real_escape_string($userInfo['userGroup']);
	$password = $mysqli->real_escape_string($userInfo['password']);
	$userId = isset($userInfo['userId']) ? $mysqli->real_escape_string($userInfo['userId']) : '';

	// A higher "cost" is more secure but consumes more processing power
	$cost = 10;

	// Create a random salt
	$salt = strtr(base64_encode(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM)), '+', '.');

	//hash the password with the salt
	$hash = crypt($password, $salt);

	if($userId === '') {
		$query = "INSERT INTO user (Username, Password, Salt, FirstName, LastName, UserGroupId) VALUES	('$username', '$hash', '$salt', '$firstName', '$lastName', (SELECT Id FROM user_group WHERE GroupName = '$userGroup'))";
	} else {
		$query = "UPDATE user SET FirstName='$firstName', LastName='$lastName', Username='$username', Password='$hash', Salt='$salt', UserGroupId=(SELECT Id from user_group WHERE GroupName='$userGroup') WHERE Id='$userId'";
	}

	if ($result = $mysqli->query($query)) {
		echo "Update was successful!";
	}

	$result->close();
	$mysqli->close();
?>
