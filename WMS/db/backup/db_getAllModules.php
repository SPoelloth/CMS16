<?php 
include("db_connect.php");

//$query  = "SELECT ml.id,ml.Size,e.defaultvalue, e.htmlcode FROM module_layout ml INNER JOIN element e ON ml.ElementID = e.id WHERE ml.ModuleID = ".$id." ORDER BY ml.ColumnPosition ASC";
//$query  = "SELECT ml.ModuleID,ml.ColumnPosition,ml.id,ml.Size,e.defaultvalue, e.htmlcode FROM module_layout ml INNER JOIN element e ON ml.ElementID = e.id ORDER BY ml.ModuleID, ml.ColumnPosition ASC";
$query  = "SELECT mc.ModuleId, mc.Position, mc.Id, mc.Size, e.DefaultValue, e.HtmlCode FROM module_column mc INNER JOIN element e ON mc.ElementId = e.Id ORDER BY mc.ModuleId, mc.Position ASC";

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