<?php
$dbhost							= "localhost";
$dbuser							= "root";
$dbpass							= "";
$dbname							= "wms";


$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

//$conn = mysql_connect($dbhost, $dbuser, $dbpass) or die ("Error connecting to database");
//mysql_select_db($dbname);
return $mysqli;
?>