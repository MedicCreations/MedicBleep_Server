<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;


class AccountController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
			
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'account';
            
            return $self->render('account.twig', array(
	            'error' => '',
	            'infomessage' => ''
            ));

		});

		$controllers->post('/', function (Request $request) use ($app, $self){
			
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'account';
            $errorMessage = '';
            $infoMessage = '';
            $formValues = $request->request->all();
            
            $oldPassowrd = $formValues['old_password'];
            $newPassowrd = $formValues['new_password'];
            $newPassowrdConfirm = $formValues['new_password_confirm'];
            $regex = "/^[0-9a-zA-Z]{6,}$/";
            $userId = $self->user['id'];
            
            // validation
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? and admin_password = ?", array($userId,md5($oldPassowrd)));
            
            if(empty($errorMessage) && !isset($data['id'])){
	            $errorMessage = $self->lang['account8'];   
            }
            
            if(empty($errorMessage) && !preg_match($regex,$newPassowrd)){
	             $errorMessage = $self->lang['account9'];   
            }

            if(empty($errorMessage) && $newPassowrd != $newPassowrdConfirm){
	             $errorMessage = $self->lang['account10'];   
            }

			if(empty($errorMessage)){
	             
    			$values = array(
    					'admin_password' => md5($newPassowrd),
    					'modified' => time());

    			$app['db']->update('organization', $values,array('id' => $userId));
    			
    			$infoMessage = $self->lang['account11'];
	               
            }
                     
            return $self->render('account.twig', array(
	            'error' => $errorMessage,
	            'infomessage' => $infoMessage
            ));

		});
			
							
		return $controllers;
		
	}
		
}