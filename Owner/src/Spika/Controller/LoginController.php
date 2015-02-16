<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class LoginController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
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
            if($username == USERNAME && md5($password) == md5(PASSWORD)){
                
                $self->app['session']->set('loginuser',$username);
                return $app->redirect(OWNER_ROOT_URL . '/dashboard');
                
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
            return $app->redirect(OWNER_ROOT_URL . '/');
		});
		
		return $controllers;
		
	}
	
}