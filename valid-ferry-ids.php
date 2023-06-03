<?php
    session_start();
    require("dbinfo.php");

    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
    $findFerryIDs = "SELECT page_id FROM ferries";
    $foundFerryIDs = $mysqli->query($findFerryIDs);

    while($row = mysqli_fetch_assoc($foundFerryIDs)){
        $foundFerryIDsArray[] = $row['page_id'];
    };

    echo json_encode($foundFerryIDsArray);
?>