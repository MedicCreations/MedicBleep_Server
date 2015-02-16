<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpKernel\HttpKernelInterface;


class OrganisationController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');
                
            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from organization where is_deleted = 0 order by name limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from organization where is_deleted = 0 ");
            $count = $countAssoc['count'];
            
            $self->page = 'organisation';
            
            return $self->render('organisation/organisation.twig', array(
                'pager' => array(
                    'baseURL' => OWNER_ROOT_URL . "/organisation/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
            			
		});
        

        /* view */
		$controllers->get('/view/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
            
            if(!isset($data['id'])){
                return $app->redirect(OWNER_ROOT_URL . '/organisation/');
            }            
            return $self->render('organisation/organisation_view.twig', array(
                 'data' => $data,
                 'mode' => 'view'
            ));
            			
		});
		       
        /* delete */
		$controllers->get('/delete/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
            
            if(!isset($data['id'])){
                return $app->redirect(OWNER_ROOT_URL . '/organisation/');
            }            
            return $self->render('organisation/organisation_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            		
            			
		});

		$controllers->post('/delete/{id}', function (Request $request,$id) use ($app, $self){


            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
            
            if(!isset($data['id']))
                return $app->redirect(OWNER_ROOT_URL . '/organisation/');

			$values = array(
					'is_deleted' => 1,
					'modified' => time());

			$app['db']->update('organization', $values,array('id' => $id));
    		
            $self->setInfoMessage($self->lang['organisation12']);
            
            return $app->redirect(OWNER_ROOT_URL . '/organisation/');
            			
		});
				       
        /* add */
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            
            return $self->render('organisation/organisation_add.twig', array(
                 'form' => $self->defaultFormValues(),
                 'mode' => 'add'
            ));
            			
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            $formValues = $request->request->all();
            
            $errorMessage = $self->validate($request);
            
            if(!empty($errorMessage)){
            	
            	$self->setErrorMessage($errorMessage);
            	
                return $self->render('organisation/organisation_add.twig', array(
                    'form' => $formValues,
                    'mode' => 'add'
                ));
                
            }else{

    			$values = array(
    					'name' => $formValues['name'],
    					'email' => $formValues['email'],
    					'admin_name' => $formValues['admin_name'],
    					'admin_password' => md5($formValues['admin_password']),
    					'email_verified' => $formValues['email_verified'],
    					'max_users' => $formValues['max_users'],
    					'max_groups' => $formValues['max_groups'],
    					'max_rooms' => $formValues['max_rooms'],
    					'disk_quota' => $formValues['disk_quota'],
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('organization', $values);
				
				$self->setInfoMessage($this->lang['organisation6']);
				return $app->redirect(OWNER_ROOT_URL . '/organisation/');

            }
            			
		});
		
		/* Edit */
		$controllers->get('/edit/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
            
            if(!isset($data['id'])){
                return $app->redirect(OWNER_ROOT_URL . '/organisation/');
            }
            
            return $self->render('organisation/organisation_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(OWNER_ROOT_URL . '');

            $self->page = 'organisation';
            
            $formValues = $request->request->all();
            
            $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
            
            if(!isset($data['id'])){
                return $app->redirect(OWNER_ROOT_URL . '/organisation/');
            }
            
            // change password
            if(isset($formValues['type']) && $formValues['type'] == 'password'){
                
                
                $errorMessage = $self->validatePassword($request,true);
                
                if(!empty($errorMessage)){
    
                	$self->setErrorMessage($errorMessage);
                	
                    return $self->render('organisation/organisation_edit.twig', array(
                        'form' => array_merge($data,$formValues),
                        'mode' => 'edit'
                    ));
                    
                }else{
    
        			$values = array(
        					'admin_password' => md5($formValues['new_password']),
        					'modified' => time());
    
        			$app['db']->update('organization', $values,array('id' => $id));
                    
                    $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
                    
                    $self->setInfoMessage($this->lang['organisation22']);
                    
                    return $self->render('organisation/organisation_edit.twig', array(
                        'form' => $data,
                        'mode' => 'edit'
                    ));
                    
                }	
                


            }else{

                $errorMessage = $self->validate($request,true);
                
                if(!empty($errorMessage)){
    
                	$self->setErrorMessage($errorMessage);
                	
                    return $self->render('organisation/organisation_edit.twig', array(
                        'form' => array_merge($data,$formValues),
                        'mode' => 'edit'
                    ));
                    
                }else{
    
        			$values = array(
        					'name' => $formValues['name'],
        					'email' => $formValues['email'],
        					'admin_name' => $formValues['admin_name'],
        					'email_verified' => $formValues['email_verified'],
        					'max_users' => $formValues['max_users'],
        					'max_groups' => $formValues['max_groups'],
        					'max_rooms' => $formValues['max_rooms'],
        					'disk_quota' => $formValues['disk_quota'],
        					'modified' => time());
    
        			$app['db']->update('organization', $values,array('id' => $id));
                    
                    $data = $self->app['db']->fetchAssoc("select * from organization where id = ? ", array($id));
                    
                    $self->setInfoMessage($this->lang['organisation8']);
                    
                    return $self->render('organisation/organisation_edit.twig', array(
                        'form' => $data,
                        'mode' => 'edit'
                    ));
                    
                }	
                
            }
            
            	
		});
				
		return $controllers;
		
	}
	
	function defaultFormValues(){
    	return array(
    	    'id' => '',
    	    'name' => '',
    	    'email' => '',
    	    'admin_name' => '',
    	    'admin_password' => '',
    	    'email_verified' => '1',
    	    'max_users' => '',
    	    'max_groups' => '',
    	    'max_rooms' => '',
    	    'disk_quota' => '',
    	);
	}
	
	function validatePassword($request){
        
        $formValues = $request->request->all();
        
        $organisationId = $formValues['id'];
        $newPassowrd = $formValues['new_password'];
        $newPasswordAgain = $formValues['new_password_again'];
        
        if($newPassowrd != $newPasswordAgain)
            return $this->lang['organisation21'];
            
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

    	if(empty($formValues['name']))
    	    return $this->lang['validateionError1'];
        
        if($isEdit == false){

            $checkDuplication = $this->app['db']->fetchAll("select * from organization where email = ?", array($formValues['email']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError2'];
        
            $checkDuplication = $this->app['db']->fetchAll("select * from organization where admin_name = ?", array($formValues['admin_name']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError3'];
        

        } else {
            
            $checkDuplication = $this->app['db']->fetchAll("select * from organization where email = ? and id != ?", array($formValues['email'],$formValues['id']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError2'];
        
            $checkDuplication = $this->app['db']->fetchAll("select * from organization where admin_name = ? and id != ?", array($formValues['admin_name'],$formValues['id']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError3'];
        
        }

        
        return '';
    	
	}
	

	
}