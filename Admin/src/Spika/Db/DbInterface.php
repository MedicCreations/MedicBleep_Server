<?php
namespace Spika\Db;

use Silex\Application;

interface DbInterface
{
	public function registerUser(Application $app, $outside_id, $firstname, $lastname, $password, $username, $android_push_token, $ios_push_token);
	public function loginUser(Application $app, $password, $username, $android_push_token, $ios_push_token);
	public function getUserByToken(Application $app, $token_received);
	public function updateUserIOSPushToken(Application $app, $user_id, $push_token);
	public function updateUserAndroidPushToken(Application $app, $user_id, $push_token);
	public function getOrCreateUserWithOutsideID(Application $app, $outside_id, $firstname, $lastname);
	public function getAllUsersWithOutsideId(Application $app, $outside_users_ary);
	public function updateUserImage(Application $app, $user_id, $image, $image_thumb);
	public function getUsers(Application $app, $search, $offset);
	public function getUsersCount(Application $app);
	
	public function calculateBadge(Application $app, $user_id);
	
	public function isPrivateChatAlreadyExist(Application $app, $my_user_id, $other_user_id);
	public function isGroupChatAlreadyExist(Application $app, $outside_group_id);
	public function createChat(Application $app, $name, $type, $outside_group_id, $group_image);
	public function addChatMembers(Application $app, $chat_id, $members);
	public function getChatWithID(Application $app, $chat_id);
	public function getPrivateChatNameAndImage(Application $app, $chat_id, $user_id);
	public function getChatMembers(Application $app, $chat_id);
	
	public function createMessage(Application $app, $chat_id, $user_id, $type, $text, $file_id, $thumb_id, $longitude, $latitude);
	public function getLastMessages(Application $app, $chat_id);
	public function getMessagesPaging(Application $app, $chat_id, $last_msg_id);
	public function getMessagesOnPush(Application $app, $chat_id, $first_msg_id);
	public function getCountMessagesForChat(Application $app, $chat_id);
	public function updateUnreadMessagesForMembers(Application $app, $chat_id);
	public function resetUnreadMessagesForMember(Application $app, $chat_id, $user_id);
	public function updateChatHasMessages(Application $app, $chat_id);
	
	public function getRecentPrivateChats(Application $app, $user_id, $offset);
	public function getCountRecentPrivateChats(Application $app, $user_id);
	public function getRecentGroupChats(Application $app, $user_id, $offset);
	public function getCountRecentGroupChats(Application $app, $user_id); 
	
	
}