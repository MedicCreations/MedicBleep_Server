<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class GroupsController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
		
            $self->page = 'groups';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from groups where is_deleted = 0 limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from groups where is_deleted = 0");
            $count = $countAssoc['count'];
            
            return $self->render('groups.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/groups/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
        
        });
		
        /* group view */
		$controllers->get('/view/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
            
            return $self->render('groups_view.twig', array(
                 'data' => $data,
                 'mode' => 'view'
            ));
            			
		});
		
        /* group delete */
		$controllers->get('/delete/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
            
            return $self->render('groups_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            			
		});

		$controllers->post('/delete/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));

			$values = array(
					'is_deleted' => 1,
					'modified' => time());

			$app['db']->update('groups', $values,array('id' => $groupId));
    			
            $self->setInfoMessage($self->lang['groups23']);
            return $app->redirect(ADMIN_ROOT_URL . '/groups');
            			
		});
		
		/* add group */
		$controllers->get('/add', function (Request $request) use ($app, $self){
            $self->page = 'groups';
            return $self->render('groups_add.twig', array(
                'form' => $self->defaultFormValues(),
                'mode' => 'add'
            ));
		});		

		$controllers->post('/add', function (Request $request) use ($app, $self){
		
            $self->page = 'groups';
            $formValues = $request->request->all();
            
            $errorMessage = $self->validate($request);
            
            if(!empty($errorMessage)){
            
                return $self->render('groups_add.twig', array(
                    'form' => $formValues,
                    'error' => $errorMessage
                ));
                
            }else{

                $pictureFile = $request->files->get('picture');
                $image = DEFAULT_GROUP_IMAGE;
                $imageThumb = DEFAULT_GROUP_IMAGE;
                
                if(!empty($pictureFile)){

                    $test = $self->processPicture($pictureFile,'picture');

                    if($test != null){
                        $image = $test[0];
                        $imageThumb = $test[1];
                    }
                    
                }
                
    			$values = array(
    					'name' => $formValues['name'],
    					'image' => $image,
    					'image_thumb' => $imageThumb,
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('groups', $values);
			
                return $self->render('groups_add.twig', array(
                    'form' => $self->defaultFormValues(),
                    'information' => $self->lang['groups9'],
                    'mode' => 'add'
                ));
                
            }
            
		});		
		
				
		
		/* Edit */
		$controllers->get('/edit/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/grups');
            }
            
            return $self->render('groups_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $formValues = $request->request->all();
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/groups');
            }
            
            if(isset($formValues['edit_profile'])){

                $errorMessage = $self->validate($request,true);
                
                if(!empty($errorMessage)){
                
                    return $self->render('groups_edit.twig', array(
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
        					'name' => $formValues['name'],
        					'image' => $image,
        					'image_thumb' => $imageThumb,
        					'modified' => time());
    
        			$app['db']->update('groups', $values,array('id' => $groupId));
                    
                    $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
                    return $self->render('groups_edit.twig', array(
                        'form' => $data,
                        'information' => $self->lang['groups14'],
                        'mode' => 'edit'
                    ));
                    
                }	
            
            }
	
		});

        /* group members */
		$controllers->get('/members/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ?", array($groupId));
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            
            $list = $self->app['db']->fetchAll("select * from user where id in ( select user_id from group_member where group_id = ? ) and is_deleted = 0  order by created desc limit " . PAGINATOR_PAGESIZE . " offset {$offset} ", array($groupId));

            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from user where id in ( select user_id from group_member where group_id = ? ) and is_deleted = 0", array($groupId));
            
            $count = $countAssoc['count'];
            
            $memberList = $self->app['db']->fetchAll("select id,firstname,lastname from user where is_deleted = 0 and not id in ( select user_id from group_member where group_id = ? )", array($groupId));
            
            return $self->render('groups_member.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/groups/members/{$groupId}?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list,
                'data' => $data,
                'users' => $memberList
            ));
            			
		});
		
		$controllers->post('/members/{groupId}', function (Request $request,$groupId) use ($app, $self){
            
            $self->page = 'groups';
            $self->setInfoMessage($self->lang['groups28']);
            
            $formValues = $request->request->all();
            
            if(isset($formValues['usersselect']) && is_array($formValues['usersselect'])){
                $usersToAdd = $formValues['usersselect'];
            }
            
            $usersList = $self->app['db']->fetchAll("select user_id from group_member where group_id = ?", array($groupId));
            $originalUsers = array();
            
            foreach($usersList as $row){
                $originalUsers[] = $row['user_id'];
            }

            foreach($usersToAdd as $userId){
                             
                if(!in_array($userId, $originalUsers)){
                    
                    $app['db']->insert('group_member', array(
                        'group_id' => $groupId,
                        'user_id' => $userId,
                        'created' => time(),
                        'modified' => time()
                    ));
                                 
                }
                
            }
            
            return $app->redirect(ADMIN_ROOT_URL . '/groups/members/' . $groupId);
            			
		});
		
		$controllers->get('/members_delete/{groupId}/{userId}', function (Request $request,$groupId,$userId) use ($app, $self){
            
            $self->page = 'groups';
            $self->setInfoMessage($self->lang['groups28']);
            

            $app['db']->delete('group_member', array(
                'group_id' => $groupId,
                'user_id' => $userId
            ));
                    
            return $app->redirect(ADMIN_ROOT_URL . '/groups/members/' . $groupId);
            			
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

        
        if($isEdit == false){
    
        	if(empty($formValues['name']))
        	    return $this->lang['validateionError4'];

        }

        return '';
    	
	}
	
	
	
}