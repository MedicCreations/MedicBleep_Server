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
			
			$users_to_add = $paramsAry['users_to_add'];
			$users_to_add_ary = explode(',', $users_to_add);
			
			$custom_chat_id = $self->createChatCustomID($users_to_add_ary);
			
			$chat_id = $mySql->createChat($app, $name, CHAT_ROOM_TYPE, $my_user_id, 0, $image, $image_thumb, $custom_chat_id, $category_id);
				
			$mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			$chat['chat_name'] = $name;
			$chat['chat_id'] = $chat_id;
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'chat' => $chat);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get chat members list
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
			
			$search = "";
			
			if (array_key_exists('search', $paramsAry)){
				$search = $paramsAry['search'];
			}
			
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$offset = $page * ROOMS_PAGE_SIZE;
			
			$user_id= $app['user']['id'];
			
			$all = $mySql->getSearchResult($app, $search);
			
			$search_slice = array_slice($all, $offset, ROOMS_PAGE_SIZE);
			
			if ($page > 0 && count($all) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			$search_count = count($all);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => ROOMS_PAGE_SIZE,
					'total_count' => $search_count,
					'search_result' => $search_slice);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//return all user_ids
		$controllers->get('/add/users', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$users = array();
			$groups = array();
			
			$user_ids = "";
			if (array_key_exists('user_ids', $paramsAry)){
				$user_ids = $paramsAry['user_ids'];
			}
			
			$group_ids = "";
			if (array_key_exists('group_ids', $paramsAry)){
				$group_ids = $paramsAry['group_ids'];
			}
			if ($user_ids != ""){
				//get users for room
				$users = $mySql->getUsersForRoom($app, $user_ids);
			}
			
			if ($group_ids != ""){
				//get group members for room
				$groups = $mySql->getGroupMembersForRoom($app, $group_ids);
			}
			
			$result = array_merge($users, $groups);
			$result = array_map("unserialize", array_unique(array_map("serialize", $result)));
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'users' => $result);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}