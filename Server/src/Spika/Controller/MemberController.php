<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class MemberController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		
		//get chat or group members
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
			
			$group_id = "";
			if (array_key_exists('group_id', $paramsAry)){
				$group_id = $paramsAry['group_id'];
			}
			
			$page = 0;
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			$offset = $page * USERS_PAGE_SIZE;
			
			$my_user_id= $app['user']['id'];
			
			$result_list = array();
			$member_count = 0;
			
			if ($chat_id != ""){
				
				$admin = $mySql->getChatAdmin($app, $chat_id);
				$admin['is_admin'] = true;
				
				switch ($type){
					case USERS:
						$all_members = $mySql->getChatMembers($app, $chat_id);
						$member_count = count($all_members);
						$members = array_slice($all_members, $offset, USERS_PAGE_SIZE);
						
						foreach($members as $member){
							
							if (isset($member['user_id'])){
								if ($member['user_id'] != $admin['user_id']){
							
									$item = array('type' => USERS, 
										'user' => $user);
									array_push($result_list, $item);
								}
							}
						}
						
						if ($page == 0){
							$item = array('type' => USERS, 
										'user' => $admin);
							array_unshift($result_list, $item);
						}
						
						break;
					case GROUPS:
						
						break;
					case ROOMS:
						
						break;
					case ALL:
						$all = $mySql->getChatMembersGroupsRooms($app, $chat_id);
						$member_count = count($all);
						
						if ($page != -1){
							$all_items = array_slice($all, $offset, USERS_PAGE_SIZE);
						} else {
							$all_items = $all;
						} 
						
						foreach($all_items as $all_item){
							
							if (array_key_exists('is_user', $all_item)){
								if (isset($all_item['user_id'])){
									if ($all_item['user_id'] != $admin['user_id']){
										$item = array('type' => USERS, 
											'user' => $all_item);
										array_push($result_list, $item);
									}										
								}
							} else if (array_key_exists('is_group', $all_item)){
								$item = array('type' => GROUPS, 
									'group' => $all_item);
								array_push($result_list, $item);
							} else if (array_key_exists('is_room', $all_item)){
								$item = array('type' => ROOMS, 
									'chat' => $all_item);
								array_push($result_list, $item);
							}
							
						}
						
						if ($page == 0){
							$item = array('type' => USERS, 
										'user' => $admin);
							array_unshift($result_list, $item);
						}
						
						break;
			
				}	
			
			} else if ($group_id != ""){
			
				$group_members = $mySql->getGroupMembers($app, $group_id);
				$member_count = count($group_members);
			
				if ($page == -1){
					$page_group_members = $group_members;
				} else {
					$offset = $page*USERS_PAGE_SIZE;
					$page_group_members = array_slice($group_members, $offset, USERS_PAGE_SIZE);
				}
				
				foreach($page_group_members as $member){
					$item = array('type' => USERS,
							'user' => $member);
					array_push($result_list, $item);
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
					'items_per_page' => USERS_PAGE_SIZE,
					'total_count' => $member_count,
					'members_result' => $result_list);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}