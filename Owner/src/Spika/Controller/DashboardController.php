<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class DashboardController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'dashboard';
            
            // get statistics
            $usersCount = $self->app['db']->fetchAssoc("select count(*) as count from user");
            $organizationsCount = $self->app['db']->fetchAssoc("select count(*) as count from organization");
            $messagesCount = $self->app['db']->fetchAssoc("select count(*) as count from message");
            
            return $self->render('dashboard.twig', array(
                'usersCount' => $usersCount['count'],
                'organizationsCount' => $organizationsCount['count'],
                'messagesCount' => $messagesCount['count']
            ));
		
		});
		
		return $controllers;
		
	}
	
}