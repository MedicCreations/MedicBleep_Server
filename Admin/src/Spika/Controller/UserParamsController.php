<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class UserParamsController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'userparams';

            $list = $self->app['db']->fetchAll("select * from user_details where is_deleted = 0 and (organization_id = {$self->user['id']} or is_default = 1) order by is_default desc,id asc");

            return $self->render('params.twig', array(
                'list' => $list
            ));
            			
		});

		$controllers->get('/delete/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'userparams';
            
            $app['db']->update('user_details', array('is_deleted' => 1) ,array('id' => $id,'organization_id' => $self->user['id']));
            
            $self->setInfoMessage($this->lang['params8']);
            
            return $app->redirect(ADMIN_ROOT_URL . '/userparams');		
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'userparams';
            $formValues = $request->request->all();
            
            $errorMessage = '';
            
        	if(empty($formValues['key']))
        	    $errorMessage = $this->lang['validateionError8'];

        	if(empty($formValues['label']))
        	    $errorMessage = $this->lang['validateionError8'];

            if(!preg_match("/^[a-zA-Z0-9_]+$/",$formValues['key'] ))
                $errorMessage = $this->lang['validateionError9'];
                            
            if(!empty($errorMessage)){
            
                $self->setErrorMessage($errorMessage);
                
            }else{

    			$values = array(
    			        'organization_id' => $self->user['id'],
    					'is_default' => 0,
    					'`key`' => $formValues['key'],
    					'`label`' => $formValues['label'],
    					'keyboard_type' => 1,
    					'is_deleted' => 0);

    			$app['db']->insert('user_details', $values);
                
                $self->setInfoMessage($this->lang['params8']);
            }
            
            return $app->redirect(ADMIN_ROOT_URL . '/userparams');
            			
		});
		return $controllers;
		
	}
	
}