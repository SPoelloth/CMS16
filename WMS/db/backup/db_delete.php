<?php
$t= "../uploads/" . $_POST['name'];
echo $t;
unlink($t); 
?>