<?php
	
namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;
	
	
class OCRController extends SpikaBaseController {	
	
	public function connect(Application $app) {
		
		parent::connect($app);
		
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];

		$controllers->post('password/forgot',function(Request $request) use ($app, $self, $mySql){
			
			$result;
			
			$paramsAry = $request->query->all();
			
			if(array_key_exists('user_id', $paramsAry)){
				$user_id = $paramsAry['user_id'];
			}
			
			if(isset($user_id)){
				
				$OCRuser = $mySql->selectOCRuser($app, $user_id);
				
				if(is_array($OCRuser)){

// 					print_r($OCRuser);
					
					if (empty($OCRuser['email'])){
						$result = array('code' => ER_EMAIL_MISSING,
							'message' => 'Your email is missing');
						return $app->json($result, 200);	
					}
					
					$temp_pass = $mySql->createTempPassword($app, $OCRuser['id']);
					$body = sprintf($this->lang['forgotpassword_email_body'], $OCRuser['username'], $temp_pass);
					echo("Body :" . $body);
					$subject = $this->lang['forgotpassword_email_subject'];
					echo("Subject :" . $subject);
										
					$self->sendEmail($OCRuser['email'],$subject,$body);
					
					$result = array(
						'code' => CODE_SUCCESS,
						'message' => 'OK'
					);
				
				}else{
					$result = array(
						'code' => ER_DEFAULT,
						'message' => 'No such user'
					);
				}
				
			}else{
				$result = array(
					'code' => ER_DEFAULT,
					'message' => 'Missing user ID.'
				);
			}
			
			
			
			return $app->json($result,200);
			
		});
		
		//OCR password update
		$controllers->post('password/update', function(Request $request) use ($app, $self, $mySql){

			$result= null;
			$new_password = null;
			$user_id = null;
			$temp_pass = null;
			
			$body = $request->getContent();
			
			$paramsAry = json_decode($body,true);
			$app['monolog']->addDebug("---  " . print_r($paramsAry,true) . "  ---");
			
			if(array_key_exists('temp_password', $paramsAry)){
				$temp_pass = $paramsAry['temp_password'];
			}
			
			if(array_key_exists('new_password', $paramsAry)){
				$new_password = $paramsAry['new_password'];	
			}
			
			if(array_key_exists('user_id', $paramsAry)){
				$user_id = $paramsAry['user_id'];
			}
			
			if(is_null($new_password) || is_null($user_id)){
				$result = $result = array(
					'code' => ER_DEFAULT,
					'message' => 'Missing parameter user_id/new_password for password/update'
				);								
			}
			
			
			if(is_null($result) && is_null($temp_pass)){
				
				$OCRuser = $mySql->selectOCRuser($app, $user_id);
				
				$passwordExist = $mySql->checkPassword($app, $OCRuser['username'], $new_password);
				
				if($passwordExist){
					$result = array(
						'code' => ER_PASSWORD_EXIST,
						'message' => 'Password already exist');
					return $app->json($result, 200);
				}
				
				$mySql->updateUserMst($app, $OCRuser['id'], array('password' => $new_password));
				$mySql->updatePassword($app, $OCRuser['id'], $new_password);
				
				$result = array('code' => CODE_SUCCESS,
								'message' => 'OK');
			}else{
				
				$mySql->createTempPasswordFromOCR($app, $user_id, $new_password);
				
				$result = array('code' => CODE_SUCCESS,
				'message' => 'OK');
			}
			
			return $app->json($result, 200);
		});
		
		$controllers->post('profile/update', function(Request $request) use ($app, $self, $mySql){
			
			$body = $request->getContent();
            $app['monolog']->addDebug("\n****** OCR PROFILE UPDATE *******");
			
			$profileData = json_decode($body,true);
			$app['monolog']->addDebug("---  " . print_r($profileData,true) . "  ---");			
			
			if(isset($profileData["id"])){
				
				$mySql->updateOCRUser($app, $profileData);
				
// 				echo($profileData['image']);
				
				//download profile photo
				$app['monolog']->addDebug("---  Image: " . $profileData['image'] . "  ---");	
				if(isset($profileData['image']) && !is_null($profileData['image'])){
// 					echo "downloading image";
					$self->getOCRuserImage($app, $profileData['image']);
				}

// 				echo($profileData['thumb_image']);				
				//download photo thumb
				$app['monolog']->addDebug("---  Thumb: " . $profileData['image_thumb'] . "  ---");	
				if(isset($profileData['image_thumb']) && !is_null($profileData['image_thumb'])){
// 					echo "downloading thumb_image";
					$self->getOCRuserThumbImage($app, $profileData['image_thumb']);
				}
				
				$result = array('code' => CODE_SUCCESS,
								'message' => "Profile updated");
			}else{
				$result = array('code' => ER_DEFAULT,
								'message' => "No data to update");
			}
			
			return $app->json($result, 200);
		});	
		
		$controllers->post('user/disable', function(Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$user_id = null;
			$is_disabled = null;
			
			if(!array_key_exists('user_id', $paramsAry) || 
			   !array_key_exists('is_disabled', $paramsAry)){
				return $app->json(array('code' => ER_DEFAULT,
										'message' => "Missing parameter"), 200);
			}else{
				
				$user_id = $paramsAry['user_id'];
				$is_disabled = $paramsAry['is_disabled'];
				
				if($is_disabled == 1){
					
					$mySql->setOCRuserDeleted($app, $user_id, $is_disabled);
					$mySql->setOCRconnectionStatus($app, $user_id, $is_disabled);
					return $app->json(array('code' => CODE_SUCCESS,
											'message' => "OK"), 200);
						   
				}else if($is_disabled == 0){
					$mySql->setOCRuserDeleted($app, $user_id, $is_disabled);
					$mySql->setOCRconnectionStatus($app, $user_id, $is_disabled);
					return $app->json(array('code' => CODE_SUCCESS,
											'message' => "OK"), 200);					
				}
				
			}
			
		});
		
