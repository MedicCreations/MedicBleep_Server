<?php

namespace Spika\Db;

use Silex\Application;

use Spika\Db\DbInterface;

class MySqlDb implements DbInterface{
	
	public function registerUser(Application $app, $outside_id, $firstname, $lastname, $password, $username, $android_push_token, $ios_push_token){
		
		if ($android_push_token !=''){
			$where = array('android_push_token' => $android_push_token);
			$values = array('android_push_token' =>'');
			$stmt = $app['db']->update('user', $values, $where);
		}
			
		if ($ios_push_token !=''){
			$where = array('ios_push_token' => $ios_push_token);
			$values = array('ios_push_token' =>'');
			$stmt = $app['db']->update('user', $values, $where);
		}
		
		
		$sql = "SELECT * FROM user WHERE outside_id = ?";
				
		$result = $app['db']->fetchAssoc($sql, array($outside_id));
		
		if (is_array($result)){
			$user_id = $result['id'];
			$token = $this->randomString(40,40);
			
			$where = array('id' => $user_id);
			$values = array('outside_id' => $outside_id,
					'firstname' => $firstname,
					'lastname' => $lastname,
					'token' => $token,
					'token_timestamp' => time(),
					'username' => $username,
					'password' => $password,
					'android_push_token' => $android_push_token,
					'ios_push_token' => $ios_push_token,
					'modified' => time(),);
			
			$stmt = $app['db']->update('user', $values, $where);
			
			$result = array("message" => "User updated successfully", 
					"code" => CODE_SUCCESS,
					"user_id" => $user_id, 
					"token" => $token,
					"firstname" => $firstname, 
					"lastname" => $lastname,
					"image" => $result['image']);
			
			return $result;
		} else {
			$token = $this->randomString(40,40);
			$values = array('outside_id' => $outside_id,
					'firstname' => $firstname,
					'lastname' => $lastname,
					'password' => $password,
					'token' => $token,
					'token_timestamp' => time(),
					'username' => $username,
					'password' => $password,
					'android_push_token' => $android_push_token,
					'ios_push_token' => $ios_push_token,
					'image' => DEFAULT_USER_IMAGE,
					'image_thumb' => DEFAULT_USER_IMAGE,
					'created' => time(), 
					'modified' => time(),);
			
			$stmt = $app['db']->insert('user', $values);
			
			$result = array("message" => "User created",
					"code" => CODE_SUCCESS,
					"user_id" =>  $app['db']->lastInsertId(),
					"token" => $token,
					"firstname" => $firstname, 
					"lastname" => $lastname,
					"image" => DEFAULT_USER_IMAGE);
				
			return $result;
		}
		
	}
	
	
	public function loginUser(Application $app, $password, $username, $android_push_token, $ios_push_token){
		
		if ($android_push_token !=''){
			$where = array('android_push_token' => $android_push_token);
			$values = array('android_push_token' =>'');
			$stmt = $app['db']->update('user', $values, $where);
		}
			
		if ($ios_push_token !=''){
			$where = array('ios_push_token' => $ios_push_token);
			$values = array('ios_push_token' =>'');
			$stmt = $app['db']->update('user', $values, $where);
		}
		
		$sql = "SELECT * FROM user WHERE username = ? AND password = ?";
		
		$result = $app['db']->fetchAssoc($sql, array($username, $password));
		
		$login_result = array();
		if (is_array($result)){
			$login_result['auth_status'] = TRUE;
			$login_result['user'] = $result;
		} else {
			$login_result['auth_status'] = FALSE;
		}
		
		return $login_result;
	}
	
	
	public function getUserByToken(Application $app, $token_received){
		$sql = "SELECT * FROM user WHERE token = ?";
	
		$user = $app['db']->fetchAssoc($sql, array($token_received));
	
		return $user;
	}
	
	
	public function updateUserIOSPushToken(Application $app, $user_id, $push_token){
		
		$where = array('id' => $user_id);
		$values = array('ios_push_token' => $push_token);
		
		$app['db']->update('user', $values, $where);
		
	}
	
	
	public function updateUserAndroidPushToken(Application $app, $user_id, $push_token){
		
		$where = array('id' => $user_id);
		$values = array('android_push_token' => $push_token);
		
		$app['db']->update('user', $values, $where);
		
	}
	
	
	public function updateUserImage(Application $app, $user_id, $image, $image_thumb){
		
		$where = array('id' => $user_id);
		$values = array('image' => $image, 
				'image_thumb' => $image_thumb);
		
		$app['db']->update('user', $values, $where);
		
	} 
	
	
	public function getUsers(Application $app, $search, $offset){
		
		$sql = "SELECT * FROM user";
		if ($search != ""){
			$sql = $sql . " WHERE firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%'";
		}
		
		$sql = $sql . " LIMIT " . $offset . ", " . USERS_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql);
		
