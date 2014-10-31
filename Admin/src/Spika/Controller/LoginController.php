<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class LoginController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
            
            if(!isset($_COOKIE["username"]))
                $username = "";
            else
                $username = $_COOKIE["username"];
                
            if(!isset($_COOKIE["password"]))
                $password = "";
            else
                $password = $_COOKIE["password"];
            
            if(empty($username))
                $username = "";
                
            if(empty($password))
                $password = "";
                
            
            return $self->render('login.twig', array(
                'username' => $username,
                'password' => $password
            ));
            			
		});
		
		$controllers->post('/login', function (Request $request) use ($app, $self){
            
            $username = $request->get('username');
            $password = $request->get('password');
            $remember = $request->get('remember');
            
            
            if(!is_null($remember)){
                setcookie("username", $username, time()+3600 * 24 * 30);
                setcookie("password", $password, time()+3600 * 24 * 30);
            }else{
                setcookie("username", "", time()+3600 * 24 * 30);
                setcookie("password", "", time()+3600 * 24 * 30);                
            }
            
            // check
            $data = $self->app['db']->fetchAssoc("select * from organization where admin_name = ? and admin_password = ? and email_verified = 1", array($username,md5($password)));
            
            if(!empty($data['id'])){
                
                $self->app['session']->set('loginuser',$data);
                return $app->redirect(ADMIN_ROOT_URL . '/dashboard');
                
            }else{

                return $self->render('login.twig', array(
                    'error_alert' => $self->lang['loginError'],
                    'password' => $password,
                    'username' => $username
                ));
                
            }

		});
		
		$controllers->get('/logout', function (Request $request) use ($app, $self){
            $self->app['session']->remove('loginuser');
            return $app->redirect(ADMIN_ROOT_URL . '/');
		});
		
		$controllers->get('/regist', function (Request $request) use ($app, $self){
			
            return $self->render('regist.twig', array(
                    'error_alert' => '',
                    'company_name' => '',
                    'password' => '',
                    'email' => '',
                    'username' => ''
            ));
   
   		});
		
		$controllers->post('/regist', function (Request $request) use ($app, $self){
			
			$errorMessage = '';
            $companyName = $request->get('company_name');
            $email = $request->get('email');
            $username = $request->get('username');
            $password = $request->get('password');
			
			// validation
			$checkEmail = $self->app['db']->fetchAssoc("select * from organization where email = ?", array($email));
			$checkUsername = $self->app['db']->fetchAssoc("select * from organization where admin_name = ?", array($username));
			
			if(isset($checkEmail['id'])){
				$errorMessage = $self->lang['registError1'];
			}
			
			if(isset($checkUsername['id'])){
				$errorMessage = $self->lang['registError2'];
			}
			
			if(empty($errorMessage)){
				
				// generate email
				$verifyCode = $self->randomString(5);
				$verifyURL = ROOT_URL . "/verify/" . $verifyCode;
				$emailBody = "Welcome to your free trial of Spika Enterprise.
	
By signing up for Spika Enterprise, you're empowering your business to work smarter and faster, so you can focus on what really matters.

Please open following URL and You're about to work better, together.

{$verifyURL}

Thanks for beginning your free trial of Spika Enterprise.

Sincerely,
Spika Enterprise Team
	
";
				
				$values = array(
						'name' => $companyName,
						'email' => $email,
						'admin_name' => $username,
						'admin_password' => md5($password),
						'email_verified' => 0,
						'email_verification_code' => $verifyCode,
						'created' => time(), 
						'modified' => time());
	
				$app['db']->insert('organization', $values);
				
				$self->sendEmail($email,$self->lang['registEmailSubject'],$emailBody);

	            return $self->render('regist_thankyou.twig', array(
	            ));

			}
			
            return $self->render('regist.twig', array(
                    'error_alert' => $errorMessage,
                    'company_name' => $companyName,
                    'password' => '',
                    'email' => $email,
                    'username' => $username
            ));
   
   		});
   		
   		$controllers->get('/verify/{code}', function (Request $request,$code) use ($app, $self){
			
			$data = $self->app['db']->fetchAssoc("select * from organization where email_verification_code = ? and email_verified = 0", array($code));
			$result = false;
			
			if(!empty($data['id'])){

    			$values = array(
    					'email_verified' => 1,
    					'email_verification_code' => '',
    					'modified' => time());

    			$app['db']->update('organization', $values,array('id' => $data['id']));
    			
				$result = true;
				$adminURL = ROOT_URL;
				$clientURL = CLIENT_URL;
				$emailBody = "Your Spika Enterprise setup is complete.

Please add following URL to your bookmark.

{$adminURL}

Important!
To use Spika Enterprise, you have to create user to login to Apps. This account is used only to login admin area.
After making new user please login to web client from the link below.
{$clientURL}

To download mobile apps please open the link below with your iPhone or Android device.
{$clientURL}/apps

Sincerely,
Spika Enterprise Team
	
";
				$self->sendEmail($data['email'],$self->lang['registEmailSubjectFinish'],$emailBody);
	            
			}else {

            
			}

            return $self->render('regist_verify.twig', array(
                    'result' => $result
            ));

   		});
   		
		$controllers->get('/forgot', function (Request $request) use ($app, $self){
            return $self->render('forgot.twig', array(
	            	'error_alert' => '',
	            	'info_alert' => '',
                    'result' => true
            ));
		});
		
		$controllers->post('/forgot', function (Request $request) use ($app, $self){
			
			$email = $request->get('email');
			$data = $self->app['db']->fetchAssoc("select * from organization where email = ?", array($email));
			$errorMessage = '';
			$infoMessage = '';
			$adminURL = ROOT_URL;

            if(empty($data['id'])){
                
                $errorMessage = $self->lang['regist15'];
                
            } else {
				

				$password = $self->randomString(6,6);
				
    			$values = array(
    					'admin_password' => md5($password),
    					'modified' => time());

    			$app['db']->update('organization', $values,array('id' => $data['id']));

				$emailBody = "We reset your password. Please use this password to login admin console.

{$password}

You can login to admin console from here.
{$adminURL}

Sincerely,
Spika Enterprise Team";
				
				$self->sendEmail($data['email'],$self->lang['regist18'],$emailBody);
				    			
                $infoMessage = $self->lang['regist16'];
	            
            }
            
            return $self->render('forgot.twig', array(
	            	'error_alert' => $errorMessage,
	            	'info_alert' => $infoMessage,
                    'result' => true
            ));
		});
		
		/*
		$controllers->get('/temp', function (Request $request) use ($app, $self){
            return $self->render('regist_verify.twig', array(
                    'result' => true
            ));
		});
		*/
		
		return $controllers;
		
	}
	
}