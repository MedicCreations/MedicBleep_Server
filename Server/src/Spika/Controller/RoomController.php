<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class RoomController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		//create room 
		$controllers->post('/create', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$name = "";
			$image = DEFAULT_GROUP_IMAGE;
			$image_thumb = DEFAULT_GROUP_IMAGE;
			$category_id = 0;
			$is_private = 1;
			$password = "";
			
			$users = array();
			$groups = array();
			$rooms = array();
			
			$my_user_id = $app['user']['id'];
			
			if (array_key_exists('name', $paramsAry)){
				$name = $paramsAry['name'];
			}
			if (array_key_exists('image', $paramsAry)){
				if ($paramsAry['image'] != ""){
					$image = $paramsAry['image'];
				}
			}
			if (array_key_exists('image_thumb', $paramsAry)){
				if ($paramsAry['image_thumb'] != ""){
					$image_thumb = $paramsAry['image_thumb'];
				}
			}
			if (array_key_exists('category_id', $paramsAry)){
				$category_id = $paramsAry['category_id'];
			}
			if (array_key_exists('is_private', $paramsAry)){
				$is_private = $paramsAry['is_private'];
			}
			
			if (array_key_exists('password', $paramsAry)){
				$password = $paramsAry['password'];
			}
			
			$group_ids = "";
			if (array_key_exists('group_ids', $paramsAry)){
				$group_ids = trim($paramsAry['group_ids'], ",");
			}
			$room_ids = "";
			if (array_key_exists('room_ids', $paramsAry)){
				$room_ids = trim($paramsAry['room_ids'], ",");
			}
			
			if (array_key_exists('user_ids', $paramsAry)){
				$user_ids = $paramsAry['user_ids'];
			}
			if (array_key_exists('users_to_add', $paramsAry)){
				$user_ids = $paramsAry['users_to_add'];
			}
			
			//for web app
			$group_all_ids = "";
			if (array_key_exists('group_all_ids', $paramsAry)){
				$group_all_ids = trim($paramsAry['group_all_ids'], ",");
			}
			
			$room_all_ids = "";
			if (array_key_exists('room_all_ids', $paramsAry)){
				$room_all_ids = trim($paramsAry['room_all_ids'], ",");
			}
			
			if ($user_ids != ""){
				//get users for room
				$users = $mySql->getUsersForRoom($app, $user_ids);
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
			
			// check limit
			$organizationInfo = $app['db']->fetchAssoc("select * from organization where id = ?",array($app['user']['organization_id']));
			$roomNum = $app['db']->fetchAssoc("select count(*) as count from chat where type=3 and organization_id = ?",array($app['user']['organization_id']));
			$limitNum = $organizationInfo['max_rooms'];
            
			if($roomNum['count'] > $limitNum){
			    
    			$result = array('code' => ER_ROOM_LIMIT, 
    					'message' => 'Rooms limit exceeded.');
    			
    			return $app->json($result, 200);

			}
			//end for web app part
			
			$custom_chat_id = $self->createChatCustomID($users_to_add_ary);
			
			$chat_id = $mySql->createChat($app, $name, CHAT_ROOM_TYPE, $my_user_id, 0, $image, $image_thumb, $custom_chat_id, $category_id, $is_private, $password, $group_ids, $room_ids);
				
			$mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			$chat['chat_name'] = $name;
			$chat['chat_id'] = $chat_id;
			
			$category = $mySql->getCategoryById($app, $chat['category_id']);
			$chat['category'] = $category;
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'chat' => $chat);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get rooms list
		$controllers->get('/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$search = "";
			$category_id = 0;
			if (array_key_exists('search', $paramsAry)){
				$search = $paramsAry['search'];
			}
			if (array_key_exists('category_id', $paramsAry)){
				$category_id = $paramsAry['category_id'];
			}
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$offset = $page * ROOMS_PAGE_SIZE;
			
			$user_id= $app['user']['id'];
			
			$rooms = $mySql->getRooms($app, $user_id, $search, $offset, $category_id);
			
			foreach ($rooms as &$room){
			
				$category = $mySql->getCategoryById($app, $room['category_id']);
				$room['category'] = $category;		
						
				if ($room['chat_name'] == ""){
					$chat_members = $mySql->getChatMembers($app, $room['chat_id']);
					$room['chat_name'] = $self->createChatName($app, $mySql, $chat_members, array());
				}
				
			}
			
			if ($page > 0 && count($rooms) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			$rooms_count = $mySql->getRoomsCount($app, $user_id, $search, $category_id);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => ROOMS_PAGE_SIZE,
					'total_count' => $rooms_count,
					'rooms' => $rooms);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//search users and groups
		$controllers->get('/search/all', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = "";
			if (array_key_exists('chat_id', $paramsAry)){
				$chat_id = $paramsAry['chat_id'];
			}
			
			$search = "";
			
			if (array_key_exists('search', $paramsAry)){
				$search = $paramsAry['search'];
			}
			
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$offset = $page * ROOMS_PAGE_SIZE;
			
			$my_user_id= $app['user']['id'];
			
			$all = $mySql->getSearchUsersGroupsRooms($app, $search, $my_user_id);
			
			if ($page != -1){
				$search_result = array_slice($all, $offset, ROOMS_PAGE_SIZE);
			} else {
				$search_result = $all;
			}
			
			if ($page > 0 && count($all) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			if ($chat_id != ""){
				
				$all = $mySql->getSearchUsersGroupsRoomsNotChatMembers($app, $search, $my_user_id, $chat_id);
			
				if ($page != -1){
					$search_result = array_slice($all, $offset, ROOMS_PAGE_SIZE);
				} else {
					$search_result = $all;
				}
				
			}
			
			$search_count = count($all);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => ROOMS_PAGE_SIZE,
					'total_count' => $search_count,
					'search_result' => $search_result);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//return all user_ids
		$controllers->get('/add/users', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$users = array();
			$groups = array();
			$rooms = array();
			
			$user_ids = "";
			if (array_key_exists('user_ids', $paramsAry)){
				$user_ids = trim($paramsAry['user_ids'], ",");
			}
			$group_ids = "";
			if (array_key_exists('group_ids', $paramsAry)){
				$group_ids = trim($paramsAry['group_ids'], ",");
			}
			$group_all_ids = "";
			if (array_key_exists('group_all_ids', $paramsAry)){
				$group_all_ids = trim($paramsAry['group_all_ids'], ",");
			}
			$room_ids = "";
			if (array_key_exists('room_ids', $paramsAry)){
				$room_ids = trim($paramsAry['room_ids'], ",");
			}
			$room_all_ids = "";
			if (array_key_exists('room_all_ids', $paramsAry)){
				$room_all_ids = trim($paramsAry['room_all_ids'], ",");
			}
			
			if ($user_ids != ""){
				//get users for room
				$users = $mySql->getUsersForRoom($app, $user_ids);
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
			
			// var_dump($result);
			$pretty_res = array();
			 foreach ($result as $res){
			
				 array_push($pretty_res, $res);
			
			 }
			
			// var_dump($pretty_res);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'users' => $result,
					'users_array' => $pretty_res);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}