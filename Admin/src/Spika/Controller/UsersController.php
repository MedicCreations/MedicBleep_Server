<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;


class UsersController extends BaseController {
	
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
            $list = $self->app['db']->fetchAll("select * from user where is_deleted = 0 and organization_id = {$self->user['id']} order by username limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from user where is_deleted = 0 and organization_id = {$self->user['id']} ");
            $count = $countAssoc['count'];
            
            $self->page = 'users';
            
            return $self->render('users.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/users/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
            			
		});
        

        /* user view */
		$controllers->get('/view/{userId}', function (Request $request,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
            
            return $self->render('users_view.twig', array(
                 'data' => $data,
                 'mode' => 'view'
            ));
            			
		});
		       
        /* user delete */
		$controllers->get('/delete/{userId}', function (Request $request,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
            
            return $self->render('users_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            			
		});

		$controllers->post('/delete/{userId}', function (Request $request,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));

			$values = array(
					'is_deleted' => 1,
					'modified' => time());

			$app['db']->update('user', $values,array('id' => $userId));
    			
            $self->setInfoMessage($self->lang['users37']);
            return $app->redirect(ADMIN_ROOT_URL . '/users');
            			
		});
				       
        /* user add */
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            
            return $self->render('users_add.twig', array(
                 'form' => $self->defaultFormValues(),
                 'mode' => 'add'
            ));
            			
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $formValues = $request->request->all();
            
            $errorMessage = $self->validate($request);
            
            if(!empty($errorMessage)){
            
                return $self->render('users_add.twig', array(
                    'form' => $formValues,
                    'error' => $errorMessage,
                    'mode' => 'add'
                ));
                
            }else{

                $pictureFile = $request->files->get('picture');
                $image = DEFAULT_USER_IMAGE;
                $imageThumb = DEFAULT_USER_IMAGE;
                
                if(!empty($pictureFile)){

                    $test = $self->processPicture($pictureFile,'picture');

                    if($test != null){
                        $image = $test[0];
                        $imageThumb = $test[1];
                    }
                    
                }

    			$values = array('outside_id' => 0,
    			        'organization_id' => $self->user['id'],
    					'firstname' => $formValues['firstname'],
    					'lastname' => $formValues['lastname'],
    					'password' => md5($formValues['password']),
    					'username' => $formValues['username'],
    					'image' => $image,
    					'image_thumb' => $imageThumb,
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('user', $values);
			
                return $self->render('users_add.twig', array(
                    'form' => $self->defaultFormValues(),
                    'information' => $self->lang['users14'],
                    'mode' => 'add'
                ));
                
            }
            			
		});
		
		/* Edit */
		$controllers->get('/edit/{userId}', function (Request $request,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/users');
            }
            
            return $self->render('users_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{userId}', function (Request $request,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $formValues = $request->request->all();
            $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/user');
            }
            
            if(isset($formValues['edit_profile'])){

                $errorMessage = $self->validate($request,true);
                
                if(!empty($errorMessage)){
                
                    return $self->render('users_edit.twig', array(
                        'form' => array_merge($data,$formValues),
                        'error' => $errorMessage,
                        'mode' => 'edit'
                    ));
                    
                }else{
    
                    $pictureFile = $request->files->get('picture');
                    $image = $data['image'];
                    $imageThumb = $data['image_thumb'];
                    
                    if(!empty($pictureFile)){
    
                        $test = $self->processPicture($pictureFile,'picture');
    
                        if($test != null){
                            $image = $test[0];
                            $imageThumb = $test[1];
                        }
                        
                    }
                    
        			$values = array(
        					'firstname' => $formValues['firstname'],
        					'lastname' => $formValues['lastname'],
        					'image' => $image,
        					'image_thumb' => $imageThumb,
        					'modified' => time());
    
        			$app['db']->update('user', $values,array('id' => $userId));
                    
                    $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
                    return $self->render('users_edit.twig', array(
                        'form' => $data,
                        'information' => $self->lang['users22'],
                        'mode' => 'edit'
                    ));
                    
                }	
            
            }
            
            if(isset($formValues['edit_username'])){
                
                $username = $formValues['username'];
                
                $checkDuplication = 
                    $self->app['db']->fetchAll("select * from user where username = ? and id != ?  and organization_id = {$self->user['id']} ", 
                                                    array($formValues['username'],$userId));
            
                if(count($checkDuplication) > 0){
                    return $self->render('users_edit.twig', array(
                        'form' => $data,
                        'error' => $self->lang['validateionError3'],
                        'mode' => 'edit'
                    ));
                }
                
    			$values = array(
    					'username' => $username,
    					'modified' => time());

    			$app['db']->update('user', $values,array('id' => $userId));
                
                $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
                return $self->render('users_edit.twig', array(
                    'form' => $data,
                    'information' => $self->lang['users22'],
                    'mode' => 'edit'
                ));
                
            }
            
            if(isset($formValues['edit_password'])){
            
                $password = $formValues['password'];

                if(empty($password)){
                    return $self->render('users_edit.twig', array(
                        'form' => $data,
                        'error' => $self->lang['validateionError2'],
                        'mode' => 'edit'
                    ));
                }
                
    			$values = array(
    					'password' => md5($password),
    					'modified' => time());

    			$app['db']->update('user', $values,array('id' => $userId));
                
                $data = $self->app['db']->fetchAssoc("select * from user where id = ? and organization_id = {$self->user['id']} ", array($userId));
                return $self->render('users_edit.twig', array(
                    'form' => $data,
                    'information' => $self->lang['users22'],
                    'mode' => 'edit'
                ));
                
            }
            
	
		});
				
		return $controllers;
		
	}
	
	function defaultFormValues(){
    	return array(
    	    'id' => '',
    	    'username' => '',
    	    'password' => '',
    	    'password_confirm' => '',
    	    'firstname' => '',
    	    'lastname' => ''
    	);
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

        
        if($isEdit == false){
    
        	if(empty($formValues['username']))
        	    return $this->lang['validateionError1'];
    	    
        	if(isset($formValues['password']) && empty($formValues['password']))
        	    return $this->lang['validateionError2'];
        	    
            $checkDuplication = $this->app['db']->fetchAll("select * from user where username = ? and organization_id = {$this->user['id']} ", array($formValues['username']));
            
            if(count($checkDuplication) > 0)
                return $this->lang['validateionError3'];
        
        }

            
        return '';
    	
	}
	

	
}