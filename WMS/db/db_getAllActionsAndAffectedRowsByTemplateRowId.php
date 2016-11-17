<?php
	include("db_connect.php");	
	
	$templateRowId =  $mysqli->real_escape_string($_POST['templateRowId']);		
	
	$actionQuery = "SELECT a.Id, a.TemplateRowId, a.TriggerElementModuleColumnId, a.TriggerValueOperatorId, a.TriggerValue, a.ActionName, tvo.TriggerOperator, tvo.ElementId FROM action a LEFT JOIN trigger_value_operator tvo ON tvo.Id = a.TriggerValueOperatorId WHERE a.TemplateRowId = $templateRowId ORDER BY Id ";
	$actionResultRowQuery = "SELECT arr.ActionId, arr.ActionResultRowValue, arr.ActionResultTemplateRowId, arr.OrderNo, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_row arr LEFT JOIN ACTION a ON arr.ActionId = a.Id WHERE arr.ActionId = (SELECT Id FROM action WHERE TemplateRowId = $templateRowId) ORDER BY arr.ActionId, arr.OrderNo";
	$actionResultElementQuery = "SELECT are.ActionId, are.ActionResultTemplateRowId, are.ActionResultModuleColumnId, are.OrderNo, are.ActionResult, are.ActionResultInputValue, a.ActionName, a.TemplateRowId AS ActionOriginTemplateRowId FROM action_result_element are LEFT JOIN ACTION a ON are.ActionId = a.Id WHERE are.ActionId = (SELECT Id FROM action WHERE TemplateRowId = $templateRowId) ORDER BY are.ActionId, are.OrderNo";
	
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