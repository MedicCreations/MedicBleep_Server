<?php

namespace Spika\Controller;

use Spika\UserManager\Ldap;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class GroupController extends SpikaBaseController {
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		$ldap = new Ldap();
		
		$controllers = $app ['controllers_factory'];
		
		//get group list
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
			$offset = $page * GROUPS_PAGE_SIZE;
			
			$user_id= $app['user']['id'];
			
			$groups = $mySql->getGroups($app, $user_id, $search, $offset);
			
			$groups_count = $mySql->getGroupsCount($app, $user_id, $search);
			
// 			$groups = $ldap->getGroupsList($app, $search, $username);
			
// 			$page_groups = array_slice($groups, $offset, GROUPS_PAGE_SIZE);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page,
					'items_per_page' => GROUPS_PAGE_SIZE,
					'total_count' => $groups_count,
					'groups' => $groups);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//start chat with group
		$controllers->post('/chat/start', function (Request $request) use($app, $self, $mySql, $ldap) {
		
			$paramsAry = $request->request->all();
				
			$group_id = $paramsAry['group_id'];
			$group_name = $paramsAry['groupname'];

			$user_id = $app['user']['id'];
			
			$chat_name = $group_name;
			
			$chat_seen_by = "";
				
			//check if chat exist
			$result = $mySql->isGroupChatAlreadyExist($app, $group_id);
				
			if ($result['is_exist']){
				//get messages
				$chat_id = $result['chat_id'];
				$messages = $mySql->getLastMessages($app, $chat_id);
				$mySql->resetUnreadMessagesForMember($app, $chat_id, $user_id);
				
				//update seen
				$chat_seen_by = $self->updateSeen($app, $mySql, $chat_id);
			} else {
				//create chat and chat_members
				$chat_id = $mySql->createChat($app, $chat_name, CHAT_GROUP_TYPE, $group_id, DEFAULT_GROUP_IMAGE, DEFAULT_GROUP_IMAGE, "");
				
				//get users from ldap
				//$ldap_user_id_ary = $ldap->getGroupMembers($app, $outside_group_id);
				
				//get group users
				$group_members = $mySql->getGroupMembers($app, $group_id);
				
				$members = array();
				foreach ($group_members as $group_member){
					
// 					$user = $mySql->getOrCreateUserWithOutsideID($app, $outside_user['id'], $outside_user['firstname'], $outside_user['lastname']);
					array_push($members, $group_member['id']);
					
				}
				
				$mySql->addChatMembers($app, $chat_id, $members);
				$messages = array();
			}
				
			$chat = $self->getChatData($app, $mySql, $chat_id);
			
			$total_count = $mySql->getCountMessagesForChat($app, $chat_id);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK',
					'group_id' => $group_id,
					'chat_id' => $chat_id,
					'chat_name' => $chat_name,
					'seen_by' => $chat_seen_by,
					'total_count' => $total_count,
					'messages' => $messages,
					'chat' => $chat);
		
			return $app->json($result, 200);
		
		})->before($app['beforeSpikaTokenChecker']);
		
		//get group members
		$controllers->get('/members', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->query->all();
				
			$group_id = $paramsAry['group_id'];

			$page = 0;
				
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
				
			$offset = $page*USERS_PAGE_SIZE;
			
			$group_members = $mySql->getGroupMembers($app, $group_id);
			
			$page_group_members = array_slice($group_members, $offset, USERS_PAGE_SIZE);
				
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK',
					'page' => $page, 
					'total_count' => count($group_members),
					'group_members' => $page_group_members);
				
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
			
		
		return $controllers;
	}
	
	
	
}