<?php
	include("db_connect.php");	
	
	$actionId = $mysqli->real_escape_string($_POST['actionId']);
	//$actionResultRowQuery = "SELECT * FROM action_result_row arr LEFT JOIN action a ON arr.ActionId = a.Id HAVING a.Id=$actionId ORDER BY arr.OrderNo";
	//$actionResultElementQuery = "SELECT * FROM action_result_element are LEFT JOIN action a ON are.ActionId = a.Id HAVING a.Id=$actionId ORDER BY are.OrderNo";
	$actionQuery = "SELECT a.Id AS ActionId, a.TemplateRowId AS TriggerElementTemplateRowId, a.TriggerElementModuleColumnId, a.TriggerValueOperatorId, a.TriggerValue, a.ActionName, mc.ElementId AS TriggerElementElementId FROM action a LEFT JOIN module_column mc ON mc.Id = a.TriggerElementModuleColumnId HAVING a.Id=$actionId";
	$actionResultRowQuery = "SELECT * FROM action_result_row arr WHERE arr.ActionId=$actionId ORDER BY arr.OrderNo ";
	$actionResultElementQuery = "SELECT are.ActionResultModuleColumnId, mc.ElementId AS ActionResultElementElementId, are.ActionResultTemplateRowId, are.OrderNo, are.ActionResult, are.ActionResultInputValue FROM action_result_element are LEFT JOIN module_column mc ON mc.Id = are.ActionResultModuleColumnId WHERE are.ActionId=$actionId ORDER BY are.OrderNo";
	$returnData = null;	
		
	$actionArray = array();
	//Get the action itself
	if ($result = $mysqli->query($actionQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$actionArray[] = $row;
		}
		$returnData['actionArray'] = $actionArray;
	}		
				
 	$rowArray = array();
	//Get all affected rows
	if ($result = $mysqli->query($actionResultRowQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$rowArray[] = $row;
		}
		$returnData['rowArray'] = $rowArray;
	}
	
	$elementArray = array();
	//Get all affected elements
	if ($result = $mysqli->query($actionResultElementQuery)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$elementArray[] = $row;
		}		
		$returnData['elementArray'] = $elementArray;
	}	

	echo json_encode($returnData); 
	$result->close();
	$mysqli->close();
?>