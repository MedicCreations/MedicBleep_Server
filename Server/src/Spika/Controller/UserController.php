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
		
		// register user
		$controllers->post ( '/login', function (Request $request) use($app, $self, $mySql, $ldap) {
			
			$paramsAry = $request->request->all();
			
			$username = $paramsAry['username'];
			$password = $paramsAry['password'];
			
// 			$password = pack("H*", md5($password));
// 			$password = base64_encode($password);
			
// 			$password = md5($password);
// 			$password = base64_encode($password);
			
			$android_push_token ="";
			$ios_push_token = "";
			if (array_key_exists('android_push_token', $paramsAry)){
				$android_push_token = $paramsAry['android_push_token'];
			}
			if (array_key_exists('ios_push_token', $paramsAry)){
				$ios_push_token = $paramsAry['ios_push_token'];
			}
			
			//login on ldap
			//$ldap_result = $ldap->checkUser($app, $password, $username);
			
			//login
			$login_result = $mySql->loginUser($app, $password, $username, $android_push_token, $ios_push_token );
			
			if ($login_result['auth_status'] === FALSE) {
				$result = array('code' => ER_INVALID_LOGIN, 'message' => 'Invalid username or password');
			} else {
				$result = array('code' => CODE_SUCCESS, 
						'user_id' =>  $login_result['user']['id'],
						'token' => $login_result['user']['token'],
						'firstname' => $login_result['user']['firstname'],
						'lastname' => $login_result['user']['lastname'],
						'image' => $login_result['user']['image']);
			}
			
			//$result = $mySql->registerUser($app, $ldap_result['uid_number'], $ldap_result['firstname'], $ldap_result['lastname'], $password, $username, $android_push_token, $ios_push_token);
			
			return $app->json($result, 200);
			
		});
		
		
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
			$users_count = $mySql->getUsersCountNotMe($app, $my_user_id, $search);
			
			if ($chat_id != ""){
				$chat_members = $mySql->getChatMembers($app, $chat_id);
				
				foreach($users as &$user){
					$user['is_member'] = false;
					foreach ($chat_members as $member){
						if ($user['id'] == $member['user_id']){
							$user['is_member'] = true;
							break;
						}
					}
				}
			}
			
// 			$outside_id = $app['user']['outside_id'];
// 			$users = $ldap->getUsersList($app, $search, $outside_id);
			
// 			$page_users = array_slice($users, $offset, USERS_PAGE_SIZE);
			
// 			$mutual_users = $mySql->getAllUsersWithOutsideId($app, $page_users);
			
// 			foreach ($mutual_users as $mutual){
// 				$outside_id = $mutual['outside_id'];
// 				foreach ($page_users as &$user){
// 					if ($user['id'] == $outside_id){
// 						$user['image'] = $mutual['image'];
// 						$user['image_thumb'] = $mutual['image_thumb'];
// 						break;
// 					}
// 				}
// 			}
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'total_count' => $users_count,
					'users' => $users);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//return userId, if doesn't exist, create temp user
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
				$chat_id = $mySql->createChat($app, "", CHAT_USER_TYPE, 0, "", $custom_chat_id);
				$mySql->addChatMembers($app, $chat_id, $members);
				$messages = array();
			}
			
			$chat = $self->getChatData($app, $mySql, $chat_id);
			
			$total_count = $mySql->getCountMessagesForChat($app, $chat_id);
			
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
			
			$user_id = $app['user']['id'];
			
			$mySql->updateUserIOSPushToken($app, $user_id, $push_token);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update android push token
		$controllers->post('/pushtoken/android/update', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->request->all();
				
			$push_token = $paramsAry['push_token'];
				
			$user_id = $app['user']['id'];
				
			$mySql->updateUserAndroidPushToken($app, $user_id, $push_token);
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
				
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update user image
		$controllers->post('/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$image = $paramsAry['image'];
			$image_thumb = $paramsAry['image_thumb'];
						
			$user_id = $app['user']['id'];
			
			$mySql->updateUserImage($app, $user_id, $image, $image_thumb);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get user profile
		$controllers->get('/profile', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->query->all();
				
			$user_id = $paramsAry['user_id'];
		
			$user = $mySql->getUserByID($app, $user_id);
			
			$details = json_decode($user['details']);
		
			$user['details'] = $details;
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK', 
					'user' => $user);
		
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//logout api
		$controllers->post('/logout', function (Request $request) use ($app, $self, $mySql){
		
			$paramsAry = $request->request->all();
		
			$user_id = $app['user']['id'];
			
			$values = array('ios_push_token' => '', 
					'android_push_token' => '');
			
			$mySql->updateUser($app, $user_id, $values);
		
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
		
			return $app->json($result, 200);
		
		})->before($app['beforeSpikaTokenChecker']);
		
		
		$controllers->get('ldap', function (Request $request) use ($app, $self, $mySql, $ldap){
			
			$self->updateSeen($app, $mySql, 119);
			
			$result = array('info' => 'ok');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
}