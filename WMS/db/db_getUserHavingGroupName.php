<?php
	include("db_connect.php");	
	
	$groupName =  $mysqli->real_escape_string($_POST['data']);	
	$query = "SELECT u.QtbNumber, u.FirstName, u.LastName, u.Id, ug.GroupName FROM user_group ug RIGHT JOIN user u ON ug.Id = u.UserGroupId WHERE ug.GroupName = '$groupName' ORDER BY u.FirstName ASC"; 
	
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