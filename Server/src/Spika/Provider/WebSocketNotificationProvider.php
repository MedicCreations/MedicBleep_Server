<?php
namespace Spika\Provider;

use Spika\Middleware\TokenChecker;
use Silex\Application;
use Silex\ServiceProviderInterface;

class WebSocketNotificationProvider implements ServiceProviderInterface
{
	private $_Socket = null;
    private $_Host = null;
    private $_Port = null;
    
 	public function register(Application $app)
	{
        $self = $this;
        
        $app['websocket_send'] = $app->protect(function ($data) use ($app,$self) {
            return $self->sendData($data);
        });
	}

	public function boot(Application $app)
	{
	}

	public function __destruct()
	{
		$this->_disconnect();
	}
 
	public function sendData($data)
	{
	    $this->_connect(WEBSOCKET_SERVER_HOST, WEBSOCKET_SERVER_PORT);

		// send actual data:
		fwrite($this->_Socket, "\x00" . $data . "\xff" ) or die('Error:' . $errno . ':' . $errstr); 
		$wsData = fread($this->_Socket, 2000);
		$retData = trim($wsData,"\x00\xff");  
		
        $this->_disconnect();
      
		return $retData;
	}
 
	private function _connect($host, $port)
	{
	
		$key1 = $this->_generateRandomString(32);
		$key2 = $this->_generateRandomString(32);
		$key3 = $this->_generateRandomString(8, false, true);		
 
		$header = "GET /echo HTTP/1.1\r\n";
		$header.= "Upgrade: WebSocket\r\n";
		$header.= "Connection: Upgrade\r\n";
		$header.= "Host: ".$host.":".$port."\r\n";
		$header.= "Origin: http://foobar.com\r\n";
		$header.= "Sec-WebSocket-Key1: " . $key1 . "\r\n";
		$header.= "Sec-WebSocket-Key2: " . $key2 . "\r\n";
		$header.= "\r\n";
		$header.= $key3;
 
 
		$this->_Socket = fsockopen($host, $port, $errno, $errstr, 2); 
		fwrite($this->_Socket, $header) or die('Error: ' . $errno . ':' . $errstr); 
		$response = fread($this->_Socket, 2000);
        
        stream_set_timeout($this->_Socket, 0, 100);
		/**
		 * @todo: check response here. Currently not implemented cause "2 key handshake" is already deprecated.
		 * See: http://en.wikipedia.org/wiki/WebSocket#WebSocket_Protocol_Handshake
		 */		
 
		return true;
	}
 
	private function _disconnect()
	{   
        if(is_resource($this->_Socket)) {
            fclose($this->_Socket);
        }
	    
	}
 
	private function _generateRandomString($length = 10, $addSpaces = true, $addNumbers = true)
	{  
		$characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"§$%&/()=[]{}';
		$useChars = array();
		// select some random chars:    
		for($i = 0; $i < $length; $i++)
		{
			$useChars[] = $characters[mt_rand(0, strlen($characters)-1)];
		}
		// add spaces and numbers:
		if($addSpaces === true)
		{
			array_push($useChars, ' ', ' ', ' ', ' ', ' ', ' ');
		}
		if($addNumbers === true)
		{
			array_push($useChars, rand(0,9), rand(0,9), rand(0,9));
		}
		shuffle($useChars);
		$randomString = trim(implode('', $useChars));
		$randomString = substr($randomString, 0, $length);
		return $randomString;
	}
}