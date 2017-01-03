<?php
	include("db_connect.php");

	$query = 'SELECT (SELECT username
					  FROM user
					  WHERE id = wc.responsible_person_id) AS creator, w.id AS website_id,
					  w.name AS website_name, w.creation_date AS website_creation_date, w.template_id
			  FROM website_content wc RIGHT JOIN website w ON w.id = wc.website_id
			  GROUP BY w.id
			  ORDER BY w.name';

	$myArray = array();
	if ($result = $mysqli->query($query)) {

		while($row = $result->fetch_array(MYSQLI_ASSOC)) {
				$myArray[] = $row;
		}
		echo json_encode($myArray);

		$result->close();
	}
	$mysqli->close();

?>
