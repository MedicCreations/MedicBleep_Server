<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class ChatController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		// //create room chat
		// $controllers->post('/create', function (Request $request) use ($app, $self, $mySql){
			
			// $paramsAry = $request->request->all();
			
			// $name = "";
			// $image = DEFAULT_GROUP_IMAGE;
			// $image_thumb = DEFAULT_GROUP_IMAGE;
			// $category_id = 0;
			// $is_private = 0;
			
			// $my_user_id = $app['user']['id'];
			
			// if (array_key_exists('name', $paramsAry)){
				// $name = $paramsAry['name'];
			// }
			// if (array_key_exists('image', $paramsAry)){
				// if ($paramsAry['image'] != ""){
					// $image = $paramsAry['image'];
				// }
			// }
			// if (array_key_exists('image_thumb', $paramsAry)){
				// if ($paramsAry['image_thumb'] != ""){
					// $image_thumb = $paramsAry['image_thumb'];
				// }
			// }
			
			// if (array_key_exists('category_id', $paramsAry)){
				// $category_id = $paramsAry['category_id'];
			// }
			
			// if (array_key_exists('is_private', $paramsAry)){
				// $is_private = $paramsAry['is_private'];
			// }
			
			// $users_to_add = $paramsAry['users_to_add'];
			// $users_to_add_ary = explode(',', $users_to_add);
			
			// $custom_chat_id = $self->createChatCustomID($users_to_add_ary);
			
			// $chat_id = $mySql->createChat($app, $name, CHAT_ROOM_TYPE, $my_user_id, 0, $image, $image_thumb, $custom_chat_id, $category_id, $is_private, "");
				
			// $mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
			
			// $chat = $mySql->getChatWithID($app, $chat_id);
			// $chat['chat_name'] = $name;
			// $chat['chat_id'] = $chat_id;
			
			// $result = array('code' => CODE_SUCCESS, 
					// 'message' => 'OK',
					// 'chat' => $chat);
			
			// return $app->json($result, 200);
			
		// })->before($app['beforeSpikaTokenChecker']);
		
		
		//add members to chat
		$controllers->post('/member/add', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$my_user_id = $app['user']['id'];
			
			$users = array();
			$groups = array();
			$rooms = array();
			
			$chat_id = "";
			if (array_key_exists('chat_id', $paramsAry)){
				$chat_id = $paramsAry['chat_id'];
				$chat = $mySql->getChatWithID($app, $chat_id);
				
				$old_room_ids = $chat['room_ids'];
				$old_group_ids = $chat['group_ids'];
			}
			
			
			//handle group_ids
			$group_ids = "";
			if (array_key_exists('group_ids', $paramsAry) && $paramsAry['group_ids'] != ""){
				$group_ids = trim($paramsAry['group_ids'], ","); 
			}
			$group_all_ids = "";
			if (array_key_exists('group_all_ids', $paramsAry) && $paramsAry['group_all_ids'] != ""){
				$group_all_ids = trim($paramsAry['group_all_ids'], ",");
			}
			$group_ids .= ',' . $group_all_ids;
			$group_ids = $old_group_ids . ',' . trim($group_ids, ","); 
				
			$values = array('group_ids' => trim($group_ids, ","));
			$mySql->updateChat($app, $chat_id, $values);
			
			//handle room_ids
			$room_ids = "";
			if (array_key_exists('room_ids', $paramsAry) && $paramsAry['room_ids'] != ""){
				$room_ids = trim($paramsAry['room_ids'], ",");
			}
			$room_all_ids = "";
			if (array_key_exists('room_all_ids', $paramsAry) && $paramsAry['room_all_ids'] != ""){
				$room_all_ids = trim($paramsAry['room_all_ids'], ",");
			}
			
			$room_ids .= ',' . $room_all_ids;
			$room_ids = $old_room_ids . ',' . trim($room_ids, ",");
				
			$values = array('room_ids' => trim($room_ids, ","));
			$mySql->updateChat($app, $chat_id, $values);
			
			
			$users_to_add = trim($paramsAry['users_to_add'], ",");
			
			//create distinct users
			if ($users_to_add != ""){
				//get users for room
				$users = $mySql->getUsersForRoom($app, $users_to_add);
			}
			
			if ($group_all_ids != ""){
				//get group members for room
				$groups = $mySql->getGroupMembersForRoom($app, $group_all_ids);
			}
			
			if ($room_all_ids != ""){
				//get room members for room
				$rooms = $mySql->getRoomMembersForRoom($app, $room_all_ids);
			}
			
			$result = array_merge($users, $groups, $rooms);
			$result = array_map("unserialize", array_unique(array_map("serialize", $result)));
			
			$users_to_add_ary = array();
			
			
			
			foreach ($result as $res){
				array_push($users_to_add_ary, $res['id']);
			}
			
			
			
			if ($chat != ""){
					
				if ($chat['type'] == CHAT_USER_TYPE){
					//create new group user chat
					$chat_members = $mySql->getChatMembers($app, $chat_id);
				
					$members = array();
					foreach ($chat_members as $member){
						array_push($members, $member['user_id']);
					}
					$all_members = array_merge($members, $users_to_add_ary);
				
					$chat_name = $self->createChatName($app, $mySql, $chat_members, $users_to_add_ary);
				
					$custom_chat_id = $self->createChatCustomID($all_members);
				
					$chat_id = $mySql->createChat($app, "", CHAT_ROOM_TYPE, $my_user_id, 0, DEFAULT_GROUP_IMAGE, DEFAULT_GROUP_IMAGE, $custom_chat_id, 0, 0, "");
					$mySql->addChatMembers($app, $chat_id, $all_members);
					$messages = array();
				
				} else {
					//add new members
					$mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
				
					$chat_members = $mySql->getChatMembers($app, $chat_id);
				
					if ($chat['name'] != ""){
						$chat_name = $chat['name'];
					} else {
						$chat_name = $self->createChatName($app, $mySql, $chat_members, $users_to_add_ary);
					}
					
				
					$messages = $mySql->getLastMessages($app, $chat_id);
				
				}
			} else {
				$chat_name = $self->createChatName($app, $mySql, array(), $users_to_add_ary);
				
				$custom_chat_id = $self->createChatCustomID($users_to_add_ary);
				
				$chat_id = $mySql->createChat($app, "", CHAT_ROOM_TYPE, $my_user_id, 0, DEFAULT_GROUP_IMAGE, DEFAULT_GROUP_IMAGE, $custom_chat_id, 0, 0, "");
				
				$mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
				$messages = array();
			}
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			$chat['chat_name'] = $chat_name;
			$chat['chat_id'] = $chat_id;
			
			$total_count = $mySql->getCountMessagesForChat($app, $chat_id);
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK',
					'chat' => $chat,
					'total_count' => $total_count);
					// 'messages' => $messages);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get chat members list
		$controllers->get('/member/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = $paramsAry['chat_id'];
			
			$page = 0;
			$user_group_rooms = 0;
			
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			
			if (array_key_exists('user_group_rooms', $paramsAry)){
				$user_group_rooms = $paramsAry['user_group_rooms'];
			}
			
			$offset = $page*USERS_PAGE_SIZE;
			
			$admin = $mySql->getChatAdmin($app, $chat_id);
			$admin['is_admin'] = true;
			
			if ($user_group_rooms){
				$members = $mySql->getChatMembersGroupsRooms($app, $chat_id);
				
				foreach($members as $key => $member){
					if (isset($member['user_id'])){
						if ($member['user_id'] == $admin['user_id']){
								unset($members[$key]);
								break;
						}
					}
				}
			
				array_unshift($members, $admin);
				
			} else {
				$members = $mySql->getChatMembers($app, $chat_id);
			
				foreach($members as $key => $member){
					if ($member['user_id'] == $admin['user_id']){
							unset($members[$key]);
							break;
						}
				}
				
				array_unshift($members, $admin);
				
			}
			
			$page_members = array_slice($members, $offset, USERS_PAGE_SIZE);
			
			if ($page > 0 && count($page_members) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page, 
					'total_count' => count($members),
					'members' => $page_members);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update chat 
		$controllers->post('/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$chat_id = $paramsAry['chat_id'];
			
			$my_user_id = $app['user']['id'];
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			
			$admin_id = $chat['admin_id'];
			
			if ($admin_id != $my_user_id && array_key_exists('is_deleted', $paramsAry)){
			
				$result = array('code' => ER_NOT_GROUP_ADMIN, 
					'message' => 'You are not a group admin');
			
				return $app->json($result, 200);
			
			}
			
			unset($paramsAry['chat_id']);
			
			$paramsAry['modified'] = time();
			
			$mySql->updateChat($app, $chat_id, $paramsAry);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
			
		
		//get chat data
		$controllers->get('/data', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = $paramsAry['chat_id'];
			
			$chat = $self->getChatData($app, $mySql, $chat_id);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK', 
					'chat_data' => $chat);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get chat data from push
		$controllers->get('/start', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = $paramsAry['chat_id'];
			
			$my_user_id = $app['user']['id'];
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			if ($chat['name'] != ""){
				$chat_name = $chat['name'];
			} else {
				if ($chat['type'] == CHAT_USER_TYPE){
					$chat_data = $mySql->getPrivateChatData($app, $chat_id, $my_user_id);
					$chat_name = $chat_data['name'];
					$chat['image'] = $chat_data['image'];
					$chat['image_thumb'] = $chat_data['image_thumb'];
				} else {
					$chat_members = $mySql->getChatMembers($app, $chat_id);
					$chat_name = $self->createChatName($app, $mySql, $chat_members, array());
				}
			}
			
			if ($chat['group_id'] > 0){
				$self->mergeGroupChatUsers($app, $mySql, $chat['group_id'], $chat_id);
			}
			
			$chat['chat_name'] = $chat_name;
			$chat['chat_id'] = $chat_id;
			
			$category = $mySql->getCategoryById($app, $chat['category_id']);
			$chat['category'] = $category;
			
			//reset unread messages
			$mySql->resetUnreadMessagesForMember($app, $chat_id, $my_user_id);
			
			$messages = $mySql->getLastMessages($app, $chat_id);
			$total_messages = $mySql->getCountMessagesForChat($app, $chat_id);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK', 
					'chat' => $chat,
					'messages' => $messages,
					'total_count' => $total_messages);
					
			if ($chat['type'] == CHAT_USER_TYPE){
					$data = $mySql->getPrivateChatData($app, $chat_id, $my_user_id);
					$user = array('id' => $data['user_id'], 
							'firstname' => $data['user_firstname'],
							'lastname' => $data['user_lastname'],
							'image' => $data['image'],
							'image_thumb' => $data['image_thumb']);
							
					$result['user'] = $user;
				}
			
			
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		
		//leave chat
		$controllers->post('/leave', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->request->all();
				
			$chat_id = $paramsAry['chat_id'];
			
			$user_id = $app['user']['id'];
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			
			$values = array('is_deleted' => 1);
			$mySql->updateChatMember($app, $chat_id, $user_id, $values);
			
			if ($chat['name'] != ""){
				$chat_name = $chat['name'];
			} else {
				$chat_members = $mySql->getChatMembers($app, $chat_id);
				$chat_name = $self->createChatName($app, $mySql, $chat_members, array());
			}
			
			$chat['chat_name'] = $chat_name;
			$chat['chat_id'] = $chat_id;
			

			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK',
					'chat' => $chat);
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//remove members
		$controllers->post('/members/remove', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->request->all();
				
			$chat_id = $paramsAry['chat_id'];
			
			$user_id = $app['user']['id'];
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			
			if (array_key_exists('group_ids', $paramsAry) && $paramsAry['group_ids'] != ''){
				
				$group_ids = $paramsAry['group_ids'];
				$group_ids_ary = explode(',', $group_ids);
				//move groups from chat
				$new_group_ids = $chat['group_ids'];
				foreach($group_ids_ary as $group_id){
					
					$new_group_ids = str_replace(','.$group_id, "", $new_group_ids);
					$new_group_ids = str_replace($group_id, "", $new_group_ids);
					
				}
				
				$values = array('group_ids' => trim($new_group_ids, ","));
				$mySql->updateChat($app, $chat_id, $values);
				
				//move group members from chat
				$all_group_members = $mySql->getGroupMembersForRoom($app, $group_ids);
				$user_ids_for_delete = "";
				foreach($all_group_members as $member){
					$user_ids_for_delete .= $member['id'] . ',';
				}
				$user_ids_for_delete = rtrim($user_ids_for_delete, ",");
				
				$mySql->deleteChatMembers($app, $chat_id, $user_ids_for_delete);
				
			} 
			
			if (array_key_exists('room_ids', $paramsAry) && $paramsAry['room_ids'] != ''){
			
				$room_ids = $paramsAry['room_ids'];
				$room_ids_ary = explode(',', $room_ids);
				//move groups from chat
				$new_room_ids = $chat['room_ids'];
				foreach($room_ids_ary as $room_id){
					
					$new_room_ids = str_replace(','.$room_id, "", $new_room_ids);
					$new_room_ids = str_replace($room_id, "", $new_room_ids);
					
				}
				
				$values = array('room_ids' => trim($new_room_ids, ","));
				$mySql->updateChat($app, $chat_id, $values);
				
				//move room members from chat
				$all_room_members = $mySql->getRoomMembersForRoom($app, $room_ids);
				$user_ids_for_delete = "";
				foreach($all_room_members as $member){
					$user_ids_for_delete .= $member['id'] . ',';
				}
				$user_ids_for_delete = rtrim($user_ids_for_delete, ",");
				
				$mySql->deleteChatMembers($app, $chat_id, $user_ids_for_delete);
				
			}
			
			if(array_key_exists('user_ids', $paramsAry) && $paramsAry['user_ids'] != ''){
				
				$user_ids_for_delete = $paramsAry['user_ids'];
				$mySql->deleteChatMembers($app, $chat_id, $user_ids_for_delete);
				
			}
			
			
			if ($chat['name'] != ""){
				$chat_name = $chat['name'];
			} else {
				$chat_members = $mySql->getChatMembers($app, $chat_id);
				$chat_name = $self->createChatName($app, $mySql, $chat_members, array());
			}
			
			$chat['chat_name'] = $chat_name;
			$chat['chat_id'] = $chat_id;
			

			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK',
					'chat' => $chat);
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}