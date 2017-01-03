<?php
	include("db_connect.php");

	$templateId = $mysqli->real_escape_string($_POST['data']);
	$templateId = (is_numeric($templateId)) ? $templateId : null;
	$query = 'SELECT t.id AS TemplateId, t.name AS TemplateName, w.id AS WebsiteId, w.name AS WebsiteName
			  FROM   template t INNER JOIN website w ON w.template_id = t.id
			  WHERE  t.id = ' . $templateId;

	$myArray = array();
	if ($result = $mysqli->query($query)) {
		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
			$myArray[] = $row;
		}
		$result->close();
	}
	echo json_encode($myArray);
	$mysqli->close();
?>
