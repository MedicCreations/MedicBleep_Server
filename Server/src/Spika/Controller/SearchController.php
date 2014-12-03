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
				$chat_members = $mySql->getChatMembers($app, $chat_id);
				$chat = $mySql->getChatWithId($app, $chat_id);
				
				foreach($search_result as $key =>$temp_user){
					// $temp_user['is_member'] = false;
					
					if (array_key_exists('is_user', $temp_user)){
						foreach ($chat_members as $member){
							if ($temp_user['id'] == $member['user_id']){
								unset($search_result[$key]);
								// $temp_user['is_member'] = true;
								break;
							}
						}
					} else if (array_key_exists('is_group', $temp_user)){
						if (strpos($chat['group_ids'], $temp_user['id']) !== FALSE){
							unset($search_result[$key]);
							// $temp_user['is_member'] = true;
						}
					
					} else if (array_key_exists('is_room', $temp_user)){
						if (strpos($chat['room_ids'], $temp_user['id']) !== FALSE){
							unset($search_result[$key]);
							// $temp_user['is_member'] = true;
						}
					}
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
		
		
		return $controllers;
	}
	
	
	
}