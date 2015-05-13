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
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];

		//OCR update user
		$controllers->post('/updateProfile',function (Request $request) use ($app, $self, $mySql){
			
			//TO DO: change this API so search parameter is username
			
			$result_code = 0;
			$result = null;
			
			$paramsAry = $request->query->all();
			
			print_r($paramsAry);
			
			$values = array();
			
			if(array_key_exists('firstname', $paramsAry)){
	            $values['firstname'] = $paramsAry['firstname'];	            
            }
			
			if(array_key_exists('lastname', $paramsAry)){
	            $values['lastname'] = $paramsAry['lastname'];				
			}

			if(array_key_exists('details', $paramsAry)){
				$values['details'] = $paramsAry['details'];
			}

			if(array_key_exists('userId', $paramsAry)){
				$user_id = $paramsAry['userId'];	
			}
			
			if(count($values) >= 3){
				
				var_dump($values);
				
				$mySql->updateUser($app, $user_id, $values);
				
				$result = array(
					'code' => CODE_SUCCESS,
					'message' => "OK"	
				);
				
				$result_code = 200;
				
			}else{
				$result = array(
					'code' => ER_DEFAULT,
					'message' => "No parameters or missing parameter"	
				);
				$result_code = 400;
				
			}
			
			return $app->json($result, $result_code);
			
		});	

		$controllers->post('password/forgot',function(Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$username = $paramsAry['username'];
			
			$user = $mySql->getUserByUsernameOrEmail($app, $username);
			
			if(!is_array($user)){
				
				$result = array('code' => ER_USERNAME_NOT_EXIST,
					'message' => 'Username doesn\'t exist');
				return $app->json($result, 200);
				
			}
			
			if (empty($user['email'])){
				$result = array('code' => ER_EMAIL_MISSING,
					'message' => 'Your email is missing');
				return $app->json($result, 200);	
			}
			
			$temp_pass = $mySql->createTempPassword($app, $user['id']);
			$body = sprintf($this->lang['forgotpassword_email_body'], $user['username'], $temp_pass);
			$subject = $this->lang['forgotpassword_email_subject'];
			
			$self->sendEmail($user['email'],$subject,$body);
			
			$result = array(
				'code' => CODE_SUCCESS,
				'message' => 'OK'
			);
			
			return $app->json($result,200);
			
		});
		
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
		
		//OCR password update
		$controllers->post('password/update', function(Request $request) use ($app, $self, $mySql){

			$paramsAry = $request->query->all();
			
			print_r($paramsAry);
			
			return "OCR password update";
		});
		
		
		
		//OCR image upload
		$controllers->post('upload',function(Request $request) use ($app, $self, $mySql){
			return "upload image from OCR";
		});

		return $controllers;
		
	}
}	
?>