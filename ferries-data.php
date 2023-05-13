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

    $sortTypeArray = ['name', 'class', 'years_active_start', 'years_active_end', 'horsepower', 'max_speed', 'length', 'displacement', 'vehicle_capacity', 'passenger_capacity'];
    $sortOrderArray = ['DESC', 'ASC'];

    if ($processedData[0] === null) {
        $processedData[0] = 2;
    };

    $sortMethod = [$sortTypeArray[$processedData[0]], $sortOrderArray[$processedData[1]]];

    $ferriesDataQuery = "SELECT * FROM ferries ORDER BY $sortMethod[0] $sortMethod[1]";
    $capturedFerriesData = $mysqli->query($ferriesDataQuery);
    $processedFerriesData = array();
        while ($singleFerry = mysqli_fetch_assoc($capturedFerriesData)) {
            $processedFerriesData[] = $singleFerry;
        };
} else {
    $ferriesDataQuery = "SELECT * FROM ferries ORDER BY years_active_start DESC";
    $capturedFerriesData = $mysqli->query($ferriesDataQuery);
    $processedFerriesData = array();
        while ($singleFerry = mysqli_fetch_assoc($capturedFerriesData)) {
            $processedFerriesData[] = $singleFerry;
        };
};

echo json_encode($processedFerriesData);

?>