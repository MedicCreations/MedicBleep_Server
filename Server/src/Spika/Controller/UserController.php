<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class UserController extends SpikaBaseController {
	
	static $paramName = 'file';
	static $fileDirName = 'Uploads';
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		$ldap = new Ldap();
		
		$controllers = $app ['controllers_factory'];
		
		// pre login
		$controllers->post ( '/prelogin', function (Request $request) use($app, $self, $mySql, $ldap) {
            
            $body = $request->getContent();
            
            $app['monolog']->addDebug("--" . $body . "---");
            
			$paramsAry = $request->request->all();
			
			$username = $paramsAry['username'];
			$password = $paramsAry['password'];

			//try login with temp password
			$user = $mySql->loginWithTempPass($app, $username, $password);
			
			if (is_array($user)){
			
				$temp_pass_timestamp = $user ['temp_password_timestamp'];
				$currentTimestamp = time ();
				$temp_pass_time = $temp_pass_timestamp + PW_RESET_CODE_VALID_TIME;
					
				if ($temp_pass_time < $currentTimestamp) {
					//temp password is not valid
					$result = array(
						'code' => ER_TEMP_PASSWORD_NOT_VALID,
						'message' => 'Temp password not valid'
					);

					return $app->json($result, 200);
				} else {
					//temp password is valid
					$result = array(
						'code' => ER_LOGIN_WITH_TEMP_PASS,
						'message' => 'Login with temp password'
					);
					
					return $app->json($result, 200);
				}
			
			}
			
            $organizations = $mySql->getOrganizationsByCredential($app, $username, $password);
            
            if(count($organizations) > 0){
    			$result = array(
    			    'code' => CODE_SUCCESS, 
    			    'organizations' => $organizations);
    			
            } else {
                $result = array('code' => ER_INVALID_LOGIN, 'message' => 'Invalid username or password');
            }
            
            return $app->json($result, 200);
			
		});
		
		// login user
		$controllers->post ( '/login', function (Request $request) use($app, $self, $mySql, $ldap) {
						
			$paramsAry = $request->request->all();
			
			$username = $paramsAry['username'];
			$password = $paramsAry['password'];
			$organizationId = 0;
			
			if(isset($paramsAry['organization_id'])){
    			$organizationId = $paramsAry['organization_id'];
			}
			
			//login
			$login_result = $mySql->loginUser($app, $password, $username, $organizationId, $self->getDeviceType($request->headers->get('user-agent')) );
			
			if ($login_result['auth_status'] === FALSE) {
				$result = array('code' => ER_INVALID_LOGIN, 'message' => 'Invalid username or password');
			} else {
				$result = array('code' => CODE_SUCCESS, 
						'user_id' =>  $login_result['user']['id'],
						'organization_id' =>  $login_result['user']['organization_id'],
						'token' => $login_result['user']['token'],
						'firstname' => $login_result['user']['firstname'],
						'lastname' => $login_result['user']['lastname'],
						'image' => $login_result['user']['image'],
						'organizations' => $login_result['organizations'],
						'image_thumb' => $login_result['user']['image_thumb']);
				
				// regist device
                $userAgent = $request->headers->get('user-agent');
                
                $mySql->registDevice($app,
                                    $login_result['user']['id'],
                                    $login_result['user']['token'],
                                    $self->getDeviceType($request->headers->get('user-agent')));
				
			}
			
			
			return $app->json($result, 200);
			
		});
		
		//return list of users
		$controllers->get('/webkeepalive', function (Request $request) use ($app, $self, $mySql, $ldap){
			
			$paramsAry = $request->query->all();
		
			$user_id = $app['user']['id'];
			
			$values = array(
			        'web_opened' => 1,
			        'web_lastkeepalive' => time()
            );
			
			$mySql->updateUser($app, $user_id, $values);
		
			$result = array(
			        'code' => CODE_SUCCESS,
					'message' => 'OK'
            );

			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);

        
		//return list of users
		$controllers->get('/list', function (Request $request) use ($app, $self, $mySql, $ldap){
			
			$paramsAry = $request->query->all();
			
			$search = "";
			if (array_key_exists('search', $paramsAry)){
				$search = $paramsAry['search'];
			}
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$chat_id = "";
			if (array_key_exists('chat_id', $paramsAry)){
				$chat_id = $paramsAry['chat_id'];
			}
			$my_user_id = $app['user']['id'];
			$offset = $page * USERS_PAGE_SIZE;
			
			$users = $mySql->getUsersNotMe($app, $my_user_id, $search, $offset);
			
			if ($page > 0 && count($users) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			$users_count = $mySql->getUsersCountNotMe($app, $my_user_id, $search);
			
			if ($chat_id != ""){
				$chat_members = $mySql->getChatMembers($app, $chat_id);
				
				foreach($users as &$temp_user){
					$temp_user['is_member'] = false;
					foreach ($chat_members as $member){
						if ($temp_user['id'] == $member['user_id']){
							$temp_user['is_member'] = true;
							break;
						}
					}
				}
			}
			
			$newUserAry = array();
			
			foreach($users as $user){
			    unset($user['details']);
			    $newUserAry[] = $user;   
			}
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => USERS_PAGE_SIZE,
					'total_count' => $users_count,
					'users' => $newUserAry);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//create chat with user
		$controllers->post('/chat/start', function (Request $request) use($app, $self, $mySql) {
				
			$paramsAry = $request->request->all();
			
			$other_user_id = $paramsAry['user_id'];
			$firstname = $paramsAry['firstname'];
			$lastname = $paramsAry['lastname'];
			
			$chat_name = $firstname . ' ' . $lastname;
			
			$user = $app['user'];
			$my_user_id = $user['id'];
			
			$members = array($my_user_id, $other_user_id);
			
			$custom_chat_id = $self->createChatCustomID($members);
			
			$chat_seen_by = "";
			
			$result = $mySql->isPrivateChatAlreadyExist($app, $custom_chat_id);
			
			if ($result['is_exist']){
				//get messages
				$chat_id = $result['chat_id'];
				$messages = $mySql->getLastMessages($app, $chat_id);
				$mySql->resetUnreadMessagesForMember($app, $chat_id, $my_user_id);
				
				//update seen
				$chat_seen_by = $self->updateSeen($app, $mySql, $chat_id);
				
			} else {
				//create chat and chat_members
				$chat_id = $mySql->createChat($app, "", CHAT_USER_TYPE, $my_user_id, 0, "", "", $custom_chat_id, 0, 0, "");
				$mySql->addChatMembers($app, $chat_id, $members);
				$messages = array();
			}
			
			$chat = $self->getChatData($app, $mySql, $chat_id);
			
			$total_count = $mySql->getCountMessagesForChat($app, $chat_id);
			
			$messages = $self->getFormattedMessages($messages);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK', 
					'chat_id' => $chat_id, 
					'chat_name' => $chat_name,
					'seen_by' => $chat_seen_by,
					'total_count' => $total_count, 
					'messages' => $messages,
					'chat' => $chat);
				
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update ios push token
		$controllers->post('/pushtoken/ios/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$push_token = $paramsAry['push_token'];
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
			
            $mySql->saveDeviceToken($app,$app['user']['token'],$push_token);
            
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update android push token
		$controllers->post('/pushtoken/android/update', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->request->all();
				
			$push_token = $paramsAry['push_token'];
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
					
            $mySql->saveDeviceToken($app,$app['user']['token'],$push_token);

			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update user image, firstname, lastname, details
		$controllers->post('/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$values = array();
			
			if (array_key_exists('image', $paramsAry)){
				$values['image'] = $paramsAry['image'];
			}
			if (array_key_exists('image_thumb', $paramsAry)){
				$values['image_thumb'] = $paramsAry['image_thumb'];
			}
			if (array_key_exists('details', $paramsAry)){
				$values['details'] = $paramsAry['details'];
			}
			if (array_key_exists('firstname', $paramsAry)){
				$values['firstname'] = $paramsAry['firstname'];
			}
			if (array_key_exists('lastname', $paramsAry)){
				$values['lastname'] = $paramsAry['lastname'];
			}
						
			$user_id = $app['user']['id'];
			
			$mySql->updateUser($app, $user_id, $values);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		

		//update user proflie
		$controllers->post('/updateProflie', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();

            $values = array();
            $values['firstname'] = $paramsAry['firstname'];
            $values['lastname'] = $paramsAry['lastname'];
            $values['details'] = $paramsAry['details'];
            		
			$user_id = $app['user']['id'];
			
			$mySql->updateUser($app, $user_id, $values);
			
			$result = array(
			        'code' => CODE_SUCCESS,
					'message' => 'OK'
            );
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);		

		//get user profile
		$controllers->get('/profile', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->query->all();
			
			$get_detail_values = 0;
			
			if (array_key_exists('get_detail_values', $paramsAry)){
				$get_detail_values = $paramsAry['get_detail_values'];
			}
				
			$user_id = $paramsAry['user_id'];
		
			$user = $mySql->getUserByID($app, $user_id);
			
			unset($user['password']);
			
			$details = json_decode($user['details'],true);
			$user['details'] = $details;
			
			$user['organization'] = $mySql->getOrganizationByID($app, $app['user']['organization_id']);
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK', 
					'user' => $user);
					
			if ($get_detail_values){
				$detail_values = $mySql->getDetailValues($app);
				$result['detail_values'] = $detail_values;
			}
		
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//logout api
		$controllers->post('/logout', function (Request $request) use ($app, $self, $mySql){
		
			$paramsAry = $request->request->all();
		
			$user_id = $app['user']['id'];
			
			$values = array(
			        'web_opened' => 0,
			        'token' => 0,
			        'last_device_id' => 0);
			
			$mySql->updateUser($app, $user_id, $values);
		
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');

            $mySql->unRegistDevice($app,
                                $user_id,
                                $app['user']['token'],
                                $self->getDeviceType($request->headers->get('user-agent')));


			return $app->json($result, 200);
		
		})->before($app['beforeSpikaTokenChecker']);
		
		
		$controllers->get('/information', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$result = array('code' => CODE_SUCCESS,
						'message' => 'OK',
						'url' => INFORMATION_URL . $app['user']['token']);
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		$controllers->post('password/forgot', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$username = $paramsAry['username'];
			
			$user = $mySql->getUserByUsername($app, $username);
			
			if (!is_array($user)){
			
				$result = array('code' => ER_USERNAME_NOT_EXIST,
					'message' => 'Username doesn\'t exist');
				return $app->json($result, 200);
			
			}
			
			if (empty($user['email'])){
				$result = array('code' => ER_EMAIL_MISSING,
					'message' => 'Your email is missing');
				return $app->json($result, 200);	
			}
			
			//create temp pass
			$temp_pass = $mySql->createTempPassword($app, $user['id']);
			
			$self->sendEmail($user['email'],'Spika forgot password','Your temp password is: ' . $temp_pass . ' and will be valid for one hour');
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
		
			return $app->json($result, 200);
		
		});
		
		
		$controllers->post('password/change', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$temp_password = $paramsAry['temp_password'];
			$new_password = $paramsAry['new_password'];
			
			$user = $mySql->getUserByTempPassword($app, $temp_password);
			
			if (!is_array($user)){
			
				$result = array('code' => ER_INVALID_TEMP_PASSWORD,
					'message' => 'User doesn\'t exist');
				return $app->json($result, 200);
			
			}
			
			$my_user_id = $user['id'];
						
			$mySql->updateUserPassword($app, $my_user_id, $new_password);
						
            $organizations = $mySql->getOrganizationsByCredential($app, $user['username'], $new_password);
    			    
			$result = array('code' => CODE_SUCCESS,'organizations' => $organizations);
		
			return $app->json($result, 200);
		
		});
		
		
		$controllers->post('password/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$new_password = $paramsAry['new_password'];
			
			$my_user_id = $app['user']['master_user_id'];
			
			$passwordExist = $mySql->checkPassword($app, $app['user']['username'], $new_password);
			
			if ($passwordExist){
				
				$result = array('code' => ER_PASSWORD_EXIST,
					'message' => 'Password already exist');
				return $app->json($result, 200);
			
			}
			
			$token = $self->randomString(40,40);
			$values = array('password' => $new_password);
			
			$mySql->updateUserMst($app, $app['user']['master_user_id'], $values);

			$values = array('token' => $token);
			$mySql->updateUser($app, $app['user']['id'], $values);
			

			
			$user = $mySql->getUserById($app, $app['user']['id']);
			
			$result = array('code' => CODE_SUCCESS,
						'user_id' =>  $user['id'],
						'token' => $user['token'],
						'firstname' => $user['firstname'],
						'lastname' => $user['lastname'],
						'image' => $user['image'],
						'image_thumb' => $user['image_thumb']);
		
			return $app->json($result, 200);
		
		})->before($app['beforeSpikaTokenChecker']);
		
		
		$controllers->get('push', function (Request $request) use ($app, $self, $mySql){
			
			$my_user_id = $app['user']['id'];
			
			$chats = $mySql->getUnreadChats($app, $my_user_id);
			
			foreach($chats as &$chat){
				$sender = $mySql->getLastMsgSender($app, $chat['chat_id']);
				$chat['firstname'] = $sender['firstname'];
				$chat['type'] = PUSH_TYPE_MESSAGE;
				
				$mySql->updateSentLocalPush($app, $chat['chat_id'], $my_user_id);
			}
			
			$result = array('code' => CODE_SUCCESS,
						'chats' => $chats);
		
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		$controllers->get('test', function (Request $request) use ($app, $self, $mySql){
			
			$chat_id = 762;
			
			$messages = $mySql->getLastMessages($app, $chat_id);
			
			var_dump($messages);
			
			$messages = $self->getFormattedMessages($messages);
			
			var_dump($messages);
						
			$result = "OK";
			return $app->json($result, 200);
			
		});
		
		return $controllers;
	}
	
}