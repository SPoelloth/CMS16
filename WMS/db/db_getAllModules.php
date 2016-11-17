<?php 
include("db_connect.php");

$query  = "SELECT mc.ModuleId, mc.Position, mc.Id, mc.Size, e.DefaultValue, e.HtmlCode, m.OrderToShow FROM module_column mc INNER JOIN element e ON mc.ElementId = e.Id LEFT JOIN module m ON mc.ModuleId = m.Id ORDER BY m.OrderToShow, mc.Position ASC ";

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