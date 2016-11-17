<?php 
	include("db_connect.php");

	$id = $mysqli->real_escape_string($_POST['data']);
	$query  = "SELECT mc.ModuleId, mc.Id, mc.Size, e.DefaultValue, e.Name AS ElementName, e.HtmlCode, e.Id AS eId FROM module_column mc INNER JOIN element e ON mc.ElementId = e.Id WHERE mc.ModuleId = ".$id." ORDER BY mc.Position ASC";
			  
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