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
            
            $list = $self->app['db']->fetchAll("
                select 
                    user.id,
                    user_mst.email,
                    user.is_valid,
                    user.is_admin,
                    user.created
                from user
                left join user_mst on user.master_user_id = user_mst.id
                where user.is_deleted = 0 and organization_id = {$self->user['id']} 
                order by user_mst.created desc limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            
            $countAssoc = $self->app['db']->fetchAssoc("
                select count(*) as count 
                from user 
                left join user_mst on user.master_user_id = user_mst.id
                where user.is_deleted = 0 and organization_id = {$self->user['id']} ");
            
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
				       
        /* user add */
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            
            $dataUsage = $self->getDataUsage($app);

            return $self->render('users_add.twig', array(
                 'form' => $self->defaultFormValuesAdd(),
                 'mode' => 'add',
                 'limit' => $dataUsage['limit'],
                 'usage' => $dataUsage['usage'],
                 'persentage' => $dataUsage['persentage']
            ));
            			
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $formValues = $request->request->all();
            
            $errorMessage = $self->validate($request);

            $dataUsage = $self->getDataUsage($app);
            
            if($dataUsage['usage'] >= $dataUsage['limit']){
                
                $errorMessage = $self->lang['validateionError12'];
                
            }
            
            
            if(!empty($errorMessage)){
                
                $self->setErrorMessage($errorMessage);
                
                return $self->render('users_add.twig', array(
                    'form' => $formValues,
                    'mode' => 'add',
                    'limit' => $dataUsage['limit'],
                    'usage' => $dataUsage['usage'],
                    'persentage' => $dataUsage['persentage']
                ));
                
            }else{
                
                $email = $formValues['email'];
                $firstname = $formValues['firstname'];
                $lastname = $formValues['lastname'];
                
                $existData = $self->app['db']->fetchAssoc("select * from user_mst where email = ?", array($email));
                
                if(!isset($existData['id'])){
                    
                    $app['db']->insert('user_mst', array(
                        'email' => $email,
                        'email_verified' => 0,
                        'created' => time()
                    ));

                    $existData = $self->app['db']->fetchAssoc("select * from user_mst where email = ?", array($email));
                    
                }
                
                // check deleted users
                $deletedUser = $self->app['db']->fetchAssoc("
                    select * 
                    from user 
                    where master_user_id = ?
                    and organization_id = ?", 
                    array($existData['id'],$self->user['id']));

                $code = $self->randomString(32,32);

                if(isset($deletedUser['id'])){
                    
                    $app['db']->update('user',array(
    			        'firstname' => $firstname,
    			        'lastname' => $lastname,
                        'is_deleted' => 0,
                        'is_valid' => 0,
                        'registration_code' => $code,
                        'modified' => time()
                    ),array(
                        'id' => $deletedUser['id']
                    ));
                    
                }else{
                    
        			$values = array('outside_id' => 0,
        			        'organization_id' => $self->user['id'],
        			        'master_user_id' => $existData['id'],
        			        'firstname' => $firstname,
        			        'lastname' => $lastname,
        			        'registration_code' => $code,
        					'created' => time(), 
        					'modified' => time());
    
        			$app['db']->insert('user', $values);
    			   
                }
                
                $registraionUrl = CONTENTS_URL . "/accept/" . $code;
                
                // send invitation email
                $self->sendEmail($email,$self->lang['users48'],'You got invitation for Spika Enterprise
Please finish registration from following URL.
' . $registraionUrl);
                
                $dataUsage = $self->getDataUsage($app);
                
                $self->setInfoMessage($self->lang['users14']);
                
                return $app->redirect(ADMIN_ROOT_URL . '/users');
                
            }
            			
		});

		$controllers->get('/disable/{userid}', function (Request $request,$userid) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            
            $app['db']->update('user',array(
                'is_valid' => 0
            ),array('id'=>$userid));
            
            $self->setInfoMessage($self->lang['users51']);
            
            return $app->redirect(ADMIN_ROOT_URL . '/users');
            			
		});
		
		$controllers->get('/delete/{userid}', function (Request $request,$userid) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            
            $app['db']->update('user',array(
                'is_deleted' => 1
            ),array('id'=>$userid));
            
            $self->setInfoMessage($self->lang['users51']);
            
            return $app->redirect(ADMIN_ROOT_URL . '/users');
            			
		});
		
		$controllers->get('/resend/{userid}', function (Request $request,$userid) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'users';
            $userMst = $app['db']->fetchAssoc("select * from user_mst where id in ( select master_user_id from user where id = ? )",array($userid));
            
            $code = $self->randomString(32,32);
            
            $app['db']->update('user',array(
    			 'registration_code' => $code
            ),array('id'=>$userid));
            
            $registraionUrl = CONTENTS_URL . "/accept/" . $code;
            
            $self->sendEmail($userMst['email'],$self->lang['users48'],'You got invitation for Spika Enterprise
Please finish registration from following URL.
' . $registraionUrl);

            $self->setInfoMessage($self->lang['users52']);

            return $app->redirect(ADMIN_ROOT_URL . '/users');
            			
		});

		$controllers->get('/sendmessage', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'sendmessage';
            
            // get number of all users
            $userList = $app['db']->fetchAll('
                select * from user where organization_id = ?
            ',array($self->user['id']));
            
            $groupList = $app['db']->fetchAll('
                select * from groups where organization_id = ?
            ',array($self->user['id']));
            
            $roomList = $app['db']->fetchAll('
                select * from chat where organization_id = ? and type=3
            ',array($self->user['id']));
            
            return $self->render('users_sendmessage.twig', array(
                'userList' => $userList,
                'groupList' => $groupList,
                'roomList' => $roomList,
                'userCount' => count($userList)
            ));
            			
		});

		$controllers->post('/sendmessage/user', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $formValues = $request->request->all();
            $userId = $formValues['touserid'];
            $message = $formValues['message'];
            
            $self->sendMessageToUserAsAdmin($self->user['id'],$userId,$message);

            return 'OK';
            			
		});
				
		$controllers->post('/sendmessage/group', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $formValues = $request->request->all();
            $groupId = $formValues['togroupid'];
            $message = $formValues['message'];

            $self->sendMessageToGroupAsAdmin($self->user['id'],$groupId,$message);
			
            return 'OK';
            			
		});

		$controllers->post('/sendmessage/room', function (Request $request) use ($app, $self){
            
            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $formValues = $request->request->all();
            $roomId = $formValues['toroomid'];
            $message = $formValues['message'];

            $self->sendMessageToRoomAsAdmin($self->user['id'],$roomId,$message);

            return 'OK';
            			
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
	
	function defaultFormValuesAdd(){
    	return array(
    	    'id' => '',
    	    'email' => '',
    	    'firstname' => '',
    	    'lastname' => ''
    	);
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

        
        if($isEdit == false){
    
        	if(empty($formValues['email']))
        	    return $this->lang['validateionError10'];
        	    
            $test =  $this->app['db']->fetchAssoc("
                select * 
                from user where organization_id = ? 
                and master_user_id in (
                    select id from user_mst where email = ?
                )
                and is_deleted = 0", array(
                    $this->user['id'],
                    $formValues['email']
                ));
            
            if(isset($test['id'])){
                
                return $this->lang['validateionError11'];
                
            }
        }

            
        return '';
    	
	}
	
	function getDataUsage($app){
    	
        $organization = $app['db']->fetchAssoc('select * from organization where id = ?',array($this->user['id']));
        $limit = $organization['max_users'];
        $usageData = $app['db']->fetchAssoc('select count(*) as count from user where organization_id = ? and is_deleted = 0',array($this->user['id']));
        $usage = $usageData['count'];
        
        return array(
            'limit' => $limit,
            'usage' => $usage,
            'persentage' => floor(intval($usage) / intval($limit) * 100)
        );
            
	}

	
}