		return $result;
		
	}
	
	
	public function getUsersCount(Application $app){
		
		$sql = "SELECT COUNT(*) FROM user";
		
		$result = $app['db']->executeQuery($sql)->fetch();
		
		return $result['COUNT(*)'];
	}
	
	
	public function getOrCreateUserWithOutsideID(Application $app, $outside_id, $firstname, $lastname){
		
		$sql = "SELECT * FROM user WHERE outside_id = ? ";
		$user = $app['db']->fetchAssoc($sql, array($outside_id));
		
		if (is_array($user)){
			return $user;
		} else {
			$values = array('outside_id' => $outside_id, 
					'firstname' => $firstname,
					'lastname' => $lastname, 
					'image' => DEFAULT_USER_IMAGE,
					'image_thumb' => DEFAULT_USER_IMAGE,
					'created' => time(), 
					'modified' => time());
			$app['db']->insert('user', $values);
			$id = $app['db']->lastInsertId();
			$values['id'] = $id;
			return $values;
		}
		
	}
	
	
	public function getAllUsersWithOutsideId(Application $app, $outside_users_ary){
		
		$outside_id_ary = array();
		foreach ($outside_users_ary as $user){
			array_push($outside_id_ary, $user['id']);
		}
		
		$sql = "SELECT * FROM user WHERE outside_id IN (" . implode(',',$outside_id_ary) . ")";
		
		$mutual_users = $app['db']->executeQuery($sql)->fetchAll();
		
		return $mutual_users;
		
	}
	
	
	public function calculateBadge(Application $app, $user_id){
		
		$sql = "SELECT SUM(unread) FROM chat_member WHERE user_id = ?";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result['SUM(unread)'];
		
	}
	
	
	public function isPrivateChatAlreadyExist(Application $app, $my_user_id, $other_user_id){
		
		$sql = "SELECT chat_member.* FROM chat_member, chat WHERE chat.id = chat_member.chat_id AND user_id = ? AND chat.type = 1";
		$my_chats = $app['db']->fetchAll($sql, array($my_user_id));
		
		$sql = "SELECT chat_member.* FROM chat_member, chat WHERE chat.id = chat_member.chat_id AND user_id = ? AND chat.type = 1";
		$other_chats = $app['db']->fetchAll($sql, array($other_user_id));
		
		$is_exist = false;
		foreach ($my_chats as $mychat){
			foreach ($other_chats as $otherchat){
				if ($mychat['chat_id'] == $otherchat['chat_id']){
					$is_exist = true;
					$chat_id = $mychat['chat_id'];
					break;
				}
			}
		}
		
		if ($is_exist){
			
			$result = array('is_exist' => true, 
					'chat_id' => $chat_id);
			
		} else {
			
			$result = array('is_exist' => false, 
					'chat_id' => NULL);
			
		}
		
		return $result;
		
	}
	
	
	public function isGroupChatAlreadyExist(Application $app, $outside_group_id){
		
		$sql = "SELECT * FROM chat WHERE group_id = ? ";
		$chat = $app['db']->fetchAssoc($sql, array($outside_group_id));
		
		if (is_array($chat)){
			
			$result = array('is_exist' => true, 
					'chat_id' => $chat['id']);
			
		} else {
			
			$result = array('is_exist' => false,
					'chat_id' => NULL);
			
		}
		
		return $result;
		
	}
	
	
	public function createChat(Application $app, $name, $type, $outside_group_id, $group_image){
		
		$values = array('name' => $name, 
				'type' => $type, 
				'group_id' => $outside_group_id,
				'image' => $group_image,
				'created' => time(), 
				'modified' => time()
				);
		
		$app['db']->insert('chat', $values);
		
		return $app['db']->lastInsertId();
		
	}
	
	
	public function addChatMembers(Application $app, $chat_id, $members){
		
		foreach ($members as $user_id){
			
			$values = array('user_id' => $user_id, 
					'chat_id' => $chat_id, 
					'created' => time(), 
					'modified' => time());
			
			$app['db']->insert('chat_member', $values);
			
		}
	}
	
	
	public function getChatWithID(Application $app, $chat_id){
		
		$sql = "SELECT * FROM chat WHERE id = ? ";
		
		$chat = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $chat;
		
	}
	
	
	public function getPrivateChatNameAndImage(Application $app, $chat_id, $user_id){
		
		$sql = "SELECT user.firstname, user.lastname, user.image, user.image_thumb FROM user,chat_member WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.user_id <> ?";
		
		$result = $app['db']->fetchAssoc($sql, array($chat_id, $user_id));
		
		$chat = array('name' => $result['firstname'] . ' ' . $result['lastname'], 
				'image' => $result['image'],
				'image_thumb' => $result['image_thumb']);
		return $chat;
		
	}
	
	
	public function getChatMembers(Application $app, $chat_id){
		
		$sql = "SELECT * FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? ";
		
		$result = $app['db']->fetchAll($sql, array($chat_id));
		
		return $result;
		
	}
	
	
	public function createMessage(Application $app, $chat_id, $user_id, $type, $text, $file_id, $thumb_id, $longitude, $latitude){
		
		$values = array('chat_id' => $chat_id, 
				'user_id' => $user_id, 
				'type' => $type,
				'text' => $text, 
				'file_id' => $file_id, 
				'thumb_id' => $thumb_id,
				'longitude' => $longitude,
				'latitude' => $latitude,
				'created' => time(), 
				'modified' => time());
		
		$app['db']->insert('message', $values);
		
	}
	
	
	public function getLastMessages(Application $app, $chat_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id));
		
		return $messages;
		
	}
	
	
	public function getMessagesPaging(Application $app, $chat_id, $last_msg_id){

		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.id < ? ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $last_msg_id));
		
		return $messages;
		
	}
	
	
	public function getMessagesOnPush(Application $app, $chat_id, $first_msg_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.id > ? ORDER BY message.id DESC";
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $first_msg_id));
		
		return $messages;
		
	}
	
	
	public function getCountMessagesForChat(Application $app, $chat_id){
		
		$sql = "SELECT COUNT(*) FROM message WHERE chat_id = ?";
		
		$result = $app['db']->executeQuery($sql, array($chat_id))->fetch();
		$messages_number =  $result["COUNT(*)"];
		
		return $messages_number;
		
	}
	
	
	public function updateUnreadMessagesForMembers(Application $app, $chat_id){
		
		$time = time();
		
		$sql = "UPDATE chat_member SET modified = ". $time .", unread = unread + " . 1 . " WHERE chat_id = ? ";
		
		$app['db']->executeUpdate($sql, array($chat_id));
		
	}
	
	
	public function resetUnreadMessagesForMember(Application $app, $chat_id, $user_id){
		
		$values = array('unread' => 0);
		$where = array('chat_id' => $chat_id, 
				'user_id' => $user_id);
		
		$app['db']->update('chat_member', $values, $where);
		
	}
	
	
	public function updateChatHasMessages(Application $app, $chat_id){
		
		$values = array('has_messages' => 1);
		$where = array('id' => $chat_id);
		
		$app['db']->update('chat', $values, $where);
		
	}
	
	
	public function getRecentGroupChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.image AS image_thumb FROM chat_member, chat WHERE chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat.has_messages = 1 AND chat.type = 2 ORDER BY chat_member.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getCountRecentGroupChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat.has_messages = 1 AND chat.type = 2 ORDER BY chat_member.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
		
	}
	
	
	public function getRecentPrivateChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT chat_member.chat_id, chat_member.unread FROM chat_member, chat WHERE chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat.has_messages = 1 AND chat.type = 1 ORDER BY chat_member.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getCountRecentPrivateChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat.has_messages = 1 AND chat.type = 1 ORDER BY chat_member.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
		
	}
	
	
	public function randomString($min = 5, $max = 8)
	{
		$length = rand($min, $max);
		$string = '';
		$index = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for ($i = 0; $i < $length; $i++) {
			$string .= $index[rand(0, strlen($index) - 1)];
		}
		return $string;
	}
}