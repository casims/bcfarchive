<?php

$recievedData = file_get_contents('php://input');
$capturedPageID = json_decode($recievedData);

session_start();
require(".dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
$ferryDataQuery = "SELECT * FROM ferries WHERE page_id='$capturedPageID'";
$capturedFerryData = $mysqli->query($ferryDataQuery);
$processedFerryData = mysqli_fetch_assoc($capturedFerryData);

echo json_encode($processedFerryData);

?>