<?php
$dbhost							= "localhost";
$dbuser							= "root";
$dbpass							= "";
$dbname							= "wms_2";

$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

// check connection
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

return $mysqli;
?>
