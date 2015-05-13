<?php
	
	//test
	include("./lib/startup.php");
	
	$DB = connectToDB();
	
	$_POST = json_decode($HTTP_RAW_POST_DATA, true);
	
	$serviceProvidor = $_POST['type'];
	if (isset($_POST['android_push_token_members'])){
		$android_push_array = $_POST['android_push_token_members'];
	}
	
	if (isset($_POST['ios_push_token_members'])){
		$ios_push_array = $_POST['ios_push_token_members'];
	}
	
	$payload = $_POST['payload'];
	
	if(empty($serviceProvidor) ||
		empty($payload)){
			die('param error');
	}
	
	$serviceProvidor = urldecode($serviceProvidor);
// 	$token = urldecode($token);
	$payload = json_encode($payload);
// 	$payload = urldecode($payload);
	
	$state = STATE_WAIT; // waiting
	$queued = date("Y-m-d H:i:s",time());
	
	$start_time = time();
	
		if (isset($android_push_array)){
			$token='all';
			$query = generateQuery(INSERT,"queue",array(
					'service_provider' => escp($DB, $serviceProvidor),
					'token' => escp($DB, $token),
					'payload' => escp($DB, $payload),
					'state' => escp($DB, $state),
					'queued' => escp($DB, $queued)
			));
			
			executeQuery($DB,$query);
		}

		if (isset($ios_push_array)){
			foreach ($ios_push_array as $ios_push){
				$token=$ios_push['ios_push_token'];
				$token = urldecode($token);
				
				$badge = $ios_push['badge'];
				
				$payload = json_decode($payload, true);
				
				$payload['aps']['badge'] = (int) $badge;

				$payload = json_encode($payload);
				
				$query = generateQuery(INSERT,"queue",array(
						'service_provider' => escp($DB, $serviceProvidor),
						'token' => escp($DB, $token),
						'payload' => escp($DB, $payload),
						'state' => escp($DB, $state),
						'queued' => escp($DB, $queued)
				));
				
				executeQuery($DB,$query);
			}
		}
		
		
		processExists(QUEUE_MANAGER_NAME);
		
		if(!processExists(QUEUE_MANAGER_NAME)){
			exec(PHP_COMMAND . " " . QUEUE_MANAGER_NAME . " > /dev/null &");
			_log("manager start");
		}else{
		}
					
	mysqli_close($DB);
		

	die('ok');
?>