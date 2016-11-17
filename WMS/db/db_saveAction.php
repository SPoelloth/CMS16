<?php 

	include("db_connect.php");	

	//Variables needed for the inserts
	$actionName = $mysqli->real_escape_string($_POST['actionName']);
	$actionCreatorQtb = $mysqli->real_escape_string($_POST['actionCreatorQtb']);
	$actionId = $mysqli->real_escape_string($_POST['actionId']);
	$actionId = (strcmp($actionId, "undefined") === 0 ? NULL : $actionId);
	$triggerElement = $_POST['triggerElement'];
	$affectedRowsArray = (is_string($_POST['affectedRowsArray']) ? NULL : $_POST['affectedRowsArray']);
	$affectedElementsArray = (is_string($_POST['affectedElementsArray']) ? NULL : $_POST['affectedElementsArray']);

	//CREATE OR UPDATE THE ACTION FIRST FOR ITS ID
	$actionQuery = "";
	//It's a new action
	if(is_null($actionId)){
		$actionQuery .= "INSERT INTO action(TemplateRowId, TriggerElementModuleColumnId, TriggerValueOperatorId, TriggerValue, ActionCreatorId, ActionName) VALUES(";
		$actionQuery .= $mysqli->real_escape_string($triggerElement['trid']) . ", " . $mysqli->real_escape_string($triggerElement['mcid']) . ", ";
		$actionQuery .= $mysqli->real_escape_string($triggerElement['triggerOperatorId']) . ", '" . $mysqli->real_escape_string($triggerElement['triggerValue']) . "', ";
		$actionQuery .= "(SELECT Id FROM user WHERE QtbNumber = '" . $actionCreatorQtb . "'), '" . $actionName . "')";
		
	//It's an update
	} else {
		$actionQuery .= "UPDATE action SET TemplateRowId=" . $mysqli->real_escape_string($triggerElement['trid']) . ", TriggerElementModuleColumnId=" . $mysqli->real_escape_string($triggerElement['mcid']);
		$actionQuery .= ", TriggerValueOperatorId=" . $mysqli->real_escape_string($triggerElement['triggerOperatorId']) . ", TriggerValue='" . $mysqli->real_escape_string($triggerElement['triggerValue']);
		$actionQuery .= "', ActionCreatorId=(SELECT Id FROM user WHERE QtbNumber='" . $actionCreatorQtb . "'), ActionName='" . $actionName . "' WHERE Id=" . $actionId;	
	}
	//Execute Query
	$result = $mysqli->query($actionQuery);
	if(!$result) {
		echo "$actionQuery";
		die("Couldn't create or update action:" . mysql_error());
	}	
	//Save actionId for further use	if it was an insert
	if(is_null($actionId)){
		$actionId = $mysqli->insert_id;	
	//Otherwise delete all old entries linked to this action in the action_result_element and action_result_row table
	} else {
		$deleteQuery = "DELETE FROM action_result_element WHERE ActionId=" . $actionId . "; ";
		$deleteQuery .= "DELETE FROM action_result_row WHERE ActionId=" . $actionId . ";";
		//Run multi-query
		if (!$mysqli->multi_query($deleteQuery)) {
			echo "$deleteQuery";
			die("Couldn't delete affected action rows and elements from DB:" . mysql_error());
		} else {
			while ($mysqli->next_result()) {;} // flush multi_queries
		}
	}
	
	$insertAffectedRowsAndElementsQuery = "";
	//NOW INSERT ALL AFFECTED ROWS
	if(!is_null($affectedRowsArray)){
		foreach ($affectedRowsArray as $affectedRow) {	
			$insertAffectedRowsAndElementsQuery .= "INSERT INTO action_result_row(ActionId, ActionResultTemplateRowId, OrderNo, ActionResultRowValue) VALUES(";
			$insertAffectedRowsAndElementsQuery .= 	$actionId . ", " . $mysqli->real_escape_string($affectedRow['trid']) . ", "	. $mysqli->real_escape_string($affectedRow['orderNo']);
			$insertAffectedRowsAndElementsQuery .= ", '" . $mysqli->real_escape_string($affectedRow['actionResult']) . "'); ";
		}
	}
	
	//NOW INSERT ALL AFFECTED ELEMENTS
	if(!is_null($affectedElementsArray)){
		foreach ($affectedElementsArray as $affectedElement) {	
			$insertAffectedRowsAndElementsQuery .= "INSERT INTO action_result_element(ActionId, ActionResultModuleColumnId, ActionResultTemplateRowId, OrderNo, ";
			$insertAffectedRowsAndElementsQuery .= "ActionResult, ActionResultInputValue) VALUES(" . $actionId . ", ";
			$insertAffectedRowsAndElementsQuery .= $mysqli->real_escape_string($affectedElement['mcid']) . ", " . $mysqli->real_escape_string($affectedElement['trid']);
			$insertAffectedRowsAndElementsQuery .= ", " . $mysqli->real_escape_string($affectedElement['orderNo']); 
			$insertAffectedRowsAndElementsQuery .= ", '" . $mysqli->real_escape_string($affectedElement['actionResult']) . "', ";
			//Add NULL or the input value as ActionResultInputValue if the affected element is an input
			if(strcmp($mysqli->real_escape_string($affectedElement['actionResult']), 'insertElement') === 0){
				$insertAffectedRowsAndElementsQuery .= "'" . $mysqli->real_escape_string($affectedElement['actionResultInputValue']) . "'); ";
			} else {
				$insertAffectedRowsAndElementsQuery .= "NULL); ";
			}		
		}
	}
	
	//Run multi-query for the rows and elements
	if (!$mysqli->multi_query($insertAffectedRowsAndElementsQuery)) {
		echo "$insertAffectedRowsAndElementsQuery";
		die("Couldn't insert affected action rows and elements in DB:" . mysql_error());
	} else {
		while ($mysqli->next_result()) {;} // flush multi_queries
	}	
	
	$returnData['actionId'] = $actionId;
	echo json_encode($returnData);
	$mysqli->close();

?>