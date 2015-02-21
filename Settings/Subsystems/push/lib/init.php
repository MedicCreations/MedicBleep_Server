<?php 

	/////////////////////////////////////////////////////////////////////////////////////
	// Database settings
	/////////////////////////////////////////////////////////////////////////////////////

    define("DB_HOST", 'localhost');
    define("DB_NAME", 'push_db');
    define("DB_USER", 'root');
    define("DB_PASS", 'cloverpass013');
	
	/////////////////////////////////////////////////////////////////////////////////////
	// Debug settings
	/////////////////////////////////////////////////////////////////////////////////////
	
	define('ShowErr',false);
	define('LogAccess',false);
	define('LogErr',false);
	define('LogQuery',false);
	
	/////////////////////////////////////////////////////////////////////////////////////
	// Pushnotification settings
	/////////////////////////////////////////////////////////////////////////////////////

    define("GCM_API_KEY", 'AIzaSyDccNnfu5tpyQASDT4xNV8BfI-fOGkOOeI');
    define("APN_DEV_CERT", __DIR__.'/apns-dev.pem');
    define("APN_PROD_CERT", __DIR__.'/apns-prod.pem');

	
	/////////////////////////////////////////////////////////////////////////////////////
	// QUEUE settings
	/////////////////////////////////////////////////////////////////////////////////////
	
	define('USE_QUEUE',true); // this should be false if you can't execute command
	define('MAX_REQUESTS_PER_INTERNAL',20);
	define('RELEASE_INTERVAL',1); // sec
	
	/////////////////////////////////////////////////////////////////////////////////////
	// SYSTEM settings
	/////////////////////////////////////////////////////////////////////////////////////

	define('PHP_COMMAND',"/usr/bin/php"); // apsolute path for php command
	define('ROOT_URL','https://www.spikaent.com/msg/spikaenterprise_web/Subsystems/push/');
	define('SP_TIMEOUT',20); // sec
	
	/////////////////////////////////////////////////////////////////////////////////////
	// ADMIN settings
	/////////////////////////////////////////////////////////////////////////////////////

	define('SHOW_SERVERSTAT',true); 
	define('ADMIN_USERNAME',"admin");
	define('ADMIN_PASSWORD',"password");
?>