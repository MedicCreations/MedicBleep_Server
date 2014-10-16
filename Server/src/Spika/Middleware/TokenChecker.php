<?php

namespace Spika\Middleware;

use Spika\Db\DbInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Spika\Db\MySqlDb;

class TokenChecker {
	private $mySql;
	public function __construct() {
		$this->mySql = new MySqlDb ();
	}
	public function __invoke(Request $request, \Silex\Application $app) {
	
// 		$requestBodyAry = array();
		
// 		if (0 === strpos ( $request->headers->get ( 'Content-Type' ), 'application/json' )) {
// 			$requestBodyAry = json_decode ( str_replace ( "'", "", $request->getContent () ), true );
// 			$request->request->replace ( is_array ( $requestBodyAry ) ? $requestBodyAry : array () );
// 		}
		
// 		if (array_key_exists('token', $requestBodyAry)){
// 			$tokenReceived = $requestBodyAry['token'];
// 		}
		
// 		if (! isset ( $tokenReceived )) {
// 			$tokenReceived = $request->query->get ( 'Token' );
// 		}
		
		$token_received  = $request->headers->get('Token');
		
		if ($token_received!=TOKEN_DEFAULT){
			$user = $this->mySql->getUserByToken($app, $token_received);
			
			if (is_array ( $user )) {
				$tokenTimestamp = $user ['token_timestamp'];
				$currentTimestamp = time ();
				$tokenTime = $tokenTimestamp + TOKEN_VALID_TIME;
					
				if ($tokenTime < $currentTimestamp) {
					// $app['monolog']->addInfo(sprintf("Token expireeeeeeeeeed"));
					return $this->abortManually ( "Token expired", ER_TOKEN_EXPIRED, 403 );
				}
				
				
// 				if ($user['is_blocked'] == 1){
// 					return $this->abortManually("Your account is blocked", "1021", 200);
// 				}
					
				// $currentURL = $request->getPathInfo();
				// if ($currentURL != '/api/user/clientRequest'){
				// if ($user['blocked']){
				// $app['monolog']->addInfo(sprintf("ACC blockeeeeeeeeeeeeeeeeed"));
				// return $this->abortManually("Your account is blocked", "1021", 200);
				// }
				// }
					
				$app ['user'] = $user;
				$app ['organization_id'] = $user['organization_id'];
					
					
			} else {
				// $app['monolog']->addInfo(sprintf("Token invaliiiiiiiiiiiiiiiiiiiiiid"));
				return $this->abortManually ( "Invalid token", ER_INVALID_TOKEN, 403 );
			}
		}
		
		
		
		
	}
	private function abortManually($errMessage, $error_code, $status_code) {
		$arr = array (
				'message' => $errMessage,
				'code' => $error_code 
		);
		$json = json_encode ( $arr );
		
		return new Response ( $json, $status_code );
	}
}