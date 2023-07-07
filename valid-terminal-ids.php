<?php
    session_start();
    require(".dbinfo.php");

    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    $findTerminalIDs = "SELECT page_id FROM terminals";
    $foundTerminalIDs = $mysqli->query($findTerminalIDs);

    while($row = mysqli_fetch_assoc($foundTerminalIDs)){
        $foundTerminalIDsArray[] = $row['page_id'];
    };

    echo json_encode($foundTerminalIDsArray);
?>