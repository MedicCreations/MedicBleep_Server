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
	
	
	public function loginUser(Application $app, $password, $username, $deviceType){
		
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
					'last_device_id' => $deviceType,
					'web_opened' => 0, //web_opened this will be 1 with webkeepalive
					'modified' => time(),);
            
			$stmt = $app['db']->update('user', $values, $where);
			
			$user['token'] = $token;
			
			$login_result['auth_status'] = TRUE;
			$login_result['user'] = $user;
			
			$app['monolog']->addDebug(" user login : " . print_r($user,true));  
			$app['organization_id'] = $user['organization_id'];
			
		} else {
			$login_result['auth_status'] = FALSE;
		}
		
		return $login_result;
	}
	
	
	public function loginWithTempPass(Application $app, $username, $password){
	
		$sql = "SELECT * FROM user WHERE username = ? AND temp_password = ?";
		
		$user = $app['db']->fetchAssoc($sql, array($username, $password));
	
		return $user;
	
	}
	
	
	public function getUserByToken(Application $app, $token_received){
		$sql = "SELECT * FROM user WHERE token = ?";
	
		$user = $app['db']->fetchAssoc($sql, array($token_received));
	
		return $user;
	}
	
	
	public function getUserByUsername(Application $app, $username){
	
		$sql = "SELECT * FROM user WHERE username = ?";
	
		$user = $app['db']->fetchAssoc($sql, array($username));
	
		return $user;
	
	}
	
	
	public function updateUserImage(Application $app, $user_id, $image, $image_thumb){
		
		$where = array('id' => $user_id);
		$values = array('image' => $image, 
				'image_thumb' => $image_thumb);
		
		$app['db']->update('user', $values, $where);
		
	} 
	
	
	public function getUsersNotMe(Application $app, $my_user_id, $search, $offset){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb, user.details, user.last_device_id, user.web_opened FROM user";
		
		$sql = $sql . " WHERE user.id <> ? AND user.is_deleted = 0 ";
		
		if ($search != ""){
			$sql = $sql . " AND (firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%' OR CONCAT (firstname, ' ', lastname) LIKE '" . $search . "%')";
		}
		
		$sql = $sql . " and user.organization_id = ? ORDER BY user.firstname,user.id LIMIT " . $offset . ", " . USERS_PAGE_SIZE;
		
		$resultFormated = array();
		$result = $app['db']->fetchAll($sql, array($my_user_id,$app['organization_id']));
		
		// add device information
		$userIds = [];
		foreach($result as $row){
            $userIds[] = $row['id'];
		}
		
		$userIdsStr = implode(',',$userIds);
		$deviceInfo = $app['db']->fetchAll("select * from device where user_id in ({$userIdsStr})");
				
		foreach($result as $row){
            if(empty($row['details']))
                $row['details'] = array();
                
            $devices = array();
            
            foreach($deviceInfo as $deviceRow){
	            
	            if($deviceRow['user_id'] == $row['id'])
	            	$devices[] = $deviceRow;
	            
            }
            
            $row['devices'] = $devices;
            
    		$resultFormated[] = $row;
		}
		
		return $resultFormated;
		
	}
	
	
	public function getUsersCountNotMe(Application $app, $my_user_id, $search){
		
		$sql = "SELECT COUNT(*) FROM user WHERE user.id <> ? AND user.is_deleted = 0 and user.organization_id = ? ";
		
		if ($search != ""){
			$sql = $sql . " AND (firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%' OR CONCAT (firstname, ' ', lastname) LIKE '" . $search . "%')";
		}
		
		$result = $app['db']->executeQuery($sql, array($my_user_id,$app['organization_id']))->fetch();
		
		if ($result == false){
			return 0;
		} else {
			return $result["COUNT(*)"];
		}
	}
	
	
	public function getUserByID(Application $app, $user_id){
		
		$sql = "SELECT * FROM user WHERE id = ?  and user.organization_id = ? ";
		
		$user = $app['db']->fetchAssoc($sql, array($user_id,$app['organization_id']));
		
		return $user;
		
	}
	
	
	public function getUserByTempPassword(Application $app, $temp_password){
	
		$sql = "SELECT * FROM user WHERE temp_password = ?  and user.organization_id = ? ";
		
		$user = $app['db']->fetchAssoc($sql, array($temp_password,$app['organization_id']));
		
		return $user;
	
	}
	
	
	public function updateUser(Application $app, $user_id, $values){
		
		$where = array('id' => $user_id);
		
		$app['db']->update('user', $values, $where);
		
	}
	
	
	public function createTempPassword(Application $app, $my_user_id){
	
		$temp_password = $this->randomString(6,6);
		
		$values = array('temp_password' => md5($temp_password), 
				'temp_password_timestamp' => time());
		$where = array('id' => $my_user_id);
		
		$app['db']->update('user', $values, $where);
		return $temp_password;
	
	}
	
	
	public function checkPassword(Application $app, $password){
	
		$sql = "SELECT * FROM user WHERE password = ?";
		
		$result = $app['db']->fetchAssoc($sql, array($password));
		
		if (is_array($result)){
			return true;
		} else {
			return false;
		}

	}
	
	
	public function getGroups(Application $app, $user_id, $search, $offset, $category){
        

		$sql = "SELECT groups.id, groups.name AS groupname, groups.image, groups.image_thumb FROM groups, group_member WHERE groups.is_deleted = 0 and groups.id = group_member.group_id AND group_member.user_id = ? ";
		
		if ($search != ""){
			$sql = $sql . " AND groups.name LIKE '" . $search . "%'";
		}
		
		if ($category != 0){
			$sql = $sql . " AND groups.category = " . $category;
		}
		
		$sql = $sql . " and groups.organization_id = ?  and groups.is_deleted = 0 ORDER BY groups.name LIMIT " . $offset . ", " . GROUPS_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getGroupsCount(Application $app, $user_id, $search, $category){
	
		$sql = "SELECT COUNT(*) FROM groups, group_member WHERE  groups.is_deleted = 0 and groups.id = group_member.group_id AND group_member.user_id = ? and groups.organization_id = ?  and groups.is_deleted = 0 ";
	
		if ($search != ""){
			$sql = $sql . " AND groups.name LIKE '" . $search . "%'";
		}
		
		if ($category != 0){
			$sql = $sql . " AND groups.category = " . $category;
		}
		
		$result = $app['db']->executeQuery($sql, array($user_id,$app['organization_id']))->fetch();
	
		if ($result == false){
			return 0;
		} else {
			return $result["COUNT(*)"];
		}
	}
	
	
	public function getGroupMembers(Application $app, $group_id){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb, user.last_device_id, group_member.group_id FROM group_member, user WHERE user.id = group_member.user_id AND group_member.group_id = ? and user.organization_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($group_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getGroupMembersUserIDs(Application $app, $group_id){
		
		$sql = "SELECT user.id FROM group_member, user WHERE user.id = group_member.user_id AND group_member.group_id = ? and user.organization_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($group_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getGroupWithID(Application $app, $group_id){
	
		$sql = "SELECT * FROM groups WHERE id = ? and groups.organization_id = ?";

		$result = $app['db']->fetchAssoc($sql, array($group_id,$app['organization_id']));
		
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
		
		$sql = "SELECT * FROM user WHERE outside_id IN (" . implode(',',$outside_id_ary) . ") and user.organization_id = {$app['organization_id']}";
		
		$mutual_users = $app['db']->executeQuery($sql)->fetchAll();
		
		return $mutual_users;
		
	}
	
	
	public function calculateBadge(Application $app, $user_id){
		
		$sql = "SELECT SUM(unread) FROM chat_member, chat WHERE chat_member.user_id = ? AND chat_member.chat_id = chat.id AND chat.is_deleted = 0 AND chat_member.is_deleted = 0 and chat_member.organization_id = {$app['organization_id']}";
		
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

		$sql = "SELECT * FROM chat WHERE custom_chat_id = ? AND type = ?";
		$chat = $app['db']->fetchAssoc($sql, array($custom_chat_id, CHAT_USER_TYPE));
		
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
	
	
	public function createChat(Application $app, $name, $type, $my_user_id, $group_id, $group_image, $group_image_thumb, $custom_chat_id, $category_id, $is_private, $password, $group_ids='', $room_ids=''){
		
		$values = array('custom_chat_id' => $custom_chat_id,
				'name' => $name, 
				'type' => $type, 
				'admin_id' => $my_user_id,
				'group_id' => $group_id,
				'image' => $group_image,
				'image_thumb' => $group_image_thumb,
				'category_id' => $category_id,
				'is_private' => $is_private,
				'password' => $password,
				'group_ids' => $group_ids,
				'room_ids' => $room_ids,
				'organization_id' => $app['organization_id'],
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
                        'organization_id' => $app['organization_id'],
						'created' => time(),
						'modified' => time());
					
				$app['db']->insert('chat_member', $values);
			} else {
				
			}
		}
	}
	
	
	public function getChatWithID(Application $app, $chat_id){
		
		$sql = "SELECT * FROM chat WHERE id = ? and organization_id = ?";
		
		$chat = $app['db']->fetchAssoc($sql, array($chat_id,$app['organization_id']));
		
		return $chat;
		
	}
	
	
	public function getPrivateChatData(Application $app, $chat_id, $user_id){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM user,chat_member WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.is_deleted = 0 AND chat_member.user_id <> ? and chat_member.organization_id = ?";
		
		$result = $app['db']->fetchAssoc($sql, array($chat_id, $user_id,$app['organization_id']));
		
		$chat = array('name' => $result['firstname'] . ' ' . $result['lastname'], 
				'image' => $result['image'],
				'image_thumb' => $result['image_thumb'],
				'user_id' => $result['id'],
				'user_firstname' => $result['firstname'],
				'user_lastname' => $result['lastname']);
		return $chat;
		
	}
	
	
	public function getChatMembers(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, user.firstname, user.lastname, user.image, user.image_thumb, user.last_device_id, user.web_opened FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.is_deleted = 0 AND chat_member.organization_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getChatMembersUserIDs(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id FROM chat_member WHERE chat_member.chat_id = ? AND chat_member.is_deleted = 0 AND chat_member.organization_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
		return $result;
		
	}
	
	public function getChatMembersAll(Application $app, $chat_id){
		
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, user.firstname, user.lastname, user.image, user.image_thumb FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.organization_id = ?";
		
		$result = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
		return $result;
		
	}

	public function getChatDevicesAll(Application $app, $chat_id){
		
		$sql = "
		    Select * from device
		    Where user_id in ( select user_id from chat_member where chat_id = ? group by user_id )
		    and  device.organization_id = ? and device.is_valid = 1";
		
		$result = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
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
		
		$sql = "SELECT * FROM chat_member WHERE user_id = ? AND chat_id = ? AND organization_id = ?";
		
		$chat_member = $app['db']->fetchAssoc($sql, array($user_id, $chat_id,$app['organization_id']));
		
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
	
	
	public function getChatAdmin(Application $app, $chat_id){
	
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, user.firstname, user.lastname, user.image, user.image_thumb, user.last_device_id, user.web_opened FROM chat, user, chat_member WHERE chat.admin_id = user.id AND chat_member.user_id = user.id AND chat_member.chat_id = chat.id AND chat.id = ?";
		
		$admin = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $admin;
	
	}
	
	
	public function deleteChatMembers(Application $app, $chat_id, $user_ids_for_delete){
		
		$time = time();
		
		$sql = "UPDATE chat_member SET modified = ". $time .", is_deleted = 1 WHERE chat_id = ? AND user_id IN (".$user_ids_for_delete.") and organization_id = ? ";
		
		$app['db']->executeUpdate($sql, array($chat_id, $app['organization_id']));
	
	}
	
	
	public function getUnreadChats(Application $app, $user_id){
	
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.password as chat_password FROM chat_member, chat WHERE chat_member.chat_id = chat.id AND chat_member.unread > 0 AND chat_member.user_id = ? AND chat_member.organization_id = ? AND chat_member.did_sent = 0";
		
		$chats = $app['db']->fetchAll($sql, array($user_id, $app['organization_id']));
		
		return $chats;
	
	}
	
	public function updateSentLocalPush(Application $app, $chat_id, $user_id){
	
		$values = array('did_sent' => 1);
		$where = array('user_id' => $user_id, 
					'chat_id' => $chat_id, 
					'organization_id' => $app['organization_id']);
					
		$app['db']->update('chat_member', $values, $where);
	
	}
	
	
	public function createMessage(Application $app, $values){
		
		$values['created'] = time(); 
		$values['modified'] = time();
		$values['organization_id'] = $app['organization_id'];
		
		$app['db']->insert('message', $values);
		
		return $app['db']->lastInsertId();
		
	}
	
	
	public function getLastMessages(Application $app, $chat_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 and message.organization_id = ? and message.root_id = 0 ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
		return $messages;
		
	}
	
	
	public function getMessagesPaging(Application $app, $chat_id, $last_msg_id){

		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.id < ? and message.organization_id = ? and message.root_id = 0 ORDER BY message.id DESC LIMIT " . 0 . ", " . MSG_PAGE_SIZE;
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $last_msg_id,$app['organization_id']));
		
		return $messages;
		
	}
	
	
	public function getMessagesOnPush(Application $app, $chat_id, $first_msg_id){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.id > ? and message.organization_id = ? and message.root_id = 0 ORDER BY message.id DESC";
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $first_msg_id,$app['organization_id']));
		
		return $messages;
		
	}
	
	
	public function getCountMessagesForChat(Application $app, $chat_id){
		
		$sql = "SELECT COUNT(*) FROM message WHERE chat_id = ? AND is_deleted = 0 and message.root_id = 0 and message.organization_id = ? ";
		
		$result = $app['db']->executeQuery($sql, array($chat_id,$app['organization_id']))->fetch();
		$messages_number =  $result["COUNT(*)"];
		
		return $messages_number;
		
	}
	
	
	public function updateUnreadMessagesForMembers(Application $app, $chat_id, $user_id){
		
		$time = time();
		
		$sql = "UPDATE chat_member SET modified = ". $time .", did_sent = 0, unread = unread + " . 1 . " WHERE chat_id = ? AND user_id <> ? and organization_id = ? ";
		
		$app['db']->executeUpdate($sql, array($chat_id, $user_id,$app['organization_id']));
		
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
    		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id and message.id = ? and message.organization_id = ?";
		}else{
    		$sql = "SELECT * FROM message WHERE id = ? and message.organization_id = ?";
		}
		
		
		$result = $app['db']->fetchAssoc($sql, array($message_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getChildMessages(Application $app, $child_id_list){
		
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id and message.id IN (" . $child_id_list . ") and message.organization_id = ? ORDER BY message.id";
		
		$messages = $app['db']->fetchAll($sql, array($app['organization_id']));
		
		return $messages;
		
	}
	
	
	public function getModifiedMessages(Application $app, $chat_id, $modified, $last_msg_id) {
	
		$sql = "SELECT message.*, user.firstname, user.lastname, user.image, user.image_thumb FROM message, user WHERE message.user_id = user.id AND message.chat_id = ? AND message.is_deleted = 0 AND message.modified >= ? AND message.id >= ? and message.organization_id = ?  ORDER BY message.id DESC";
		
		$messages = $app['db']->fetchAll($sql, array($chat_id, $modified, $last_msg_id,$app['organization_id']));
		
		return $messages;
	
	}
	
	
	public function getLastMsgSender(Application $app, $chat_id){
		
		$sql = "SELECT user.firstname FROM message, user WHERE message.chat_id = ? AND message.user_id = user.id AND message.organization_id = ? ORDER BY message.id DESC LIMIT 0,1";
		
		$result = $app['db']->fetchAssoc($sql, array($chat_id, $app['organization_id']));
		
		return $result;
	
	}
	
	
	public function getRecentAllChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT DISTINCT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.category_id, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 and chat.organization_id = ? ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getCountRecentAllChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(DISTINCT chat_member.chat_id) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 and chat.organization_id = ? ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id,$app['organization_id']))->fetch();
		
		return $result["COUNT(DISTINCT chat_member.chat_id)"];
		
	}
	
	
	public function getRecentGroupChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT DISTINCT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.category_id, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND (chat.type = 2 OR chat.type = 3) and chat.organization_id = ? ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getCountRecentGroupChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(DISTINCT chat_member.chat_id) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND (chat.type = 2 OR chat.type = 3)  and chat.organization_id = ? ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id,$app['organization_id']))->fetch();
		
		return $result["COUNT(DISTINCT chat_member.chat_id)"];
		
	}
	
	
	public function getRecentPrivateChats(Application $app, $user_id, $offset){
		
		$sql = "SELECT DISTINCT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.category_id, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 1  and chat.organization_id = ?  ORDER BY chat.modified DESC LIMIT " . $offset . ", " . RECENT_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		return $result;
		
	}
	
	
	public function getCountRecentPrivateChats(Application $app, $user_id){
		
		$sql = "SELECT COUNT(DISTINCT chat_member.chat_id) FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0 AND chat.has_messages = 1 AND chat.type = 1 and chat.organization_id = ? ORDER BY chat.modified DESC";
		
		$result = $app['db']->executeQuery($sql, array($user_id,$app['organization_id']))->fetch();
		
		return $result["COUNT(DISTINCT chat_member.chat_id)"];
		
	}
	
	
	public function getLastMessage(Application $app, $chat_id){
		
		$sql = "SELECT * FROM message WHERE chat_id = ? and message.organization_id = ? ORDER BY message.id DESC LIMIT 1";
		
		$last_message = $app['db']->fetchAssoc($sql, array($chat_id,$app['organization_id']));
		
		return $last_message;
	}
	
	
	public function getCategories(Application $app){
		
		$sql = "SELECT * FROM categories WHERE categories.organization_id = ? and is_deleted = 0";
		
		$categories = $app['db']->fetchAll($sql,array($app['organization_id']));
		
		return $categories;
	}
	
	
	public function createCategory(Application $app, $name){
		
		$values = array('name' => $name,'organization_id' => $app['organization_id']);
		
		$app['db']->insert('categories', $values);
	}
	
	
	public function getCategoryById(Application $app, $category_id){
	
		$category = (object) array();
		
		if ($category_id != 0){
			$sql = "SELECT categories.id, categories.name FROM categories WHERE id = ? AND organization_id = ? AND is_deleted = 0";
			$category = $app['db']->fetchAssoc($sql, array ($category_id, $app['organization_id']));
		}
		
		return $category;
	
	}
	
	
	public function getRooms(Application $app, $user_id, $search, $offset, $category_id){
	
		$sql = "SELECT chat_member.chat_id, chat_member.unread, chat.name AS chat_name, chat.category_id, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat.type = 3 AND ((chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0) OR (chat_member.chat_id = chat.id AND chat_member.is_deleted = 0 AND chat.is_private = 0)) and chat.organization_id = ? ";
		
		if ($search != ""){
			$sql = $sql . " AND chat.name LIKE '" . $search . "%'";
		}
		
		if ($category_id != 0){
			$sql = $sql . " AND chat.category_id = " . $category_id;
		}
		
		$sql = $sql . " GROUP BY chat_member.chat_id ORDER BY chat.name DESC LIMIT " . $offset . ", " . ROOMS_PAGE_SIZE;
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		return $result;
	
	}
	
	public function getRoomsCount(Application $app, $user_id, $search, $category_id){
	
		$sql = "SELECT chat.*, chat_member.* FROM chat_member, chat WHERE chat.is_deleted = 0 AND chat.type = 3 AND ((chat_member.chat_id = chat.id AND chat_member.user_id = ? AND chat_member.is_deleted = 0) OR (chat_member.chat_id = chat.id AND chat_member.is_deleted = 0 AND chat.is_private = 0)) and chat.organization_id = ? ";
		
		if ($search != ""){
			$sql = $sql . " AND chat.name LIKE '" . $search . "%'";
		}
		
		if ($category_id != 0){
			$sql = $sql . " AND chat.category_id = " . $category_id;
		}
		
		$sql = $sql . " GROUP BY chat.id ORDER BY chat.modified DESC";
		
		$result = $app['db']->fetchAll($sql, array($user_id,$app['organization_id']));
		
		$result = count($result);
		
		if ($result == false){
			return 0;
		} else {
			return $result;
		}
	
	}
	
	
	public function getSearchUsersGroupsRooms(Application $app, $search, $my_user_id){
		$sql = "SELECT user.id, CONCAT (user.firstname, ' ', user.lastname) as name, user.firstname, user.lastname, user.image, user.image_thumb, user.details, user.last_device_id, user.web_opened, '1' as is_user FROM user WHERE user.id <> ?  and user.organization_id = ? ";
		if ($search != ""){
			$sql = $sql . " AND (CONCAT (user.firstname, ' ', user.lastname) LIKE '" . $search . "%'";
			$sql = $sql . " OR user.firstname LIKE '" . $search . "%'";
			$sql = $sql . " OR user.lastname LIKE '" . $search . "%')";
		}
		
		$users = $app['db']->fetchAll($sql, array($my_user_id,$app['organization_id']));
		
		$sql = "SELECT groups.id, groups.name as name, groups.name as groupname, groups.image, groups.image_thumb, '1' as is_group FROM groups WHERE groups.is_deleted = 0 AND groups.organization_id = ?";
		if ($search != ""){
			$sql = $sql . " and groups.name LIKE '" . $search . "%'";
		}
		$groups = $app['db']->fetchAll($sql, array($app['organization_id']));
		
		$sql = "SELECT chat.id, chat.name as name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password, '1' as is_room FROM chat WHERE chat.is_deleted = 0 AND chat.name <> '' AND chat.type = 3 AND chat.is_private = 0 AND chat.organization_id = ?";
		if ($search != ""){
			$sql = $sql . " and chat.name LIKE '" . $search . "%'";
		}
		$rooms = $app['db']->fetchAll($sql, array($app['organization_id']));
		
		$result = array_merge($groups,$rooms,$users);
		
		usort(
			$result,
			function ($a, $b) {
				return strcasecmp($a['name'], $b['name']);
			}
		);
		
		return $result;
	}
	
	
	public function getUsersForRoom(Application $app, $user_ids){
	
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM user WHERE user.id IN (" . $user_ids . ")  and user.organization_id = ?";
		
		$users = $app['db']->fetchAll($sql,array($app['organization_id']));
	
		return $users;
		
	}
	
	
	public function getGroupMembersForRoom(Application $app, $group_ids){
	
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM group_member, user WHERE group_member.user_id = user.id AND group_member.group_id IN (" . $group_ids . ") and user.organization_id = ?";
	
		$groups = $app['db']->fetchAll($sql,array($app['organization_id']));
	
		return $groups;
	}
	
	
	public function getRoomMembersForRoom(Application $app, $room_ids){
	
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb FROM chat_member, user WHERE chat_member.user_id = user.id AND chat_member.chat_id IN (" . $room_ids . ") and user.organization_id = ? AND chat_member.is_deleted = 0";
	
		$groups = $app['db']->fetchAll($sql,array($app['organization_id']));
	
		return $groups;
	}
	
	
	public function getChatMembersGroupsRooms(Application $app, $chat_id){
	
		$users = array();
		$groups = array();
		$rooms = array();
		
		//users
		$sql = "SELECT chat_member.user_id, chat_member.chat_id, chat_member.is_deleted, CONCAT (user.firstname, ' ', user.lastname) as name, user.firstname, user.lastname, user.image, user.image_thumb, '1' as is_user FROM chat_member, user WHERE user.id = chat_member.user_id AND chat_member.chat_id = ? AND chat_member.is_deleted = 0 AND chat_member.organization_id = ?";
		
		$users = $app['db']->fetchAll($sql, array($chat_id,$app['organization_id']));
		
		$chat = $this->getChatByID($app, $chat_id);
		
		if ($chat['group_ids'] != ""){
			//find groups
			$sql = "SELECT groups.id, groups.name as name, groups.name as groupname, groups.image, groups.image_thumb, '1' as is_group FROM groups WHERE groups.is_deleted = 0 AND groups.id IN (".$chat['group_ids'].") AND groups.organization_id = ?";
			
			$groups = $app['db']->fetchAll($sql, array($app['organization_id']));
			
		}
		
		if ($chat['room_ids'] != ""){
			//find rooms
			$sql = "SELECT chat.id, chat.name as name, chat.name as chat_name, chat.image, chat.image_thumb, '1' as is_room FROM chat WHERE chat.is_deleted = 0 AND chat.name <> '' AND chat.type = 3 AND chat.is_private = 0 AND chat.id IN (".$chat['room_ids'].") AND chat.organization_id = ?";
			
			$rooms = $app['db']->fetchAll($sql, array($app['organization_id']));
		}
		
		$result = array_merge($groups,$rooms,$users);
		
		usort(
			$result,
			function ($a, $b) {
				return strcasecmp($a['name'], $b['name']);
			}
		);
		
		return $result;
	
	}
	
	
	public function getDetailValues(Application $app){
	
		$sql = "SELECT * FROM user_details WHERE is_deleted = 0 and ( organization_id = ? or is_default = 1 )";
		
		$detail_values = $app['db']->fetchAll($sql,array($app['organization_id']));
		
		return $detail_values;
	
	}
	
	public function getSeenBy(Application $app, $chat_id){
	
		$sql = "SELECT chat.seen_by FROM chat WHERE id = ?";
		
		$result = $app['db']->fetchAssoc($sql, array($chat_id));
		
		return $result['seen_by'];
	
	}
	
	
	public function getUsersNotMeNotChatMembers(Application $app, $my_user_id, $search, $offset, $chat_id){
		
		$sql = "SELECT user.id, user.firstname, user.lastname, user.image, user.image_thumb, user.details, user.last_device_id, user.web_opened FROM user";
		
		$sql = $sql . " WHERE user.id <> ? AND user.is_deleted = 0 ";
		
		$sql .= " AND user.id NOT IN (SELECT chat_member.user_id FROM chat_member WHERE chat_id = ? AND is_deleted = 0) ";
		
		if ($search != ""){
			$sql = $sql . " AND (firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%' OR CONCAT (firstname, ' ', lastname) LIKE '" . $search . "%')";
		}
		
		$sql = $sql . " and user.organization_id = ? ORDER BY user.firstname,user.lastname LIMIT " . $offset . ", " . USERS_PAGE_SIZE;
		
		$resultFormated = array();
		$result = $app['db']->fetchAll($sql, array($my_user_id, $chat_id, $app['organization_id']));
	
	}
	
	
	public function getUsersCountNotMeNotChatMembers(Application $app, $my_user_id, $search, $chat_id){
		
		$sql = "SELECT COUNT(*) FROM user WHERE user.id <> ? AND user.is_deleted = 0 and user.organization_id = ? ";
		
		$sql .= " AND user.id NOT IN (SELECT chat_member.user_id FROM chat_member WHERE chat_id = ? AND is_deleted = 0) ";
		
		if ($search != ""){
			$sql = $sql . " AND (firstname LIKE '" . $search . "%' OR lastname LIKE '" . $search . "%' OR CONCAT (firstname, ' ', lastname) LIKE '" . $search . "%')";
		}
		
		$result = $app['db']->executeQuery($sql, array($my_user_id,$app['organization_id']))->fetch();
		
		if ($result == false){
			return 0;
		} else {
			return $result["COUNT(*)"];
		}
	
	}
	
	
	public function getSearchUsersGroupsRoomsNotChatMembers(Application $app, $search, $my_user_id, $chat_id){
		
		$chat = $this->getChatById($app, $chat_id);
		
		$sql = "SELECT user.id, CONCAT (user.firstname, ' ', user.lastname) as name, user.firstname, user.lastname, user.image, user.image_thumb, user.details, user.last_device_id, user.web_opened, '1' as is_user FROM user WHERE user.id <> ?  and user.organization_id = ? ";
		
		$sql .= " AND user.id NOT IN (SELECT chat_member.user_id FROM chat_member WHERE chat_id = ? AND is_deleted = 0) ";
		
		if ($search != ""){
			$sql = $sql . " AND (CONCAT (user.firstname, ' ', user.lastname) LIKE '" . $search . "%'";
			$sql = $sql . " OR user.firstname LIKE '" . $search . "%'";
			$sql = $sql . " OR user.lastname LIKE '" . $search . "%')";
		}
		
		$users = $app['db']->fetchAll($sql, array($my_user_id, $app['organization_id'], $chat_id));
		
		$sql = "SELECT groups.id, groups.name as name, groups.name as groupname, groups.image, groups.image_thumb, '1' as is_group FROM groups WHERE groups.is_deleted = 0 AND groups.organization_id = ?";
		
		if ($chat['group_ids'] != ""){
			$sql .= " AND groups.id NOT IN (" . $chat['group_ids'] . ") ";
		}
		
		if ($search != ""){
			$sql = $sql . " and groups.name LIKE '" . $search . "%'";
		}
		$groups = $app['db']->fetchAll($sql, array($app['organization_id']));
		
		$sql = "SELECT chat.id, chat.name as name, chat.image, chat.image_thumb, chat.modified, chat.type, chat.is_active, chat.admin_id, chat.group_id, chat.seen_by, chat.is_private, chat.password, '1' as is_room FROM chat WHERE chat.is_deleted = 0 AND chat.name <> '' AND chat.type = 3 AND chat.is_private = 0 AND chat.organization_id = ?";
		
		if ($chat['room_ids'] != ""){
			$sql .= " AND chat.id NOT IN (" . $chat['room_ids'] . ") ";
		}
		
		if ($search != ""){
			$sql = $sql . " and chat.name LIKE '" . $search . "%'";
		}
		$rooms = $app['db']->fetchAll($sql, array($app['organization_id']));
		
		$result = array_merge($groups,$rooms,$users);
		
		usort(
			$result,
			function ($a, $b) {
				return strcasecmp($a['name'], $b['name']);
			}
		);
		
		return $result;
	
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
		
		$sql = "SELECT * FROM chat WHERE id = ? and organization_id = ?";

		$result = $app['db']->fetchAssoc($sql, array($chat_id,$app['organization_id']));
		
		return $result;
		
		
	}
	
	public function registDevice(Application $app, $userId,$userToken,$deviceType){
        
        // registered device
        $device =$app['db']->fetchAssoc("select * from device where user_id = ? and type = ? and organization_id = ? order by modified desc",array($userId,$deviceType,$app['organization_id']));
        
        $app['monolog']->addDebug(" device : " . print_r($device,true));  
        
        //if()
        if(isset($device['id'])){

            $app['db']->update('device', array(
                'is_valid' => 1,
                'user_token' => $userToken,
    			'modified' => time()
            ), array(
                'id' => $device['id']
            ));
        
        }else{

    		$values = array(
    	        'organization_id' => $app['organization_id'],
    			'user_id' => $userId, 
    			'user_token' => $userToken, 
    			'type' => $deviceType, 
    			'device_token' => '',
    			'is_valid' => 1,
    			'created' => time(), 
    			'modified' => time()
            );
    		
    		$app['monolog']->addDebug(" add new device " . print_r($values,true));  
    		
    		$app['db']->insert('device', $values);
		
        }
 
		
	}

	public function saveDeviceToken(Application $app, $userToken, $deviceToken){
		
		$where = array('device_token' => $deviceToken);
		$values = array('device_token' => '');
		$app['db']->update('device', $values, $where);
		
        $app['db']->update('device', array(
            'device_token' => $deviceToken
        ), array(
            'user_token' => $userToken
        ));
		
	}

	public function unRegistDevice(Application $app, $userId,$userToken,$deviceType){
        
        $app['db']->update('device', array(
            'is_valid' => 0,
			'modified' => time()
        ), array(
            'user_id' => $userId,
            'type' => $deviceType
        ));
 
		
	}
	public function disconectWebUsers(Application $app){

        $limitTime = time() - DISCONNECT_LIMIT_SEC;        
        $app['db']->query("update user set web_opened = 0 where web_lastkeepalive < {$limitTime}");
		
	}
}