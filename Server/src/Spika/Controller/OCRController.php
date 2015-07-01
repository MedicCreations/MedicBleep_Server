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

					print_r($OCRuser);
					
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
			
			$paramsAry = $request->query->all();
			
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
			
			
			if(is_null($result)){
				
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
				
				$result = array('code' => CODE_SUCCESS,
								'message' => "Profile updated");
			}else{
				$result = array('code' => ER_DEFAULT,
								'message' => "No data to update");
			}
			
			return $app->json($result, 200);
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