		$controllers->get('fetchUser', function(Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$ocr_id = null;
			
			if(array_key_exists('user_id', $paramsAry)){
				$ocr_id = $paramsAry['user_id'];	
			}
			
			if(isset($ocr_id) && !empty($ocr_id)){

				$OCRuser = $mySql->selectOCRuserFromUser($app, $ocr_id);
				
				if($OCRuser == false){
					return $app->json(array('code' => ER_DEFAULT,
											'message' => "No such user"), 200);
				}else{
					return $app->json($OCRuser, 200);
				}
				
			}else{
				
				$result = array('code' => ER_DEFAULT,
								'message' => "No user id");
				return $app->json($result, 200);
				
			}
			
		});

		$controllers->get('fetchOCRuser', function(Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$ocr_id = null;
			
			if(array_key_exists('user_id', $paramsAry)){
				$ocr_id = $paramsAry['user_id'];	
			}
			
			if(isset($ocr_id) && !empty($ocr_id)){

				$OCRuser = $mySql->selectOCRuserFromUser($app, $ocr_id);
				
				if($OCRuser == false){
					return $app->json(array('code' => ER_DEFAULT,
											'message' => "No such user"), 200);
				}else{
					
					$OCRuser['details'] = json_decode(json_encode (array()));// json_decode($OCRuser['details'],true);	
					
					return $app->json(array('code' => CODE_SUCCESS,
											'message' => "OK",
											'user' => $OCRuser), 200);
				}
				
			}else{
				
				$result = array('code' => ER_DEFAULT,
								'message' => "No user id");
				return $app->json($result, 200);
				
			}
			
		});
		
		$controllers->get('syncContacts', function(Request $request) use ($app, $self, $mySql){
			
			$ch = curl_init('http://dev.theoncallroom.com/admin/Bleeps/fetch_users');
					curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
					curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
					    'Content-Type: application/json')                                                                       
					);
					
			$res = curl_exec($ch);
			$res = json_decode($res, true);
			
			$users = $res['final_data'];
			foreach($users as $user){
				$username = $user['email'];
				
				if(!isset($username)){
					return $app->json(array('code' => CODE_SUCCESS,
						'message' => "Missing username/email"), 200);
				}
				
				$self->registerUser($app, $mySql, $user);
				$self->createConnections($app, $mySql, $user);

			}

					
			return $app->json(array('code' => CODE_SUCCESS,
						'message' => "OK",
						'users' => $users), 200);		
		});
		
		$controllers->post('removeContact', function(Request $request) use ($app, $mySql, $self){
			
			$app['monolog']->addDebug("\n****** OCR REMOVE CONTACT *******");
			
			$body = $request->getContent();
			
			$paramsAry = json_decode($body,true);
			$app['monolog']->addDebug("---  " . print_r($paramsAry,true) . "  ---");
			
			if(!array_key_exists('user_id', $paramsAry) || !array_key_exists('connection_id', $paramsAry)){
				return $app->json(array('code' => ER_DEFAULT,
						'message' => "Missing parameter"), 200);
			}		 
			
			$response = $mySql->selectOCRconnection($app, $paramsAry['user_id'], $paramsAry['connection_id']);
			
			if($response == false){
				return $app->json(array('code' => CODE_SUCCESS,
							'message' => "Connections does not exist"), 200);				
			}
			
			$mySql->removeOCRconnection($app, $paramsAry['user_id'], $paramsAry['connection_id']);
			$mySql->removeOCRconnection($app, $paramsAry['connection_id'], $paramsAry['user_id']);
			
			return $app->json(array('code' => CODE_SUCCESS,
						'message' => "OK"), 200);
		});

		$controllers->post('addContact', function(Request $request) use ($app, $mySql, $self){
			
			//$paramsAry = $request->query->all();
			
			$app['monolog']->addDebug("\n****** OCR ADD CONTACT *******");
			
			$body = $request->getContent();
			
			$paramsAry = json_decode($body,true);
			$app['monolog']->addDebug("---  " . print_r($paramsAry,true) . "  ---");	
			
			if(!array_key_exists('user_id', $paramsAry) || !array_key_exists('connection_id', $paramsAry)){
				return $app->json(array('code' => ER_DEFAULT,
						'message' => "Missing parameter"), 200);
			}		
			
			$connectionExists = $mySql->selectOCRconnection($app, $paramsAry['user_id'], $paramsAry['connection_id']);
			$userExists = $mySql->selectOCRuser($app, $paramsAry['user_id']);
			
			if($connectionExists == false && $userExists != false){
				
				$mySql->insertOCRconnection($app, $paramsAry['user_id'], $paramsAry['connection_id']);
				$mySql->insertOCRconnection($app, $paramsAry['connection_id'], $paramsAry['user_id']);
				
				return $app->json(array('code' => CODE_SUCCESS,
							'message' => "Connection created"), 200);				
			}			
			
			if($connectionExists != false){
				return $app->json(array('code' => CODE_SUCCESS,
							'message' => "Connection already exist"), 200);				
			}
			
			return $app->json(array('code' => CODE_SUCCESS,
						'message' => "User not found"), 200);
		});		
		
		
/*
		//OCR image upload
		$controllers->post('upload',function(Request $request) use ($app, $self, $mySql){
			return "upload image from OCR";
		});
*/

		return $controllers;
		
	}
	
}	
?>