<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class AnnounceController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'announce';
            
            return $self->render('announce/announce.twig', array(
            ));
            			
		});
		
		$controllers->post('/count', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

			$paramsAry = $request->request->all();
            $type = $paramsAry['type'];
            $target = $paramsAry['target'];
            
            $count = 0;
            

            if($target == 'admin' && $type == 'email')
                $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from organization where is_deleted = 0 and email != ''");
            
            if($target == 'admin' && $type == 'message')
                $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from user where is_deleted = 0 and is_admin = 1");
            
            if($target == 'user' && $type == 'email')
                $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from user_mst where is_deleted = 0 and email != ''");
            
            if($target == 'user' && $type == 'message')
                $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from user where is_deleted = 0 ");
            
            
            return $countAssoc['count'];
            
		});
		
		$controllers->post('/send', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

			$paramsAry = $request->request->all();
            $type = $paramsAry['type'];
            $target = $paramsAry['target'];
            $message = $paramsAry['message'];
            $subject = $paramsAry['subject'];
            $index = $paramsAry['index'];
            
            if(empty($type) ||  empty($target) ||  empty($message) || $index == '' ){
                
                $app->abort(404, "Invalid parameter");
                
            }
            
            if($target == 'admin' && $type == 'email')
                $to = $self->app['db']->fetchAssoc("select * from organization where is_deleted = 0 and email != '' order by id limit 1 offset {$index} ");
            
            if($target == 'admin' && $type == 'message')
                $to = $self->app['db']->fetchAssoc("select * from user where is_deleted = 0 and is_admin = 1 order by id  limit 1 offset {$index}");
            
            if($target == 'user' && $type == 'email')
                $to = $self->app['db']->fetchAssoc("select * from user_mst where is_deleted = 0 and email != '' order by id limit 1 offset {$index} ");
            
            if($target == 'user' && $type == 'message')
                $to = $self->app['db']->fetchAssoc("select * from user where is_deleted = 0  order by id limit 1 offset {$index} ");
            
            if($type == 'message'){
                
                // doesnt user this at this moment 
                
                $toUserId = $to['id'];
				
				$self->sendMessageToUserAsAdmin($toUserId,$message);
				
            }
            
            if($type == 'email'){
                
                $email = $to['email'];
                
				$self->sendEmail($email,$subject,$message);
				
           }

           return json_encode($to);
            
		});
		
		return $controllers;
		
	}
	
}