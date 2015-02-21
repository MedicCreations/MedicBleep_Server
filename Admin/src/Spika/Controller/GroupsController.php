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

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from groups where is_deleted = 0 and organization_id = {$self->user['id']} limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from groups where is_deleted = 0 and organization_id = {$self->user['id']} ");
            $count = $countAssoc['count'];
            
            return $self->render('groups.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/groups/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list,
                'categoryList' => $self->getCategoryList()
            ));
        
        });
		
        /* group view */
		$controllers->get('/view/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));
            
            return $self->render('groups_view.twig', array(
                 'data' => $data,
                 'mode' => 'view',
                 'categoryList' => $self->getCategoryList()
            ));
            			
		});
		
        /* group delete */
		$controllers->get('/delete/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));
            
            return $self->render('groups_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete',
                 'categoryList' => $self->getCategoryList()
            ));
            			
		});

		$controllers->post('/delete/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));

			$values = array(
					'is_deleted' => 1,
					'modified' => time());
                    
            if(USE_LOGICAL_DELETE_GROUP){
    			$app['db']->update('groups', $values,array('id' => $groupId));
                $app['db']->update('chat', $values,array('group_id' => $groupId));
            }else{
    			$app['db']->delete('groups',array('id' => $groupId));
                $app['db']->delete('chat',array('group_id' => $groupId));
                
            }
    			
            $self->setInfoMessage($self->lang['groups23']);
            return $app->redirect(ADMIN_ROOT_URL . '/groups');
            			
		});
		
		/* add group */
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';

            $dataUsage = $self->getDataUsage($app);
            
            return $self->render('groups_add.twig', array(
                'form' => $self->defaultFormValues(),
                'mode' => 'add',
                'categoryList' => $self->getCategoryList(),
                'limit' => $dataUsage['limit'],
                'usage' => $dataUsage['usage'],
                'persentage' => $dataUsage['persentage']

            ));
		});		

		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $formValues = $request->request->all();

            $dataUsage = $self->getDataUsage($app);

            $errorMessage = $self->validate($request);
            
            if($dataUsage['usage'] >= $dataUsage['limit']){
                
                $errorMessage = $self->lang['validateionError13'];
                
            }
            
            if(!empty($errorMessage)){
                
                $self->setErrorMessage($errorMessage);
                
                return $self->render('groups_add.twig', array(
                    'form' => $formValues,
                    'mode' => 'add',
                    'categoryList' => $self->getCategoryList(),
                    'limit' => $dataUsage['limit'],
                    'usage' => $dataUsage['usage'],
                    'persentage' => $dataUsage['persentage']

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
    			        'organization_id' => $self->user['id'],
    					'name' => $formValues['name'],
    					'category' => $formValues['category'],
    					'image' => $image,
    					'image_thumb' => $imageThumb,
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('groups', $values);
                
                $lastGourpIdAry = $this->app['db']->fetchAssoc("select max(id) as maxid from groups");
                $lastGourpId = $lastGourpIdAry['maxid'];
				
				$values = array(
						'type' => 2,
						'is_active' => 1,
						'group_id' => $lastGourpId,
    			        'organization_id' => $self->user['id'],
    					'name' => $formValues['name'],
    					'category_id' => $formValues['category'],
    					'image' => $image,
    					'image_thumb' => $imageThumb,
    					'created' => time(), 
    					'modified' => time());

    			$app['db']->insert('chat', $values);
                
                $self->setInfoMessage($self->lang['groups5']);
                return $app->redirect(ADMIN_ROOT_URL . '/groups/members/' . $lastGourpId);
                
            }
            
		});		
		
				
		
		/* Edit */
		$controllers->get('/edit/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/grups');
            }
            
            return $self->render('groups_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit',
                 'categoryList' => $self->getCategoryList()
            ));
            			
		});

		$controllers->post('/edit/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $formValues = $request->request->all();
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/groups');
            }
            
            if(isset($formValues['edit_profile'])){

                $errorMessage = $self->validate($request,true);
                                
                if(!empty($errorMessage)){

                    $self->setErrorMessage($errorMessage);

                    return $self->render('groups_edit.twig', array(
                        'form' => array_merge($data,$formValues),
                        'mode' => 'edit',
                        'categoryList' => $self->getCategoryList()
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
        					'category' => $formValues['category'],
        					'image' => $image,
        					'image_thumb' => $imageThumb,
        					'modified' => time());
    
        			$app['db']->update('groups', $values,array('id' => $groupId));
                    
                    $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));

                    $self->setInfoMessage($self->lang['groups14']);
                    return $app->redirect(ADMIN_ROOT_URL . '/groups/');

                    
                }	
            
            }
	
		});

        /* group members */
		$controllers->get('/members/{groupId}', function (Request $request,$groupId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $data = $this->app['db']->fetchAssoc("select * from groups where id = ? and organization_id = {$self->user['id']} ", array($groupId));
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            
            $list = $self->app['db']->fetchAll("
                select user.*,user_mst.email
                from user 
                left join user_mst on user_mst.id = user.master_user_id
                where user.id in ( select user_id from group_member where group_id = ? ) 
                and user.is_deleted = 0  
                and organization_id = {$self->user['id']}  
                order by created desc limit " . PAGINATOR_PAGESIZE . " offset {$offset} ", array($groupId));

            $countAssoc = $self->app['db']->fetchAssoc("
                select count(*) as count 
                from user 
                left join user_mst on user_mst.id = user.master_user_id
                where user.id in ( select user_id from group_member where group_id = ? ) 
                and user.is_deleted = 0 
                and organization_id = {$self->user['id']} ", array($groupId));
            
            $count = $countAssoc['count'];
            
            $memberList = $self->app['db']->fetchAll("
                select user.id,user_mst.email
                from user 
                left join user_mst on user_mst.id = user.master_user_id
                where user_mst.is_deleted = 0 
                and not user_mst.id in ( select user_id from group_member where group_id = ? ) 
                and organization_id = {$self->user['id']} ", array($groupId));
            
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

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $self->setInfoMessage($self->lang['groups28']);
            
            $formValues = $request->request->all();
            
            if(isset($formValues['usersselect']) && is_array($formValues['usersselect'])){
                $usersToAdd = $formValues['usersselect'];
            }
            
			//get chat id
			$chat = $self->app['db']->fetchAssoc("select * from chat where group_id = ? and organization_id = {$self->user['id']} ", array($groupId));
			$chat_id = $chat['id'];
			//get chat members
			$chatUsersList = $self->app['db']->fetchAll("select user_id from chat_member where chat_id = ? and organization_id = {$self->user['id']} ", array($chat_id));
            $originalChatUsers = array();
            
            foreach($chatUsersList as $row){
                $originalChatUsers[] = $row['user_id'];
            }
			
			//get group members
            $usersList = $self->app['db']->fetchAll("select user_id from group_member where group_id = ? and organization_id = {$self->user['id']} ", array($groupId));
            $originalUsers = array();
            
            foreach($usersList as $row){
                $originalUsers[] = $row['user_id'];
            }

            foreach($usersToAdd as $userId){
                             
                if(!in_array($userId, $originalUsers)){
                    
                    $app['db']->insert('group_member', array(
                        'organization_id' => $self->user['id'],
                        'group_id' => $groupId,
                        'user_id' => $userId,
                        'created' => time(),
                        'modified' => time()
                    ));
                                 
                }
				
				//add to chat
				if(!in_array($userId, $originalChatUsers)){
                    
                    $app['db']->insert('chat_member', array(
                        'organization_id' => $self->user['id'],
                        'chat_id' => $chat_id,
                        'user_id' => $userId,
                        'created' => time(),
                        'modified' => time()
                    ));
                                 
                }
                
            }
            
            return $app->redirect(ADMIN_ROOT_URL . '/groups/members/' . $groupId);
            			
		});
		
		$controllers->get('/members_delete/{groupId}/{userId}', function (Request $request,$groupId,$userId) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $self->setInfoMessage($self->lang['groups28']);

            $app['db']->delete('group_member', array(
                'group_id' => $groupId,
                'user_id' => $userId
            ));
			
			//get chat id
			$chat = $self->app['db']->fetchAssoc("select * from chat where group_id = ? and organization_id = {$self->user['id']} ", array($groupId));
			$chat_id = $chat['id'];
            
			//delete user from chat
			 $app['db']->delete('chat_member', array(
                'chat_id' => $chat_id,
                'user_id' => $userId
            ));
			
            return $app->redirect(ADMIN_ROOT_URL . '/groups/members/' . $groupId);
            			
		});
		
		
		return $controllers;
		
	}
	
	function defaultFormValues(){
    	return array(
    	    'id' => '',
    	    'name' => '',
    	    'category' => 0
    	);
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

    
    	if(empty($formValues['name']))
    	    return $this->lang['validateionError4'];
        	    

        if($isEdit == false){

            $checkDuplication = $this->app['db']->fetchAll("select * from groups where name = ? and organization_id = {$this->user['id']} and is_deleted = 0", array($formValues['name']));

            if(count($checkDuplication) > 0)
                return $this->lang['validateionError5'];

        } else {
            
            $checkDuplication = $this->app['db']->fetchAll("select * from groups where name = ? and organization_id = {$this->user['id']} and id != ? and is_deleted = 0", array($formValues['name'],$formValues['id']));
            
            if(count($checkDuplication) > 0)
                return $this->lang['validateionError5'];
                
        }


        return '';
    	
	}
	
	function getCategoryList(){
    	
    	$categories = $this->app['db']->fetchAll("select * from categories where organization_id = {$this->user['id']} and is_deleted = 0", array());
        
        $categoryList = array();
        
        $categoryList[0] = '';
        
        foreach($categories as $row){
            $categoryList[$row['id']] = $row['name'];
        }
        
        return $categoryList;
	}

	function getDataUsage($app){
    	
        $organization = $app['db']->fetchAssoc('select * from organization where id = ?',array($this->user['id']));
        $limit = $organization['max_groups'];
        $usageData = $app['db']->fetchAssoc('select count(*) as count from groups where organization_id = ? and is_deleted = 0',array($this->user['id']));
        $usage = $usageData['count'];
        
        return array(
            'limit' => $limit,
            'usage' => $usage,
            'persentage' => floor(intval($usage) / intval($limit) * 100)
        );
            
	}
	
	
}