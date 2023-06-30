<?php

session_start();
require("dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
$recievedData = file_get_contents('php://input');

if (!empty($recievedData)) {
    $processedData = $mysqli->real_escape_string(json_decode($recievedData));
    $ferriesDataQuery = "SELECT * FROM ferries WHERE name LIKE '%$processedData%' ORDER BY name ASC";
    $capturedFerriesData = $mysqli->query($ferriesDataQuery);
    $processedFerriesData = array();
    while ($singleFerry = mysqli_fetch_assoc($capturedFerriesData)) {
        $processedFerriesData[] = $singleFerry;
    };
};

echo json_encode($processedFerriesData);

?>