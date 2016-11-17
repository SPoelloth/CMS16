<?php
	include("db_connect.php");	
	$templateId = $_POST['data'];
	$query = "SELECT tr.RowNo, mc.Position, trc.ModuleColumnId, trc.TemplateRowId, tr.ModuleId, e.Id AS ElementId, tr.TemplateId, (SELECT QtbNumber FROM `user` WHERE ID = t.AuthorId ) AS QtbNumber, (SELECT FirstName FROM `user` WHERE ID = t.AuthorId ) AS FirstName, (SELECT LastName FROM `user` WHERE ID = t.AuthorId ) AS LastName, t.CategoryId AS TemplateCategoryId, trc.Value, trc.ReplaceNumberByTom, mc.Size, e.HtmlCode, tr.ColorCode, t.Name AS TemplateName, DATE_FORMAT(t.TemplateCreated, '%m/%d/%Y at %H:%i:%s') AS TemplateCreated, t.No AS TemplateNo, t.VersionNo AS TemplateVersionNo, t.Status AS TemplateStatus, t.ValidFor AS TemplateValidFor FROM template_row_content trc INNER JOIN template_row tr ON tr.ID = trc.TemplateRowId INNER JOIN template t ON t.ID = tr.TemplateId AND t.ID = $templateId INNER JOIN module_column mc ON trc.ModuleColumnId = mc.ID INNER JOIN element e ON e.ID = mc.ElementId ORDER BY tr.RowNo, mc.Position ASC";
	$myArray = array();
	if ($result = $mysqli->query($query)) {

		while($row = $result->fetch_array(MYSQL_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);
	}
	
	$result->close();
	$mysqli->close();

?>