<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class CategoryController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		//get category list
		$controllers->get('/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$user_id= $app['user']['id'];
			
			$categories = $mySql->getCategories($app);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'categories' => $categories);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//create category
		$controllers->post('/create', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$name = $paramsAry['name'];
			
			$mySql->createCategory($app, $name);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
			
		
		return $controllers;
	}
	
	
	
}