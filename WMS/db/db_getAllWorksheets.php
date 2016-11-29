<?php
	include("db_connect.php");

	$progressStatus = $mysqli->real_escape_string($_POST['data']);
	$query = "SELECT (SELECT Username FROM user WHERE Id = wc.ResponsiblePersonId) AS Creator, w.Id AS WorksheetId, w.Name AS WorksheetName, w.CreationDate AS WorksheetCreationDate, w.TemplateId, tic.TotalInputCounts AS TotalInputCounts, cic.CurrentInputCounts AS CurrentInputCounts, (CurrentInputCounts/TotalInputCounts*100) AS Progress FROM worksheet_content wc RIGHT JOIN worksheet w ON w.Id = wc.WorksheetId LEFT JOIN total_input_counts tic ON tic.TemplateId = w.TemplateId LEFT JOIN current_input_counts cic ON cic.WorksheetId = w.Id GROUP BY w.Id HAVING Progress $progressStatus ORDER BY W.Name";

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
