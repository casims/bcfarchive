<?php

session_start();
require("dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

$recievedData = file_get_contents('php://input');

if (!empty($recievedData)) {
    $processedData = $mysqli->real_escape_string(json_decode($recievedData));
    $terminalsDataQuery = "SELECT * FROM terminals WHERE name LIKE '%$processedData%'";
    $capturedTerminalsData = $mysqli->query($terminalsDataQuery);
    $processedTerminalsData = array();
        while ($singleTerminal = mysqli_fetch_assoc($capturedTerminalsData)) {
            $processedTerminalsData[] = $singleTerminal;
        };
};

echo json_encode($processedTerminalsData);

?>