<?php
	
	define("SELECT",1);
	define("UPDATE",2);
	define("INSERT",3);
	define("DELETE",4);
		
	/////////////////////////////////////////////////////////////
	// generate query
	/////////////////////////////////////////////////////////////
	function generateQuery($action,$table,$data,$where = '',$tail = ''){
		
		if($action == UPDATE){
					
			$valueAry = array();
			foreach($data as $key => $value){
				
				if(preg_match('/null/i',$value))
					$valueAry[] = "{$key} = null";
				else
					$valueAry[] = "{$key} = {$value}";			
			}
			
			$query = "UPDATE {$table} SET ";
			$query .= implode(" ,",$valueAry);
			$query .= " WHERE {$where} {$tail}";
			
			return $query;
		}
		
		if($action == INSERT){
					
			$keyAry = array();
			foreach($data as $key => $value){
				$keyAry[] = "{$key}";			
			}
			
			$valueKey = array();
			foreach($data as $key => $value){
				$valueKey[] = "{$value}";			
			}
			
			$query = "INSERT INTO {$table}( ";
			$query .= implode(", ",$keyAry);
			$query .= " ) VALUES ( '";
			$query .= implode("', '",$valueKey);
			$query .= "' ) ";
			
			return $query;
		}
		
		if($action == DELETE){
			
			$query = "DELETE FROM {$table}";
			$query .= " WHERE {$where} {$tail}";
			
			return $query;
		}
		
		if($action == SELECT){
		
			$query = "SELECT ";
			if(is_array($data)){
				$query .= implode(",",$data);
			}else{
				$query .= "*";
			}
			
			$query .= " FROM {$table}";
			$query .= " WHERE {$where} {$tail}";
			
			return $query;
		}
		
	}
	
	/////////////////////////////////////////////////////////////
	// execute query
	/////////////////////////////////////////////////////////////
	function executeQuery($conn,$query){
		
		$result = array();
		 
		if(!$conn)
			return false;
			
		$startTime = getMicrotime();
		$resultLink = mysqli_query($conn, $query);
		$finishTime = getMicrotime();
		
		if (!$resultLink) {
		   trigger_error("Invalid query: {$query} " . mysqli_error($conn),E_USER_WARNING);
		   $result = mysqli_error($conn);
		   
		}else{
			$message = round($finishTime - $startTime, 4) . "s\t" . $query;
			queryLog($message);
			
		}
		
		if($resultLink && (preg_match('/select/',$query) || preg_match('/SELECT/',$query))){
			
			while ($line = mysqli_fetch_array($resultLink, MYSQL_ASSOC)) {
				$result[] = $line;
			}
			
			mysqli_free_result($resultLink);
			
		}

		return $result;
	}
	
	/////////////////////////////////////////////////////////////
	// get db for user
	/////////////////////////////////////////////////////////////

	function connectToDB(){
	
		global $_DATABASES;

		$db_host = DB_HOST;
		$db_name = DB_NAME;

			
		//connect to db
// 		$link = mysql_connect($db_host, DB_USER, DB_PASS,true);
// 		if (!$link) {
// 		    trigger_error('Not connected : ' . mysql_error(),E_USER_WARNING);
// 		    return false;
// 		}

// 		$selectDbResult = mysql_select_db($db_name, $link);
// 		if (!$selectDbResult) {
// 		    trigger_error('Not connected : ' . mysql_error(),E_USER_WARNING);
// 		    $link = false;
// 		}

		$link = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
		
		if($link->connect_error)
			die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
		
		mysqli_set_charset($link, 'utf8');
		
		return $link;

	}
	
	// get information from settings table
	function getSettings(){
		
		global $_MASTERDB;
		
		$data = null;		
		$tmpData = executeQuery($_MASTERDB,"select * from settings");
		
		$data = array();
		foreach($tmpData as $row){
			$data[$row['s_key']] = $row['s_value'];
		}

		return $data;
	}
	
	function closeDB($link){
		mysqli_close($link);
	}
	
	function escp($link, $text){
		return mysqli_real_escape_string($link, $text);
	}
	
?>