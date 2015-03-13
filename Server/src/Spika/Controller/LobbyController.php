<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class LobbyController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		$ldap = new Ldap();
		
		$controllers = $app ['controllers_factory'];
		
		//get group list
		$controllers->get('/list', function (Request $request) use ($app, $self, $mySql, $ldap){
			
			$paramsAry = $request->query->all();
			
			$type = 0;
			if (array_key_exists('type', $paramsAry)){
				$type = $paramsAry['type'];
			}
			
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			
			$user_id = $app['user']['id'];
			
			$offset = $page*RECENT_PAGE_SIZE;
			
			switch ($type){
				case LOBBY_ALL_TYPE: 
					
					$recent_users_chats = $mySql->getRecentPrivateChats($app, $user_id, $offset);
					$recent_users_count = $mySql->getCountRecentPrivateChats($app, $user_id);
						
					foreach ($recent_users_chats as &$chat){
						
						$category = $mySql->getCategoryById($app, $chat['category_id']);
						$chat['category'] = $category;
						
						//find name of private chat
						$chat_data = $mySql->getPrivateChatData($app, $chat['chat_id'], $user_id);
						$chat['chat_name'] = $chat_data['name'];
						$chat['image'] = $chat_data['image'];
						$chat['image_thumb'] = $chat_data['image_thumb'];
						
						$last_message = $mySql->getLastMessage($app, $chat['chat_id']);
						$last_message = $self->getFormattedMessage($last_message);
						$chat['last_message'] = $last_message;
					
					}
						
					$recent_groups_chats = $mySql->getRecentGroupChats($app, $user_id, $offset);
					$recent_groups_count = $mySql->getCountRecentGroupChats($app, $user_id);
					
					foreach ($recent_groups_chats as &$chat){
					
						$category = $mySql->getCategoryById($app, $chat['category_id']);
						$chat['category'] = $category;
						
						if ($chat['chat_name'] == ""){
							$chat_members = $mySql->getChatMembers($app, $chat['chat_id']);
							$chat['chat_name'] = $self->createChatName($app, $mySql, $chat_members, array());
						}
						
						$last_message = $mySql->getLastMessage($app, $chat['chat_id']);
						$last_message = $self->getFormattedMessage($last_message);
						$chat['last_message'] = $last_message;
						
					}
						
					$result = array('code' => CODE_SUCCESS,
							'message' => 'OK',
							'page' => $page,
							'users' => array('total_count' => $recent_users_count,
									'user_chats' => $recent_users_chats),
							'groups' => array('total_count' => $recent_groups_count,
									'group_chats' => $recent_groups_chats));
					
					break;
				case LOBBY_USERS_TYPE:
					
					$recent_users_chats = $mySql->getRecentPrivateChats($app, $user_id, $offset);
					
					if ($page > 0 && count($recent_users_chats) == 0){
						$result = array('code' => ER_PAGE_NOT_FOUND, 
							'message' => 'Page not found');
						return $app->json($result, 200);
					}
					
					$recent_users_count = $mySql->getCountRecentPrivateChats($app, $user_id);
					
					foreach ($recent_users_chats as &$chat){
					
						$category = $mySql->getCategoryById($app, $chat['category_id']);
						$chat['category'] = $category;
							
						//find name of private chat
						$chat_data = $mySql->getPrivateChatData($app, $chat['chat_id'], $user_id);
						$chat['chat_name'] = $chat_data['name'];
						$chat['image'] = $chat_data['image'];
						$chat['image_thumb'] = $chat_data['image_thumb'];
						
						$last_message = $mySql->getLastMessage($app, $chat['chat_id']);
						$last_message = $self->getFormattedMessage($last_message);
						$chat['last_message'] = $last_message;
							
					}
					
					$result = array('code' => CODE_SUCCESS,
							'message' => 'OK',
							'page' => $page,
							'users' => array('total_count' => $recent_users_count,
									'user_chats' => $recent_users_chats));
					
					break;
				case LOBBY_GROUPS_TYPE:
					
					$recent_groups_chats = $mySql->getRecentGroupChats($app, $user_id, $offset);
					
					if ($page > 0 && count($recent_groups_chats) == 0){
						$result = array('code' => ER_PAGE_NOT_FOUND, 
							'message' => 'Page not found');
						return $app->json($result, 200);
					}
					
					$recent_groups_count = $mySql->getCountRecentGroupChats($app, $user_id);
					
					foreach ($recent_groups_chats as &$chat){
					
						$category = $mySql->getCategoryById($app, $chat['category_id']);
						$chat['category'] = $category;
					
						if ($chat['chat_name'] == ""){
							$chat_members = $mySql->getChatMembers($app, $chat['chat_id']);
							$chat['chat_name'] = $self->createChatName($app, $mySql, $chat_members, array());
						}
						
						$last_message = $mySql->getLastMessage($app, $chat['chat_id']);
						$last_message = $self->getFormattedMessage($last_message);
						$chat['last_message'] = $last_message;
					
					}
					
					$result = array('code' => CODE_SUCCESS,
							'message' => 'OK',
							'page' => $page,
							'groups' => array('total_count' => $recent_groups_count,
									'group_chats' => $recent_groups_chats));
					
					break;
				case LOBBY_ALL_TOGETHER_TYPE:
					
					$recent_all_chats = $mySql->getRecentAllChats($app, $user_id, $offset);
					
					if ($page > 0 && count($recent_all_chats) == 0){
						$result = array('code' => ER_PAGE_NOT_FOUND, 
							'message' => 'Page not found');
						return $app->json($result, 200);
					}
					
					$recent_all_chats_count = $mySql->getCountRecentAllChats($app, $user_id);
					
					foreach ($recent_all_chats as &$chat){
					
						$category = $mySql->getCategoryById($app, $chat['category_id']);
						$chat['category'] = $category;
						
						if ($chat['chat_name'] == ""){
							if ($chat['type'] == CHAT_USER_TYPE){
								$chat_data = $mySql->getPrivateChatData($app, $chat['chat_id'], $user_id);
								$chat['chat_name'] = $chat_data['name'];
								$chat['image'] = $chat_data['image'];
								$chat['image_thumb'] = $chat_data['image_thumb'];
							} else {
								$chat_members = $mySql->getChatMembers($app, $chat['chat_id']);
								$chat['chat_name'] = $self->createChatName($app, $mySql, $chat_members, array());
							}
						}
						
						$last_message = $mySql->getLastMessage($app, $chat['chat_id']);
						$last_message = $self->getFormattedMessage($last_message);
						$chat['last_message'] = $last_message;
						
					}
					
					$result = array('code' => CODE_SUCCESS,
							'message' => 'OK',
							'page' => $page,
							'all_chats' => array('total_count' => $recent_all_chats_count,
									'chats' => $recent_all_chats));
					
					break;
			}
			
			
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}