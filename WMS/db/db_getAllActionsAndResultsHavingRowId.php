<?php
	include("db_connect.php");	
	
	$actionResultRowId =  $mysqli->real_escape_string($_POST['actionResultRowId']);		
	
	$actionQuery = "SELECT a.TemplateRowId, a.ActionName FROM action a WHERE a.TemplateRowId = $actionResultRowId";
	$actionResultRowQuery = "SELECT arr.ActionId, arr.ActionResultRowValue, arr.ActionResultTemplateRowId, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_row arr LEFT JOIN action a ON arr.ActionId = a.Id WHERE arr.ActionResultTemplateRowId = $actionResultRowId";
	$actionResultElementQuery = "SELECT are.ActionId, are.ActionResultTemplateRowId, are.ActionResult, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_element are LEFT JOIN ACTION a ON are.ActionId = a.Id WHERE are.ActionResultTemplateRowId = $actionResultRowId";
	
	$returnData;
	
	$actionArray = array();
	if ($result = $mysqli->query($actionQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$actionArray[] = $row;
		}
		$returnData['actionArray'] = json_encode($actionArray);	
	}
	
	$actionResultRowArray = array();
	if ($result = $mysqli->query($actionResultRowQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$actionResultRowArray[] = $row;
		}
		$returnData['actionResultRowArray'] = json_encode($actionResultRowArray);
	}
	
	$actionResultElementArray = array();
	if ($result = $mysqli->query($actionResultElementQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$actionResultElementArray[] = $row;
		}
		$returnData['actionResultElementArray'] = json_encode($actionResultElementArray);
	}
	
	echo json_encode($returnData);
	
	$result->close();
	$mysqli->close();
?>