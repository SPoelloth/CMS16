<?php
	include("db_connect.php");

	$templateId = $mysqli->real_escape_string($_POST['data']);
	$query = 'SELECT tr.row_num, mc.position, trc.module_column_id, trc.template_row_id, tr.module_id, e.id AS element_id,
						e.name AS element_name, tr.template_id, (SELECT username FROM user WHERE id = t.author_id ) AS username,
						(SELECT first_name FROM user WHERE id = t.author_id ) AS first_name, (SELECT last_name FROM user WHERE id = t.author_id ) AS last_name,
						trc.Value, mc.size, e.html_code, tr.color_code, t.name AS template_name,
						DATE_FORMAT(t.template_created, "%m/%d/%Y at %H:%i:%s") AS template_created
			  FROM template_row_content trc INNER JOIN template_row tr ON tr.id = trc.template_row_id
			  								INNER JOIN template t ON t.id = tr.template_id AND t.id = ' . $templateId . '
											INNER JOIN module_column mc ON trc.module_column_id = mc.id
											INNER JOIN element e ON e.id = mc.element_id
			  ORDER BY tr.row_num, mc.position ASC';

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
