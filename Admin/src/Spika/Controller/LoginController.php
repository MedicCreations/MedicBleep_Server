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
            $data = $self->app['db']->fetchAssoc("
                select * from organization 
                where admin_name = ? 
                and admin_password = ? 
                and email_verified = 1"
            , array($username,md5($password)));
            
            if(!empty($data['id'])){
                
                if($data['account_status'] == ACCOUNT_STATUS_ADMINDISABLED){
                        
                    return $self->render('login.twig', array(
                        'error_alert' => $self->lang['login9'],
                        'password' => $password,
                        'username' => $username
                    ));
                }

                if($data['account_status'] == ACCOUNT_STATUS_DISABLED){
                        
                    return $self->render('login.twig', array(
                        'error_alert' => $self->lang['login10'],
                        'password' => $password,
                        'username' => $username
                    ));
                    
                }
                
                if($data['is_deleted'] == 1){
                        
                    return $self->render('login.twig', array(
                        'error_alert' => $self->lang['login10'],
                        'password' => $password,
                        'username' => $username
                    ));
                    
                }
                
                
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
			$checkUsername1 = $self->app['db']->fetchAssoc("select * from organization where admin_name = ?", array($username));
			$checkUsername2 = $self->app['db']->fetchAssoc("select * from user_mst where username = ?", array($username));
			
			if(isset($checkEmail['id'])){
				$errorMessage = $self->lang['registError1'];
			}
			
			if(isset($checkUsername1['id']) || isset($checkUsername2['id'])){
				$errorMessage = $self->lang['registError2'];
			}
			
			if(empty($errorMessage)){
				
				// generate email
				$verifyCode = $self->randomString(5);
				$verifyURL = ROOT_URL . "/verify/" . $verifyCode;
				$emailBody = sprintf($this->lang['registEmailBody'],$verifyURL);
                				
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
				$self->sendEmail("info@clover-studio.com","Spika Registration","We got new customer !" . $email);

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
                
                // create user
                $masterUser = $self->app['db']->fetchAssoc("select * from user_mst where email = ? ", array($data['email']));
                
                if(!isset($masterUser['id'])){
                                        
                    // create master user                    
                    $self->app['db']->insert("user_mst",array(
                        'email' => $data['email'],
                        'username' => $data['admin_name'],
                        'password' => $data['admin_password'],
                        'email_verified' => 1,
                        'created' => time()
                    ));
                    
                    $masterUser = $self->app['db']->fetchAssoc("select * from user_mst where email = ? ", array($data['email']));
                    
                }
                
                // create master user                    
                $self->app['db']->insert("user",array(
                    'master_user_id' => $masterUser['id'],
                    'is_admin' => 1,
                    'is_valid' => 1,
                    'organization_id' => $data['id'],
                    'created' => time()
                ));
                
    			$values = array(
    					'email_verified' => 1,
    					'email_verification_code' => '',
    					'modified' => time());

    			$app['db']->update('organization', $values,array('id' => $data['id']));
    			
				$result = true;
				$adminURL = ROOT_URL;
				$clientURL = CLIENT_URL;
				$emailBody = sprintf($this->lang['registFinishEmailBody'],$adminURL,$clientURL,$clientURL);
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