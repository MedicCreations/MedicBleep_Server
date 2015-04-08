<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class AcceptInvitationController extends BaseController {
	
	var $loginRegex = '/^[a-zA-Z0-9_]{6,}$/';
	
	public function connect(Application $app) {
	    
	    parent::connect($app);
        
		$self = $this;		
		$controllers = $app ['controllers_factory'];
		
		$controllers->post('/accept', function (Request $request) use ($app, $self){

            $self->page = 'accept';

            $formValues = $request->request->all();
            $code = $formValues['code'];

            $user = $self->app['db']->fetchAssoc("select * from user where registration_code = ? ",array($code));
            if(!isset($user['id'])){
                return $app->redirect(ROOT_URL . '/accept/failed');
            }

            $app['db']->update('user', array(
                'registration_code' => '',
                'is_valid' => 1
            ),array('id' => $user['id']));
            
            $app['db']->update('user_mst', array(
                'email_verified' => 1
            ),array('id' => $user['master_user_id']));
            
            
            return $app->redirect(ROOT_URL . '/accept/success');
	
		});

		
		$controllers->get('/success', function (Request $request) use ($app, $self){

            $self->page = 'accept';
            
            return $self->render('acceptInvitaiton/success.twig', array(
                'CLIENT_URL' => CLIENT_URL
            ));
	
		});

		$controllers->get('/{code}', function (Request $request,$code) use ($app, $self){

            $self->page = 'accept';
            
            // get user
            $user = $self->app['db']->fetchAssoc("select * from user where registration_code = ? ",array($code));
            
            if(isset($user['id'])){
                
                $userMaster = $self->app['db']->fetchAssoc("select * from user_mst where id = ? ",array($user['master_user_id']));
                $orgainzation = $self->app['db']->fetchAssoc("select * from organization where id = ? ",array($user['organization_id']));
                
                if(empty($userMaster['username'])){

                    return $self->render('acceptInvitaiton/signup.twig', array(
                        'code' => $code,
                        'organization' => $orgainzation,
                        'userMst' => $userMaster,
                        'CLIENT_URL' => CLIENT_URL
                    ));
                    
                }else{
                
                    return $self->render('acceptInvitaiton/accept.twig', array(
                        'code' => $code,
                        'organization' => $orgainzation,
                        'userMst' => $userMaster,
                        'CLIENT_URL' => CLIENT_URL
                    ));
                
                }
                

            }else{

                return $self->render('acceptInvitaiton/invalid.twig', array(
                    'code' => $code,
                    'CLIENT_URL' => CLIENT_URL
                ));
 
            }

	
		});

		$controllers->post('/signup', function (Request $request) use ($app, $self){

            $self->page = 'accept';
            
            // validation
            $formValues = $request->request->all();
            $code = $formValues['code'];
            $username = $formValues['username'];
            $password = $formValues['password'];
            $passwordAgain = $formValues['password_again'];
            
            $user = $self->app['db']->fetchAssoc("select * from user where registration_code = ? ",array($code));
            if(!isset($user['id'])){
                return $app->redirect(ROOT_URL . '/accept/failed');
            }
            
            $errorMessage = "";
            if(empty($username) || empty($password))
                $errorMessage = $this->lang['invitation10'];

            if(empty($errorMessage)){
                
                if(!preg_match($self->loginRegex,$username) || !preg_match($self->loginRegex,$password)){
                    $errorMessage = $this->lang['invitation11'];
                    
                }
                                    
            }
            
            if(empty($errorMessage)){
                
               $test = $self->app['db']->fetchAssoc("select * from user_mst where username = ? ",array($username));
               
               if(isset($test['id'])){
                   
                   $errorMessage = $this->lang['invitation8'];
                   
               }
                                    
            }            
            
            if(empty($errorMessage)){
                
               if($password != $passwordAgain){
                   
                   $errorMessage = $this->lang['invitation9'];
                   
               }
                                    
            }            

            if(empty($errorMessage)){
                
                $app['db']->update('user_mst', array(
                    'username' => $username,
                    'password' => md5($password),
                    'email_verified' => 1,
                ),array('id' => $user['master_user_id']));
                
                $app['db']->update('user', array(
                    'registration_code' => '',
                    'is_valid' => 1
                ),array('id' => $user['id']));
                
                return $app->redirect(ROOT_URL . '/accept/success');
                           
            }  
            
            if(!empty($errorMessage)){
                $self->setErrorMessage($errorMessage);
                return $app->redirect(ROOT_URL . '/accept/' . $code);
                
            }else{
            
                return $app->redirect(ROOT_URL . '/accept/' . $code);
                
            }
	
		});
		

		return $controllers;
		
	}
	
}