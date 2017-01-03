<?php
include("db_connect.php");

$query  = 'SELECT mc.module_id, mc.position, mc.id, mc.size, e.default_value, e.html_code, m.order_to_show
           FROM   module_column mc INNER JOIN element e ON mc.element_id = e.id
                                   LEFT JOIN  module m  ON mc.module_id  = m.id
           ORDER BY m.order_to_show, mc.position ASC';

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
