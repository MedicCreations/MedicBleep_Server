<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class MessageController extends SpikaBaseController {
	
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		// post message
		$controllers->post ( '/send', function (Request $request) use($app, $self, $mySql) {
			
			$paramsAry = $request->request->all();
			
			$chat_id = $paramsAry['chat_id'];
			$type = $paramsAry['type'];
			$text = "";
			$file_id = "";
			$thumb_id = "";
			$longitude = "";
			$latitude = "";
			$root_id = 0;
			$parent_id = 0;
			
			if (array_key_exists('text', $paramsAry)){
				$text = $paramsAry['text'];
			}
			if (array_key_exists('file_id', $paramsAry)){
				$file_id = $paramsAry['file_id'];
			}
			if (array_key_exists('thumb_id', $paramsAry)){
				$thumb_id = $paramsAry['thumb_id'];
			}
			if (array_key_exists('longitude', $paramsAry)){
				$longitude = $paramsAry['longitude'];
			}
			if (array_key_exists('latitude', $paramsAry)){
				$latitude = $paramsAry['latitude'];
			}

			if (array_key_exists('parent_id', $paramsAry)){
				$parent_id = $paramsAry['parent_id'];
			}
			
			$chat_data = $mySql->getChatWithID($app, $chat_id);
			
			if ($chat_data['is_deleted'] == 1){
				$result = array('code' => ER_CHAT_DELETED,
							'message' => 'Chat is deleted');
				return $app->json($result, 200);
			}
			
			if ($chat_data['is_active'] == 0){
				$result = array('code' => ER_CHAT_INACTIVE,
							'message' => 'Chat is inactive');
				return $app->json($result, 200);
			}
			
			$user = $app['user'];
			$user_id = $user['id'];
			$user_firstname = $user['firstname'];
			$user_lastname = $user['lastname'];
			
			$is_chat_member = $mySql->isChatMember($app, $user_id, $chat_id);
			
			if (!$is_chat_member){
				$result = array('code' => ER_NOT_CHAT_MEMBER, 
						'message' => 'Not chat member');
				
				return $app->json($result, 200);
			}
			
			// get root id from parent
			if($parent_id != 0){
    			$parent_message = $mySql->getMessageByID($app, $parent_id);
                    if($parent_message['root_id'] != 0)
                        $root_id = $parent_message['root_id'];
                    else
                        $root_id = $parent_id;
                
			}
			
			$values = array('chat_id' => $chat_id, 
				'user_id' => $user_id, 
				'type' => $type,
				'text' => $text, 
				'file_id' => $file_id, 
				'thumb_id' => $thumb_id,
				'longitude' => $longitude,
				'latitude' => $latitude,
				'root_id' => $root_id,
				'parent_id' => $parent_id);
			
			$msg_id = $mySql->createMessage($app, $values);
			
			if ($root_id > 0){
				//update child list for root message
				$root_message = $mySql->getMessageByID($app, $root_id);
				$child_list = $root_message['child_list'];
				if ($child_list == ""){
					$child_list = $msg_id;
				} else {
					$child_list = $child_list . "," . $msg_id;
				}
				
				$values = array('child_list' => $child_list);
				$mySql->updateMessage($app, $root_id, $values);
				
			}
			
			$mySql->updateUnreadMessagesForMembers($app, $chat_id, $user_id);
			
			$chat_values = array('seen_by' => "" ,'modified' => time());
			$mySql->updateChat($app, $chat_id, $chat_values);
			
			//get chat name
			$chat = $mySql->getChatWithID($app, $chat_id);
			
			if (!$chat['has_messages']){
				$mySql->updateChatHasMessages($app, $chat_id);
			}
			
			$chat_name = $chat['name'];
			if ($chat_name == ""){
				if ($chat['type'] == CHAT_USER_TYPE){
					$chat_name = $user_firstname . " " . $user_lastname;
				} else {
					$chat_members = $mySql->getChatMembers($app, $chat['id']);
					$chat_name = $self->createChatName($app, $mySql, $chat_members, array());
				}
			}
			
			$chat_thumb = $chat['image_thumb'];
			if ($chat_thumb == ""){
				if ($chat['type'] == CHAT_USER_TYPE){
					$chat_thumb = $user['image_thumb'];
				} else {
					$chat_thumb = DEFAULT_GROUP_IMAGE;
				}
			}
			
			$chat_image = $chat['image'];
			if ($chat_image == ""){
				if ($chat['type'] == CHAT_USER_TYPE){
					$chat_image = $user['image'];
				} else {
					$chat_image = DEFAULT_GROUP_IMAGE;
				}
			}
			
			$chat_type = $chat['type'];
			
			
			if ($user['ios_push_token'] != ''){
				$user_push_token = $user['ios_push_token'];
			} else {
				$user_push_token = $user['android_push_token'];
			}
			
// 			//send push to all members
			$chat_members = $mySql->getChatMembers($app, $chat_id);
			
			$ios_push_members = array();
			$android_push_members = array();
			
			foreach ($chat_members as $member){
				
// 				//update unread messages
// 				$mySql->updateUnreadMessagesForMember($app, $rally_id, $member['user_id']);
				
// 				// prepare arrays for push notifications
					if ($member['android_push_token'] != '' && $member['android_push_token'] != $user_push_token ){
						array_push($android_push_members, $member['android_push_token']);
					}
					
					if ($member['ios_push_token'] != '' && $member['ios_push_token'] != $user_push_token){
						
						$badge = $mySql->calculateBadge($app, $member['user_id']);
						
						$ios_member = array('ios_push_token' => $member['ios_push_token'], 
								'badge' => $badge);
						
						array_push($ios_push_members, $ios_member);
					}
			}
			
// 			//create android fields
			$payload = array(
					'registration_ids' => $android_push_members,
					'data' => array('type' => PUSH_TYPE_MESSAGE,
							'chat_id' => $chat_id,
							'chat_name' => $chat_name, 
							'firstname' => $user_firstname,
							'chat_thumb' => $chat_thumb,
							'chat_image' => $chat_image,
							'chat_type' => $chat_type,
							'is_active' => $chat['is_active'],
							'admin_id' => $chat['admin_id']
							)
			);
				
			$android_fields = array('android_push_token_members' => $android_push_members,
					'type' => SERVICE_PROVIDOR_GCM,
					'payload' => $payload);
				
// 			//send android push request
			if (count($android_push_members) > 0){
				$self->sendPushRequest($android_fields);
			}
				
				
// 			//create ios fields
			$payload = array();
			
			$apsAry = array('alert' => 'New message from ' . $user_firstname , 'sound' => 'default');
				
			$dataAry = array('t' => PUSH_TYPE_MESSAGE,
					'ci' => $chat_id,
					'cn' => $chat_name,
					'ct' => $chat_thumb,
					'cty' => $chat_type
					);
				
			$payload['aps'] = $apsAry;
			$payload['d'] = $dataAry;
				
			$ios_fields_dev = array('ios_push_token_members' => $ios_push_members,
					'type' => SERVICE_PROVIDOR_APN_DEV,
					'payload' => $payload);
					
			$ios_fields_prod = array('ios_push_token_members' => $ios_push_members,
					'type' => SERVICE_PROVIDOR_APN_PROD,
					'payload' => $payload);		
			
				
// 			//send ios push request
			if (count($ios_push_members) > 0){
				$self->sendPushRequest($ios_fields_dev);
			}
			
			if (count($ios_push_members) > 0){
				$self->sendPushRequest($ios_fields_prod);
			}
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'Message created');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		// get messages paging
		$controllers->get ( '/paging', function (Request $request) use ($app, $self, $mySql) {
					
			$paramsAry = $request->query->all();
				
			$chat_id = $paramsAry['chat_id'];
			
			$chat_data = $mySql->getChatWithID($app, $chat_id);
			if ($chat_data['is_deleted'] == 1){
				$result = array('code' => ER_CHAT_DELETED,
							'message' => 'Chat is deleted');
				return $app->json($result, 200);
			}
			
			if ($chat_data['group_id'] > 0){
				$self->mergeGroupChatUsers($app, $mySql, $chat_data['group_id'], $chat_id);
			}
			
			if (array_key_exists('last_msg_id', $paramsAry)){
				$last_msg_id = $paramsAry['last_msg_id'];
			}
			
			$my_user_id = $app['user']['id'];
			
			$chat_seen_by = "";
			
			$is_chat_member = $mySql->isChatMember($app, $my_user_id, $chat_id);
			
			if (!$is_chat_member){
				$result = array('code' => ER_NOT_CHAT_MEMBER, 
						'message' => 'Not chat member');
				
				return $app->json($result, 200);
			}
			
			$user = array();
			
			if (isset($last_msg_id) && ($last_msg_id != "")){
				//return messages before last_msg
				$messages = $mySql->getMessagesPaging($app, $chat_id, $last_msg_id);
			} else {
				//reset unread messages
				$mySql->resetUnreadMessagesForMember($app, $chat_id, $my_user_id);
				
				//set seen
				$chat_seen_by = $self->updateSeen($app, $mySql, $chat_id);
				
				//return last messages
				$messages = $mySql->getLastMessages($app, $chat_id);
				
				//get buddy profile if private chat
				$chat = $mySql->getChatByID($app, $chat_id);
				if ($chat['type'] == CHAT_USER_TYPE){
					$data = $mySql->getPrivateChatData($app, $chat_id, $my_user_id);
					$user = array('id' => $data['user_id'], 
							'firstname' => $data['user_firstname'],
							'lastname' => $data['user_lastname'],
							'image' => $data['image'],
							'image_thumb' => $data['image_thumb']);
				}
			}
			
			$total_messages = $mySql->getCountMessagesForChat($app, $chat_id);
			
			$result = array('code' => CODE_SUCCESS,
					'message' => 'OK', 
					'messages' => $messages, 
					'total_count' => $total_messages, 
					'seen_by' => $chat_seen_by);
					
			if (count($user)>0){
				$result['user'] = $user;
			}
				
			return $app->json($result, 200);
				
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get messages on push
		$controllers->get('/new', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$chat_id = $paramsAry['chat_id'];
			$first_msg_id = $paramsAry['first_msg_id'];
			
			$last_msg_id = 0;
			if (array_key_exists('last_msg_id', $paramsAry)){
				$last_msg_id = $paramsAry['last_msg_id'];
			}
			
			$my_user_id = $app['user']['id'];
			
			$is_chat_member = $mySql->isChatMember($app, $my_user_id, $chat_id);
			
			if (!$is_chat_member){
				$result = array('code' => ER_NOT_CHAT_MEMBER, 
						'message' => 'Not chat member');
				
				return $app->json($result, 200);
			}
			
			$mySql->resetUnreadMessagesForMember($app, $chat_id, $my_user_id);
			
			$messages = $mySql->getMessagesOnPush($app, $chat_id, $first_msg_id);
			
			$message = $mySql->getMessageByID($app, $first_msg_id);
			
			$modified_messages = $mySql->getModifiedMessages($app, $chat_id, $message['modified'], $last_msg_id);
			
			$total_count = $mySql->getCountMessagesForChat($app, $chat_id);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK', 
					'total_count' => $total_count,
					'messages' => $messages, 
					'modified_messages' => $modified_messages);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//delete message
		$controllers->post('/delete', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->request->all();
			
			$message_id = $paramsAry['message_id'];
			
			$message = $mySql->getMessageByID($app, $message_id);
			
			$values = array('type' => MSG_DELETED,
					'text' =>'', 
					'file_id' => '', 
					'thumb_id' => '', 
					'longitude' => '',
					'latitude' => '');
			
			$mySql->updateMessage($app, $message_id, $values);
			
			$values = array('chat_id' => $message['chat_id'],
					'user_id' => $message['user_id'],
					'type' => $message['type'],
					'text' => $message['text'],
					'file_id' => $message['file_id'],
					'thumb_id' => $message['thumb_id'],
					'longitude' => $message['longitude'],
					'latitude' => $message['latitude'],
					'is_deleted' => 1,
					'child_list' => $message['child_list'],
					'root_id' => $message['root_id'],
					'parent_id' => $message['parent_id']);
			
			$mySql->createMessage($app, $values);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK');
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get child messages
		$controllers->get('/child/list', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$root_id = $paramsAry['root_id'];
			
			$root_message = $mySql->getMessageByID($app, $root_id,true);
			
			$child_id_list = $root_message['child_list'];
			
			if ($child_id_list != ""){
				$messages = $mySql->getChildMessages($app, $child_id_list);
				$messages[] = $root_message;
					
				$result = array('code' => CODE_SUCCESS,
						'message' => 'OK',
						'messages' => $messages);
			} else {
				$messages[] = $root_message;
				$result = array('code' => CODE_SUCCESS,
						'message' => 'OK',
						'messages' => $messages);
			}
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		//get message data
		$controllers->get('/data', function (Request $request) use ($app, $self, $mySql){
			
			$paramsAry = $request->query->all();
			
			$message_id = $paramsAry['message_id'];
			
			$message_data = $mySql->getMessageByID($app, $message_id);
			
			$result = array('code' => CODE_SUCCESS, 
					'message' => 'OK', 
					'message_data' => $message_data);
			
			return $app->json($result, 200);
			
		})->before($app['beforeSpikaTokenChecker']);
		
		
		return $controllers;
	}
	
	
	
}