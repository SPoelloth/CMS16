<?php 
include("db_connect.php");


$id = $_POST['data'];
//$query  = "SELECT ml.id,ml.Size,e.defaultvalue, e.htmlcode FROM module_layout ml INNER JOIN element e ON ml.ElementID = e.id WHERE ml.ModuleID = ".$id." ORDER BY ml.ColumnPosition ASC";
$query  = "SELECT mc.ModuleId, mc.Id, mc.Size, e.DefaultValue, e.HtmlCode, e.Id AS eId FROM module_column mc INNER JOIN element e ON mc.ElementId = e.Id WHERE mc.ModuleId = ".$id." ORDER BY mc.Position ASC";
		  
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