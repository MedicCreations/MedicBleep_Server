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
		
		//add members to chat
		$controllers->post('/member/add', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$chat_id = "";
			if (array_key_exists('chat_id', $paramsAry)){
				$chat_id = $paramsAry['chat_id'];
			}
			$users_to_add = $paramsAry['users_to_add'];
			$users_to_add_ary = explode(',', $users_to_add);
			
			$chat = $mySql->getChatWithID($app, $chat_id);
			
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
				
					$chat_id = $mySql->createChat($app, "", CHAT_USER_GROUP_TYPE, 0, DEFAULT_GROUP_IMAGE, $custom_chat_id);
					$mySql->addChatMembers($app, $chat_id, $all_members);
					$messages = array();
				
				} else {
					//add new members
					$mySql->addChatMembers($app, $chat_id, $users_to_add_ary);
				
					$chat_members = $mySql->getChatMembers($app, $chat_id);
				
					$chat_name = $self->createChatName($app, $mySql, $chat_members, $users_to_add_ary);
				
					$messages = $mySql->getLastMessages($app, $chat_id);
				
				}
			} else {
				$chat_name = $self->createChatName($app, $mySql, array(), $users_to_add_ary);
				
				$custom_chat_id = $self->createChatCustomID($users_to_add_ary);
				
				$chat_id = $mySql->createChat($app, "", CHAT_USER_GROUP_TYPE, 0, DEFAULT_GROUP_IMAGE, $custom_chat_id);
				
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
					'total_count' => $total_count,
					'messages' => $messages);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get chat members list
		$controllers->get('/member/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = $paramsAry['chat_id'];
			
			$page = 0;
			
			if (array_key_exists('page', $paramsAry)){
				$page = $paramsAry['page'];
			}
			
			$offset = $page*USERS_PAGE_SIZE;
			
			$members = $mySql->getChatMembers($app, $chat_id);
			
			$page_members = array_slice($members, $offset, USERS_PAGE_SIZE);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK',
					'page' => $page, 
					'total_count' => count($members),
					'members' => $page_members);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//update chat name or image
		$controllers->post('/update', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$chat_id = $paramsAry['chat_id'];
			
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
		
		
		//leave chat
		$controllers->post('/leave', function (Request $request) use ($app, $self, $mySql){
				
			$paramsAry = $request->request->all();
				
			$chat_id = $paramsAry['chat_id'];
			
			$user_id = $app['user']['id'];
			
			$values = array('is_deleted' => 1);
			
			$mySql->updateChatMember($app, $chat_id, $user_id, $values);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK');
				
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}