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
		
		$user = $app['db']->fetchAssoc($sql, array($username, $password));
		
		$login_result = array();
		if (is_array($user)){
			
			//update token
			$user_id = $user['id'];
			$token = $this->randomString(40,40);
			$where = array('id' => $user_id);
			$values = array(
					'token' => $token,
					'token_timestamp' => time(),
					'android_push_token' => $android_push_token,
					'ios_push_token' => $ios_push_token,
					'modified' => time(),);
				
			$stmt = $app['db']->update('user', $values, $where);
			
			$user['token'] = $token;
			
			$login_result['auth_status'] = TRUE;
			$login_result['user'] = $user;
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
	
	
	public function getUsersNotMe(Application $app, $my_user_id, $search, $offset){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb, user.details FROM user";
		
		$sql = $sql . " WHERE user.id <> ? ";
		
		if ($search != ""){
			$sql = $sql . " AND firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%' OR CONCAT (firstname, ' ', lastname) LIKE '" . $search . "%'";
		}
		
		$sql = $sql . " ORDER BY user.firstname,user.id LIMIT " . $offset . ", " . USERS_PAGE_SIZE;
		
		$resultFormated = array();
		$result = $app['db']->fetchAll($sql, array($my_user_id));
		
		foreach($result as $row){
            if(empty($row['details']))
                $row['details'] = array();
                
    		$resultFormated[] = $row;
		}
		return $resultFormated;
		
	}
	
	
	public function getUsersCountNotMe(Application $app, $my_user_id, $search){
		
		$sql = "SELECT COUNT(*) FROM user WHERE user.id <> ? ";
		
		if ($search != ""){
			$sql = $sql . " AND firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%'";
		}
		
		$result = $app['db']->executeQuery($sql, array($my_user_id))->fetch();
		
		return $result['COUNT(*)'];
	}
	
	
	public function getUserByID(Application $app, $user_id){
		
		$sql = "SELECT * FROM user WHERE id = ?";
		
		$user = $app['db']->fetchAssoc($sql, array($user_id));
		
		return $user;
		
	}
	
	
	public function updateUser(Application $app, $user_id, $values){
		
		$where = array('id' => $user_id);
		
		$app['db']->update('user', $values, $where);
		
	}
	
	
	public function getGroups(Application $app, $user_id, $search, $offset, $category){
		
		$sql = "SELECT groups.id, groups.name AS groupname, groups.image, groups.image_thumb FROM groups, group_member WHERE groups.id = group_member.group_id AND group_member.user_id = ? ";
		
		if ($search != ""){
			$sql = $sql . " AND groups.name LIKE '" . $search . "%'";
		}
		
		if ($category != 0){
			$sql = $sql . " AND groups.category = " . $category;
		}
		
		$sql = $sql . " LIMIT " . $offset . ", " . GROUPS_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getGroupsCount(Application $app, $user_id, $search, $category){
	
		$sql = "SELECT COUNT(*) FROM groups, group_member WHERE groups.id = group_member.group_id AND group_member.user_id = ?";
	
		if ($search != ""){
			$sql = $sql . " AND groups.name LIKE '" . $search . "%'";
		}
		
		if ($category != 0){
			$sql = $sql . " AND groups.category = " . $category;
		}
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
	
		return $result['COUNT(*)'];
	}
	
	
	public function getGroupMembers(Application $app, $group_id){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb, group_member.group_id FROM group_member, user WHERE user.id = group_member.user_id AND group_member.group_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($group_id));
		
		return $result;
		
	}
	
	
	public function getGroupMembersUserIDs(Application $app, $group_id){
		
		$sql = "SELECT user.id FROM group_member, user WHERE user.id = group_member.user_id AND group_member.group_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($group_id));
		
		return $result;
		
	}
	
	
	public function getGroupWithID(Application $app, $group_id){
	
		$sql = "SELECT * FROM groups WHERE id = ?";

		$result = $app['db']->fetchAssoc($sql, array($group_id));
		
		return $result;
	
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
	
	
	public function isPrivateChatAlreadyExist(Application $app, $custom_chat_id){
		
// 		$sql = "SELECT chat_member.* FROM chat_member, chat WHERE chat.id = chat_member.chat_id AND user_id = ? AND chat.type = 1";
// 		$my_chats = $app['db']->fetchAll($sql, array($my_user_id));
		
// 		$sql = "SELECT chat_member.* FROM chat_member, chat WHERE chat.id = chat_member.chat_id AND user_id = ? AND chat.type = 1";
// 		$other_chats = $app['db']->fetchAll($sql, array($other_user_id));
		
// 		$is_exist = false;
// 		foreach ($my_chats as $mychat){
// 			foreach ($other_chats as $otherchat){
// 				if ($mychat['chat_id'] == $otherchat['chat_id']){
// 					$is_exist = true;
// 					$chat_id = $mychat['chat_id'];
// 					break;
// 				}
// 			}
// 		}

		$sql = "SELECT * FROM chat WHERE custom_chat_id = ?";
		$chat = $app['db']->fetchAssoc($sql, array($custom_chat_id));
		
		if (is_array($chat)){
			
			$result = array('is_exist' => true, 
					'chat_id' => $chat['id'],
					'chat_name' => $chat['name']);
			
		} else {
			
			$result = array('is_exist' => false, 
					'chat_id' => NULL,
					'chat_name' => NULL);
			
		}
		
		return $result;
		
	}
	
	
	public function isGroupChatAlreadyExist(Application $app, $group_id){
		
		$sql = "SELECT * FROM chat WHERE group_id = ? ";
		$chat = $app['db']->fetchAssoc($sql, array($group_id));
		
		if (is_array($chat)){
			
			$result = array('is_exist' => true, 
					'chat_id' => $chat['id']);
			
		} else {
			
			$result = array('is_exist' => false,
					'chat_id' => NULL);
			
		}
		
		return $result;
		
	}
	
	
	public function createChat(Application $app, $name, $type, $my_user_id, $group_id, $group_image, $group_image_thumb, $custom_chat_id, $category_id){
		
		$values = array('custom_chat_id' => $custom_chat_id,
				'name' => $name, 
				'type' => $type, 
				'admin_id' => $my_user_id,
				'group_id' => $group_id,
				'image' => $group_image,
				'image_thumb' => $group_image_thumb,
				'category_id' => $category_id,
				'created' => time(), 
				'modified' => time()
				);
		
		$app['db']->insert('chat', $values);
		
		return $app['db']->lastInsertId();
		
	}
	
	
	public function addChatMembers(Application $app, $chat_id, $members){
		
		
		$chat_members = $this->getChatMembersAll($app, $chat_id);
		
		foreach ($members as $user_id){
			
			$is_exist = false;
			foreach ($chat_members as $member){
				if ($user_id == $member['user_id']){
				
					if ($member['is_deleted'] == 1){
					
						//update is_deleted value
						$where = array('user_id' => $member['user_id'],
									'chat_id' => $chat_id);
						$values = array('is_deleted' => 0);
						$app['db']->update('chat_member', $values, $where);
					}
					$is_exist = true;
					break;
				}
			}
			
			if (!$is_exist){
				$values = array('user_id' => $user_id,
						'chat_id' => $chat_id,
						'created' => time(),
						'modified' => time());
					
				$app['db']->insert('chat_member', $values);
			} else {
				
			}
		}
	}
	
	
	public function getChatWithID(Application $app, $chat_id){
		
		$sql = "SELECT * FROM chat WHERE id = ? ";
		
		$chat = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $chat;
		
	}
	
	
	public function getPrivateChatData(Application $app, $chat_id, $user_id){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM user,chat_member WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.is_deleted = 0 AND chat_member.user_id <> ?";
		
		$result = $app['db']->fetchAssoc($sql, array($chat_id, $user_id));
		
		$chat = array('name' => $result['firstname'] . ' ' . $result['lastname'], 
				'image' => $result['image'],
				'image_thumb' => $result['image_thumb'],
				'user_id' => $result['id'],
				'user_firstname' => $result['firstname'],
				'user_lastname' => $result['lastname']);
		return $chat;
		
	}
	
	
	public function getChatMembers(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, user.firstname, user.lastname, user.image, user.image_thumb, user.android_push_token, user.ios_push_token FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.is_deleted = 0 ";
		
		$result = $app['db']->fetchAll($sql, array($chat_id));
		
		return $result;
		
	}
	
	
	public function getChatMembersUserIDs(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id FROM chat_member WHERE chat_member.chat_id = ? AND chat_member.is_deleted = 0 ";
		
		$result = $app['db']->fetchAll($sql, array($chat_id));
		
		return $result;
		
	}
	
	public function getChatMembersAll(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, user.firstname, user.lastname, user.image, user.image_thumb, user.android_push_token, user.ios_push_token FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($chat_id));
		
		return $result;
		
	}
	
	
	public function updateChat(Application $app, $chat_id, $values){
		
		$where = array('id' => $chat_id);
		
		$app['db']->update('chat', $values, $where);
		
	}
	
	
	public function updateChatMember(Application $app, $chat_id, $user_id, $values){
	
		$where = array('chat_id' => $chat_id,
				'user_id' => $user_id);
	
		$app['db']->update('chat_member', $values, $where);
	
	}
	
	
	public function isChatMember(Application $app, $user_id, $chat_id){
		
		$sql = "SELECT * FROM chat_member WHERE user_id = ? AND chat_id = ?";
		
		$chat_member = $app['db']->fetchAssoc($sql, array($user_id, $chat_id));
		
		if (is_array($chat_member)){
			if ($chat_member['is_deleted'] == 0){
				$result = true;
			} else {
				$result = false;
			}
		} else {
			$result = false;
		}
		
		return $result;
		
	}
	
	
	public function createMessage(Application $app, $values){
		
		$values['created'] = time(); 
		$values['modified'] = time();
		
		$app['db']->insert('message', $values);
		
		return $app['db']->lastInsertId();
		
	}
	
	
	public function getLastMessages(Application $app, $chat_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id));
		
		return $messages;
		
	}
	
	
	public function getMessagesPaging(Application $app, $chat_id, $last_msg_id){

		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.id < ? ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $last_msg_id));
		
		return $messages;
		
	}
	
	
	public function getMessagesOnPush(Application $app, $chat_id, $first_msg_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.id > ? ORDER BY message.id DESC";
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $first_msg_id));
		
		return $messages;
		
	}
	
	
	public function getCountMessagesForChat(Application $app, $chat_id){
		
		$sql = "SELECT COUNT(*) FROM message WHERE chat_id = ? AND is_deleted = 0";
		
		$result = $app['db']->executeQuery($sql, array($chat_id))->fetch();
		$messages_number =  $result["COUNT(*)"];
		
		return $messages_number;
		
	}
	
	
	public function updateUnreadMessagesForMembers(Application $app, $chat_id, $user_id){
		
		$time = time();
		
		$sql = "UPDATE chat_member SET modified = ". $time .", unread = unread + " . 1 . " WHERE chat_id = ? AND user_id <> ?";
		
		$app['db']->executeUpdate($sql, array($chat_id, $user_id));
		
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

	
	public function deleteMessage(Application $app, $message_id){
		
		$values = array('is_deleted' => 1);
		$where = array('id' => $message_id);
		
		$app['db']->update('message', $values, $where);
		
	}
	
	
	public function updateMessage(Application $app, $message_id, $values){
		
		$where = array('id' => $message_id);
		$values['modified'] = time();
		$app['db']->update('message', $values, $where);
		
	}
	
	
	public function getMessageByID(Application $app, $message_id,$append_userdata = false){
		
		if($append_userdata){
    		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id and message.id = ?";
		}else{
    		$sql = "SELECT * FROM message WHERE id = ?";
		}
		
		
		$result = $app['db']->fetchAssoc($sql, array($message_id));
		
		return $result;
		
	}
	
	
	public function getChildMessages(Application $app, $child_id_list){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id and message.id IN (" . $child_id_list . ") ORDER BY message.id";
		
		$messages = $app['db']->executeQuery($sql)->fetchAll();
		
		return $messages;
		
	}
	
	
	public function getModifiedMessages(Application $app, $chat_id, $modified, $last_msg_id) {
	
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.modified >= ? AND message.id >= ? ORDER BY message.id DESC";
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $modified, $last_msg_id));
		
		return $messages;
	
	}
	
	
	public function getRecentAllChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getCountRecentAllChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
		
	}
	
	
	public function getRecentGroupChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND (chat.type = 2 OR chat.type = 3) ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getCountRecentGroupChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND (chat.type = 2 OR chat.type = 3) ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
		
	}
	
	
	public function getRecentPrivateChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 1 ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
		
	}
	
	
	public function getCountRecentPrivateChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 1 ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
		
	}
	
	
	public function getLastMessage(Application $app, $chat_id){
		
		$sql = "SELECT * FROM message WHERE chat_id = ? ORDER BY message.id DESC LIMIT 1";
		
		$last_message = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $last_message;
	}
	
	
	public function getCategories(Application $app){
		
		$sql = "SELECT * FROM categories";
		
		$categories = $app['db']->fetchAll($sql);
		
		return $categories;
	}
	
	
	public function createCategory(Application $app, $name){
		
		$values = array('name' => $name);
		
		$app['db']->insert('categories', $values);
	}
	
	
	public function getRooms(Application $app, $user_id, $search, $offset, $category_id){
	
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 3 ";
		
		if ($search != ""){
			$sql = $sql . " AND chat.name LIKE '" . $search . "%'";
		}
		
		if ($category_id != 0){
			$sql = $sql . " AND chat.category_id = " . $category_id;
		}
		
		$sql = $sql . " ORDER BY chat.modified DESC LIMIT " . $offset . ", " . ROOMS_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id));
		
		return $result;
	
	}
	
	public function getRoomsCount(Application $app, $user_id, $search, $category_id){
	
		$sql = "SELECT COUNT(*) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 3 ";
		
		if ($search != ""){
			$sql = $sql . " AND chat.name LIKE '" . $search . "%'";
		}
		
		if ($category_id != 0){
			$sql = $sql . " AND chat.category_id = " . $category_id;
		}
		
		$sql = $sql . " ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id))->fetch();
		
		return $result["COUNT(*)"];
	
	}
	
	
	public function getSearchUsersGroups(Application $app, $search){
		
		$sql = "SELECT user.id, CONCAT (user.firstname, ' ', user.lastname) as name, user.firstname, user.lastname, user.image, user.image_thumb, '1' as is_user FROM user";
		if ($search != ""){
			$sql = $sql . " WHERE CONCAT (user.firstname, ' ', user.lastname) LIKE '" . $search . "%'";
			$sql = $sql . " OR user.firstname LIKE '" . $search . "%'";
			$sql = $sql . " OR user.lastname LIKE '" . $search . "%'";
		}
		
		$users = $app['db']->fetchAll($sql);
		
		$sql = "SELECT groups.id, groups.name as name, groups.name as groupname, groups.image, groups.image_thumb, '1' as is_group FROM groups";
		if ($search != ""){
			$sql = $sql . " WHERE groups.name LIKE '" . $search . "%'";
		}
		$groups = $app['db']->fetchAll($sql);
		
		$result = array_merge($groups,$users);
		
		usort(
			$result,
			function ($a, $b) {
				return strcasecmp($a['name'], $b['name']);
			}
		);
		
		return $result;
	}
	
	
	public function getUsersForRoom(Application $app, $user_ids){
	
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM user WHERE user.id IN (" . $user_ids . ")";
		
		$users = $app['db']->fetchAll($sql);
	
		return $users;
		
	}
	
	
	public function getGroupMembersForRoom(Application $app, $group_ids){
	
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM group_member, user WHERE group_member.user_id = user.id AND group_member.group_id IN (" . $group_ids . ")";
	
		$groups = $app['db']->fetchAll($sql);
	
		return $groups;
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
	
	
	public function getChatByID(Application $app, $chat_id,$append_userdata = false){
		
		$sql = "SELECT * FROM chat WHERE id = ?";

		$result = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $result;
		
		
	}
	
	
}