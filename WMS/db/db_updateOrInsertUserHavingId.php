
<?php

	include("db_connect.php");	

	$userInfo =  $_POST['data'];
	$firstName = $mysqli->real_escape_string($userInfo['firstName']);
	$lastName = $mysqli->real_escape_string($userInfo['lastName']);
	$qtbNumber = $mysqli->real_escape_string($userInfo['qtbNumber']);
	$userGroup = $mysqli->real_escape_string($userInfo['userGroup']);
	$userId = isset($userInfo['userId']) ? $mysqli->real_escape_string($userInfo['userId']) : '';
	if($userId === '') {
		$query = "INSERT INTO user (QtbNumber, FirstName, LastName, UserGroupId) VALUES	('$qtbNumber', '$firstName', '$lastName', (SELECT Id FROM user_group WHERE GroupName = '$userGroup'))";
	} else {
		$query = "UPDATE user SET FirstName='$firstName', LastName='$lastName', QtbNumber='$qtbNumber', UserGroupId=(SELECT Id from user_group WHERE GroupName='$userGroup') WHERE Id='$userId'";
	}
	
	if ($result = $mysqli->query($query)) {
		echo "Update was successful!";
	}

	$result->close();
	$mysqli->close();
?>