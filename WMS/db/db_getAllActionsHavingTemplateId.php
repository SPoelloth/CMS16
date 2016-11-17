<?php
	include("db_connect.php");	
	
	$templateId =  $mysqli->real_escape_string($_POST['templateId']);		
	
	$actionResultElementQuery = "SELECT tr.TemplateId, tr.RowNo AS TriggerRowNo, a.TemplateRowId AS TriggerElementTemplateRowId, a.TriggerElementModuleColumnId, a.TriggerValueOperatorId, a.TriggerValue, a.ActionName, are.ActionResultModuleColumnId, are.ActionResultTemplateRowId, are.OrderNo, are.ActionResult, are.ActionResultInputValue, tr2.RowNo AS ActionResultRowNo FROM template_row tr RIGHT JOIN ACTION a ON tr.Id = a.TemplateRowId RIGHT JOIN action_result_element are ON are.ActionId = a.Id LEFT JOIN template_row tr2 ON tr2.Id = are.ActionResultTemplateRowId WHERE tr.TemplateId = $templateId ORDER BY a.ActionName, are.OrderNo ";
	$actionResultRowQuery = "SELECT tr.TemplateId, tr.RowNo AS TriggerRowNo, a.TemplateRowId AS TriggerElementTemplateRowId, a.TriggerElementModuleColumnId, a.TriggerValueOperatorId, a.TriggerValue, a.ActionName, arr.ActionResultTemplateRowId, arr.OrderNo, arr.ActionResultRowValue, tr2.RowNo AS ActionResultRowNo FROM template_row tr RIGHT JOIN action a ON tr.Id = a.TemplateRowId RIGHT JOIN action_result_row arr ON arr.ActionId = a.Id LEFT JOIN template_row tr2 ON tr2.Id = arr.ActionResultTemplateRowId WHERE tr.TemplateId = $templateId ORDER BY a.ActionName, arr.OrderNo ";
	
	$returnData;
	
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