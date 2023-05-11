<?php

session_start();
require("dbinfo.php");

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
if( mysqli_connect_errno() != 0 ){
    die("<p>Could not connect to database, Error code:".$mysqli->connect_error."</p>");	
}

$recievedData = file_get_contents('php://input');
if (!empty($recievedData)) {
    $processedData = json_decode($recievedData);

    $sortTypeArray = ['name', 'opened'];
    $sortOrderArray = ['DESC', 'ASC'];

    if ($processedData[0] === null) {
        $processedData[0] = 2;
    };

    $sortMethod = [$sortTypeArray[$processedData[0]], $sortOrderArray[$processedData[1]]];

    $terminalsDataQuery = "SELECT * FROM terminals ORDER BY $sortMethod[0] $sortMethod[1]";
    $capturedTerminalsData = $mysqli->query($terminalsDataQuery);
    $processedTerminalsData = array();
        while ($singleTerminal = mysqli_fetch_assoc($capturedTerminalsData)) {
            $processedTerminalsData[] = $singleTerminal;
        };
} else {
    $terminalsDataQuery = "SELECT * FROM terminals ORDER BY opened DESC";
    $capturedTerminalsData = $mysqli->query($terminalsDataQuery);
    $processedTerminalsData = array();
        while ($singleTerminal = mysqli_fetch_assoc($capturedTerminalsData)) {
            $processedTerminalsData[] = $singleTerminal;
        };
};

echo json_encode($processedTerminalsData);

?>