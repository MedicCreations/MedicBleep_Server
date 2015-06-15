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

		//OCR update user
		$controllers->post('/updateProfile',function (Request $request) use ($app, $self, $mySql){
			
			//API gets OCR user id and compares it to existing users OCR id
			
			$result = null;
			
			$paramsAry = $request->query->all();
			
			$values = array();
			
			//Add keys if neccessary
			if(array_key_exists('firstname', $paramsAry)){
	            $values['firstname'] = $paramsAry['firstname'];	            
            }
			
			if(array_key_exists('lastname', $paramsAry)){
	            $values['lastname'] = $paramsAry['lastname'];				
			}

			if(array_key_exists('details', $paramsAry)){
				$values['details'] = $paramsAry['details'];
			}

			if(array_key_exists('user_id', $paramsAry)){
				$user_id = $paramsAry['user_id'];	
			}
			
			$OCRuser = $mySql->selectOCRuser($app, $user_id);
			
			if(count($values) >= 3){
				
				
				$mySql->updateUser($app, $OCRuser['id'], $values);
				
				$result = array(
					'code' => CODE_SUCCESS,
					'message' => "OK"	
				);
				
			}else{
				$result = array(
					'code' => ER_DEFAULT,
					'message' => "No parameters or missing parameter"	
				);
				
			}
			
			return $app->json($result, 200);
			
		});	

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
		
/*
		$controllers->post('password/change', function(Request $request) use ($app, $self, $mySql){

			$result_code = 0;
			$result = null;

			$paramsAry = $request->query->all();
			
			$user_id = $paramsAry['username'];
			$temp_password = $paramsAry['temp_password'];
			$new_password = $paramsAry['new_password'];
			
			$user = $mySql->getUserByTempPassword($app, $temp_password);
			
			if(!is_array($user)){
				$result = array(
							'code' => ER_INVALID_TEMP_PASSWORD,
							'message' => 'User doesn\'t exist'
				);
			}else{
				
				
				
			}
			
			return $app->json($result, $result_code);
			
		});
*/
		
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
				
				print_r($OCRuser);
				
				$passwordExist = $mySql->checkPassword($app, $OCRuser['username'], $new_password);
				
				if($passwordExist){
					$result = array(
						'code' => ER_PASSWORD_EXIST,
						'message' => 'Password already exist');
					return $app->json($result, 200);
				}
				
				$mySql->updateUserMst($app, $OCRuser['id'], array('password' => $new_password));
				
				$result = array('code' => CODE_SUCCESS,
								'message' => 'OK');
			}
			
			return $app->json($result, 200);
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