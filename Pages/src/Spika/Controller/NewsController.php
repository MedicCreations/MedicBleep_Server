<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class NewsController extends BaseController {
		
	public function connect(Application $app) {
	    
	    parent::connect($app);
        
		$self = $this;		
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/list/{token}', function (Request $request,$token) use ($app, $self){

            $self->page = 'news';
            
            // search user
            $user = $app['db']->fetchAssoc("select * from user where token = ?",array($token));
            
            if(!isset($user['organization_id'])){
                
                return 'invalid token';
            }
                        
            $news = $app['db']->fetchAll("
                select * 
                from information 
                where organization_id = ? 
                and is_deleted = 0 
                order by created desc 
                limit 10",array($user['organization_id']));
            
            return $self->render('news/list.twig', array('newsList' => $news));
	
		});

		return $controllers;
		
	}
	
}