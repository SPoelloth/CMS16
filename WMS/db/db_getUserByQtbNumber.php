<?php
	include("db_connect.php");	
	
	$qtbNumber =  $mysqli->real_escape_string($_POST['qtbNumber']);	
	$query = "SELECT ug.GroupName, u.UserGroupId, u.QtbNumber, u.FirstName, u.LastName, u.Id FROM user_group ug RIGHT JOIN user u ON ug.Id = u.UserGroupId HAVING u.QtbNumber = '$qtbNumber'"; 
	
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