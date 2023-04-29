<?php

$recievedData = file_get_contents('php://input');
$capturedPageID = json_decode($recievedData);

session_start();
require("dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
if( mysqli_connect_errno() != 0 ){
    die("<p>Could not connect to database, Error code:".$mysqli->connect_error."</p>");	
}

$ferryDataQuery = "SELECT * FROM ferries WHERE page_id='$capturedPageID'";
$capturedFerryData = $mysqli->query($ferryDataQuery);
$processedFerryData = mysqli_fetch_assoc($capturedFerryData);

echo json_encode($processedFerryData);

?>