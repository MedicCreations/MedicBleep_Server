<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;


class CategoryController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');
                
            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from categories where is_deleted = 0 and organization_id = {$self->user['id']} order by name limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from categories where is_deleted = 0 and organization_id = {$self->user['id']} ");
            $count = $countAssoc['count'];
            
            $self->page = 'categories';
            
            return $self->render('categories.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/categories/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
            			
		});
        

        /* user view */
		$controllers->get('/view/{categoryId}', function (Request $request,$categoryId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));
            
            return $self->render('categories_view.twig', array(
                 'data' => $data,
                 'mode' => 'view'
            ));
            			
		});
		       
        /* user delete */
		$controllers->get('/delete/{categoryId}', function (Request $request,$categoryId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));
            
            return $self->render('categories_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            			
		});

		$controllers->post('/delete/{categoryId}', function (Request $request,$categoryId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));

			$values = array(
					'is_deleted' => 1,
					'modified' => time());

			$app['db']->update('categories', $values,array('id' => $categoryId));
    			
            $self->setInfoMessage($self->lang['category15']);
            return $app->redirect(ADMIN_ROOT_URL . '/categories');
            			
		});
				       
        /* user add */
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            
            return $self->render('categories_add.twig', array(
                 'form' => $self->defaultFormValues(),
                 'mode' => 'add'
            ));
            			
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            $formValues = $request->request->all();
            
            $errorMessage = $self->validate($request);
            
            if(!empty($errorMessage)){
            
                return $self->render('categories_add.twig', array(
                    'form' => $formValues,
                    'error' => $errorMessage,
                    'mode' => 'add'
                ));
                
            }else{

    			$values = array(
    					'name' => $formValues['name'],
    					'organization_id' => $self->user['id'],
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('categories', $values);
			
                return $self->render('categories_add.twig', array(
                    'form' => $self->defaultFormValues(),
                    'information' => $self->lang['category10'],
                    'mode' => 'add'
                ));

            }
            			
		});
		
		/* Edit */
		$controllers->get('/edit/{categoryId}', function (Request $request,$categoryId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'categories';
            $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/users');
            }
            
            return $self->render('categories_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{categoryId}', function (Request $request,$categoryId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'category17';
            $formValues = $request->request->all();
            $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/user');
            }
        

            $errorMessage = $self->validate($request,true);
            
            if(!empty($errorMessage)){
            
                return $self->render('categories_edit.twig', array(
                    'form' => array_merge($data,$formValues),
                    'error' => $errorMessage,
                    'mode' => 'edit'
                ));
                
            }else{


    			$values = array(
    					'name' => $formValues['name'],
    					'modified' => time());

    			$app['db']->update('categories', $values,array('id' => $categoryId));
                
                $data = $self->app['db']->fetchAssoc("select * from categories where id = ? and organization_id = {$self->user['id']} ", array($categoryId));
                
                return $self->render('categories_edit.twig', array(
                    'form' => $data,
                    'information' => $self->lang['category17'],
                    'mode' => 'edit'
                ));
                
            }	
            	
		});
				
		return $controllers;
		
	}
	
	function defaultFormValues(){
    	return array(
    	    'id' => '',
    	    'name' => ''
    	);
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

    	if(empty($formValues['name']))
    	    return $this->lang['validateionError6'];
        
        if($isEdit == false){

            $checkDuplication = $this->app['db']->fetchAll("select * from categories where name = ? and organization_id = {$this->user['id']} ", array($formValues['name']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError7'];
        

        } else {
            
            $checkDuplication = $this->app['db']->fetchAll("select * from categories where name = ? and organization_id = {$this->user['id']} and id != ? ", array($formValues['name'],$formValues['id']));
            
            if(count($checkDuplication) > 0)
                return $this->lang['validateionError7'];
        
        
        }
        
        return '';
    	
	}
	

	
}