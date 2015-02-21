<?php
	
	//test
	include("./lib/startup.php");
	
	$DB = connectToDB();
	
	$_POST = stripBackSlash($_POST);
	
	if (isset($_POST['function'])){
		$function = $_POST['function'];
	} else {
		$function = "";
	}
	
	if ($function == 'get_queue_item_count'){
		
		$sql = "SELECT * FROM queue WHERE state = 1 OR state = 2";
		
		$result = mysqli_query($DB, $sql);
		
		$final_result = array();
		
		while ($row = mysqli_fetch_assoc($result)){
			
			array_push($final_result, $row);
			
		}
		
		$result = array('code' => '2000', 
				'queued_notifications' => $final_result);
		
		echo json_encode($result);
		
		die;
	}
	
	if ($function == 'get_average_waiting_time'){
		
		$sql = "SELECT AVG(sending_time) AS TimeAverage FROM queue";
		
		$result = mysqli_query($DB, $sql);
		$result = mysqli_fetch_assoc($result);
		
		$time = $result['TimeAverage'];
		
		$result = array('code' => '2000', 
				'time' => $time);
		
		echo json_encode($result);
		
		die;
	}
?>