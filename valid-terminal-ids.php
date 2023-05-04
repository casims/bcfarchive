<?php
    session_start();
    require("dbinfo.php");

    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
    if(mysqli_connect_errno() != 0){
        die("<p>Could not connect to database, Error code:".$mysqli->connect_error."</p>");	
    }

    $findTerminalIDs = "SELECT page_id FROM terminals";
    $foundTerminalIDs = $mysqli->query($findTerminalIDs);

    while($row = mysqli_fetch_assoc($foundTerminalIDs)){
        $foundTerminalIDsArray[] = $row;
    };

    echo json_encode($foundTerminalIDsArray);
?>