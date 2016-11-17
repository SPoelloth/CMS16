<?php
	include("db_connect.php");	
	
	$qtbNumber =  $_POST['qtbNumber'];	
	$query = "SELECT ug.GroupName, u.QtbNumber, u.FirstName, u.LastName FROM user_group ug RIGHT JOIN user u ON ug.Id = u.UserGroupId HAVING u.QtbNumber = '$qtbNumber'"; 
	
	$myArray = array();
	if ($result = $mysqli->query($query)) {

		while($row = $result->fetch_array(MYSQL_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
	}
	
	$result->close();
	$mysqli->close();

?>