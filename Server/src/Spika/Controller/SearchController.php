<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class SearchController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		
		//search users and groups
		$controllers->get('/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$type = ALL;
			if (array_key_exists('type', $paramsAry)){
				$type = $paramsAry['type'];
			}
			
			$chat_id = "";
			if (array_key_exists('chat_id', $paramsAry)){
				$chat_id = $paramsAry['chat_id'];
			}
			
			$search = "";
			if (array_key_exists('search', $paramsAry)){
				$search = $paramsAry['search'];
			}
			
			$category_id = 0;
			if (array_key_exists('category_id', $paramsAry)){
				$category_id = $paramsAry['category_id'];
			}
			
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$offset = $page * ROOMS_PAGE_SIZE;
			
			$my_user_id= $app['user']['id'];
			
			
			$result_list = array();
			
			if ($chat_id != ""){
				
				switch ($type){
					case USERS:
						$users = $mySql->getUsersNotMeNotChatMembers($app, $my_user_id, $search, $offset, $chat_id);
						$search_count = $mySql->getUsersCountNotMeNotChatMembers($app, $my_user_id, $search, $chat_id);
						
						foreach($users as $user){
							unset($user['details']);
							$item = array('type' => USERS, 
									'user' => $user);
							array_push($result_list, $item);
						}
						
						break;
					case GROUPS:
						
						break;
					case ROOMS:
						
						break;
					case ALL:
						$all = $mySql->getSearchUsersGroupsRoomsNotChatMembers($app, $search, $my_user_id, $chat_id);
						if ($page != -1){
							$all_items = array_slice($all, $offset, ROOMS_PAGE_SIZE);
						} else {
							$all_items = $all;
						} 
						
						$search_count = count($all);
						
						foreach($all_items as $all_item){
							
							if (array_key_exists('is_user', $all_item)){
								unset($all_item['details']);
								$item = array('type' => USERS, 
									'user' => $all_item);
							} else if (array_key_exists('is_group', $all_item)){
								$item = array('type' => GROUPS, 
									'group' => $all_item);
							} else if (array_key_exists('is_room', $all_item)){
								$item = array('type' => ROOMS, 
									'chat' => $all_item);
							}
							
							array_push($result_list, $item);
						}
						
						break;
			
				}	
			
			} else {
			
				switch ($type){
					case USERS:
						$users = $mySql->getUsersNotMe($app, $my_user_id, $search, $offset);
						$search_count = $mySql->getUsersCountNotMe($app, $my_user_id, $search);
						
						foreach($users as $user){
							unset($user['details']);
							$item = array('type' => USERS, 
									'user' => $user);
							array_push($result_list, $item);
						}
						
						break;
					case GROUPS:
						$groups = $mySql->getGroups($app, $my_user_id, $search, $offset, $category_id);
						$search_count = $mySql->getGroupsCount($app, $my_user_id, $search, $category_id);
						
						foreach($groups as $group){
							$item = array('type' => GROUPS, 
									'group' => $group);
							array_push($result_list, $item);
						}
						
						break;
					case ROOMS:
						$rooms = $mySql->getRooms($app, $my_user_id, $search, $offset, $category_id);
						$search_count = $mySql->getRoomsCount($app, $my_user_id, $search, $category_id);
						
						foreach($rooms as $room){
						
							if ($room['chat_name'] == ""){
								$chat_members = $mySql->getChatMembers($app, $room['chat_id']);
								$room['chat_name'] = $self->createChatName($app, $mySql, $chat_members, array());
							}
						
							$item = array('type' => ROOMS, 
									'chat' => $room);
							array_push($result_list, $item);
						}
						
						break;
					case ALL:
						$all = $mySql->getSearchUsersGroupsRooms($app, $search, $my_user_id);
						if ($page != -1){
							$all_items = array_slice($all, $offset, ROOMS_PAGE_SIZE);
						} else {
							$all_items = $all;
						} 
						
						$search_count = count($all);
						
						foreach($all_items as $all_item){
							
							if (array_key_exists('is_user', $all_item)){
								unset($all_item['details']);
								$item = array('type' => USERS, 
									'user' => $all_item);
							} else if (array_key_exists('is_group', $all_item)){
								$item = array('type' => GROUPS, 
									'group' => $all_item);
							} else if (array_key_exists('is_room', $all_item)){
								$item = array('type' => ROOMS, 
									'chat' => $all_item);
							}
							
							array_push($result_list, $item);
						}
						
						break;
			
				}	
			}
			
			if ($page > 0 && count($result_list) == 0){
				$result = array('code' => ER_PAGE_NOT_FOUND, 
					'message' => 'Page not found');
				return $app->json($result, 200);
			}
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => ROOMS_PAGE_SIZE,
					'total_count' => $search_count,
					'search_result' => $result_list);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}