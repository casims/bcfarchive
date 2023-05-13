<?php
    session_start();
    require("dbinfo.php");

    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
    if(mysqli_connect_errno() != 0) {
        die("<p>Could not connect to database, Error code:".$mysqli->connect_error."</p>");	
    }

    $findFerryIDs = "SELECT page_id FROM ferries";
    $foundFerryIDs = $mysqli->query($findFerryIDs);

    while($row = mysqli_fetch_assoc($foundFerryIDs)){
        $foundFerryIDsArray[] = $row['page_id'];
    };

    echo json_encode($foundFerryIDsArray);
?>