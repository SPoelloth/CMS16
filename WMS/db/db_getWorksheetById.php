<?php
	include("db_connect.php");	
	$worksheetId = $mysqli->real_escape_string($_POST['data']);
	
	$query = "SELECT tr.RowNo, mc.Position AS ColumnPosition, trc.ModuleColumnId, trc.TemplateRowId, tr.ModuleId, e.Id AS ElementId, (SELECT Name FROM element WHERE element.Id = e.Id) AS ElementName, tr.TemplateId, (SELECT Name FROM category c WHERE t.CategoryId = c.Id) AS TemplateCategory, trc.Value AS TemplateRowContentValue, trc.ReplaceNumberByTom, mc.Size AS ColumnSize, e.HtmlCode, e.isTypeInput, tr.ColorCode, t.Name AS TemplateName, t.No AS TemplateNo, t.VersionNo AS TemplateVersionNo, t.Status AS TemplateStatus, t.ValidFor AS TemplateValidFor, (SELECT QtbNumber FROM user u WHERE t.AuthorId = u.Id) AS TemplateAuthorQtbNumber, (SELECT FirstName FROM user u WHERE t.AuthorId = u.Id) AS TemplateAuthorFirstName, (SELECT LastName FROM user u WHERE t.AuthorId = u.Id) AS TemplateAuthorLastName, DATE_FORMAT(t.TemplateCreated, '%m/%d/%Y at %H:%i:%s') AS TemplateCreationDate, w.Name AS WorksheetName, DATE_FORMAT(w.CreationDate, '%m/%d/%Y at %H:%i:%s') AS WorksheetCreationDate, (SELECT QtbNumber FROM user u WHERE w.CreatorId = u.Id) AS WorksheetCreatorName, (SELECT QtbNumber FROM user u WHERE wc.ResponsiblePersonId = u.Id) AS WorksheetContentResponsiblePersonQtbNumber, (SELECT FirstName FROM user u WHERE wc.ResponsiblePersonId = u.Id) AS WorksheetContentResponsiblePersonFirstName, (SELECT LastName FROM user u WHERE wc.ResponsiblePersonId = u.Id) AS WorksheetContentResponsiblePersonLastName,wc.TimeStamp AS WorksheetContentTimeStamp, wc.Value AS WorksheetContentValue FROM template_row_content trc INNER JOIN template_row tr ON tr.ID = trc.TemplateRowId INNER JOIN template t ON t.ID = tr.TemplateId INNER JOIN module_column mc ON trc.ModuleColumnId = mc.ID INNER JOIN element e ON e.ID = mc.ElementId INNER JOIN worksheet w ON w.TemplateId = t.Id AND w.Id = $worksheetId LEFT JOIN worksheet_content wc ON wc.WorksheetId = w.Id AND wc.ModuleColumnId = mc.Id AND wc.TemplateRowId = tr.Id ORDER BY tr.RowNo, mc.Position ASC";

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