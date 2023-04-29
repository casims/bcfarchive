<?php

session_start();
require("dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
if( mysqli_connect_errno() != 0 ){
    die("<p>Could not connect to database, Error code:".$mysqli->connect_error."</p>");	
}

$recievedData = file_get_contents('php://input');
if ($recievedData) {
    $processedData = json_decode($recievedData);

    $sortTypeArray = ['name', 'opened'];
    $sortOrderArray = ['DESC', 'ASC'];

    if ($processedData[0] === null) {
        $processedData[0] = 2;
    };

    $sortMethod = array(
        "type" => $sortTypeArray[$processedData[0]]
    );

    $terminalsDataQuery = `SELECT * FROM terminals ORDER BY $sortMethod["type"] $sortMethod["order"]`;
    $capturedTerminalsData = $mysqli->query($terminalsDataQuery);
    $processedTerminalsData = array();
        while ($singleTerminal = mysqli_fetch_assoc($capturedTerminalsData)) {
            $processedTerminalsData[] = $singleTerminal;
        };
} else {
    $terminalsDataQuery = "SELECT * FROM terminals ORDER BY years_active_start DESC";
    $capturedTerminalsData = $mysqli->query($terminalsDataQuery);
    $processedTerminalsData = array();
        while ($singleTerminal = mysqli_fetch_assoc($capturedTerminalsData)) {
            $processedTerminalsData[] = $singleTerminal;
        };
};

echo json_encode($processedTerminalsData);

?>