<?php


function udate($format, $utimestamp = null) {
  if (is_null($utimestamp))
    $utimestamp = microtime(true);

  $timestamp = floor($utimestamp);
  $milliseconds = round(($utimestamp - $timestamp) * 10000);

  return date(preg_replace('`(?<!\\\\)u`', $milliseconds, $format), $timestamp);
}

$ds          = DIRECTORY_SEPARATOR;

$storeFolder = '../uploads';

if (!empty($_FILES)) {

    $tempFile = $_FILES['file']['tmp_name'];

    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds;

	$targetFile =  $targetPath.$_FILES['file']['name'];
 	$file_exists = file_exists ( $targetFile );

        if( !$file_exists ) //If file does not exists then upload
        {
            move_uploaded_file( $tempFile, $targetFile );
        }
        else //If file exists then echo the error and set a http error response
        {
            echo 'Error: Duplicate file name, please change it!';
            http_response_code(404);
        }

    move_uploaded_file($tempFile,$targetFile);

}else {
    $result  = array();

    $files = scandir($storeFolder);
    if ( false!==$files ) {
        foreach ( $files as $file ) {
            if ( '.'!=$file && '..'!=$file) {
                $obj['name'] = $file;
                $obj['size'] = filesize($storeFolder.$ds.$file);
                $result[] = $obj;
            }
        }
    }

    header('Content-type: text/json');
    header('Content-type: application/json');
    echo json_encode($result);
}
?>
