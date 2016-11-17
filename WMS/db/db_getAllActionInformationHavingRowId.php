<?php
	include("db_connect.php");	
	
	$templateRowId =  $mysqli->real_escape_string($_POST['templateRowId']);		
	
	$actionQuery = "SELECT a.TemplateRowId, a.ActionName FROM action a WHERE a.TemplateRowId = $templateRowId";
	$actionResultRowQuery = "SELECT arr.ActionId, arr.ActionResultRowValue, arr.ActionResultTemplateRowId, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_row arr LEFT JOIN action a ON arr.ActionId = a.Id WHERE a.TemplateRowId = $templateRowId ORDER BY a.Id";
	$actionResultElementQuery = "SELECT are.ActionId, are.ActionResultTemplateRowId, are.ActionResult, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_element are LEFT JOIN action a ON are.ActionId = a.Id WHERE a.TemplateRowId = $templateRowId ORDER BY a.Id";
	$affectedRowQuery = "SELECT arr.ActionId, arr.ActionResultTemplateRowId, arr.OrderNo, arr.ActionResultRowValue, a.TemplateRowId AS ActionOriginTemplateRowId, a.ActionName FROM action_result_row arr LEFT JOIN action a ON arr.ActionId = a.Id WHERE arr.ActionResultTemplateRowId = $templateRowId";
	$affectedElementQuery = "SELECT are.ActionId, are.ActionResultTemplateRowId, are.OrderNo, are.ActionResult, a.TemplateRowId AS ActionOriginTemplateRowId, a.ActionName FROM action_result_element are LEFT JOIN ACTION a ON are.ActionId = a.Id WHERE are.ActionResultTemplateRowId = $templateRowId";
	
	
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
	
	$affectedRowArray = array();
	if ($result = $mysqli->query($affectedRowQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$affectedRowArray[] = $row;
		}
		$returnData['affectedRowArray'] = json_encode($affectedRowArray);
	}	
	
	$affectedElementArray = array();
	if ($result = $mysqli->query($affectedElementQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$affectedElementArray[] = $row;
		}
		$returnData['affectedElementArray'] = json_encode($affectedElementArray);
	}		
	
	
	echo json_encode($returnData);
	
	$result->close();
	$mysqli->close();
?>