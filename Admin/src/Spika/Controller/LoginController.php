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
            }
            
            if(USERNAME == $username && PASSWORD == $password){
                
                return $app->redirect(ADMIN_ROOT_URL . '/dashboard');
                
            }else{

                return $self->render('login.twig', array(
                    'error_alert' => $this->lang['loginError']
                ));
                
            }

		});
		
		return $controllers;
		
	}
	
}