<?php
namespace Spika\Db;

use Silex\Application;

interface DbInterface
{
	public function registerUser(Application $app, $outside_id, $firstname, $lastname, $password, $username, $android_push_token, $ios_push_token);
	public function loginUser(Application $app, $password, $username, $android_push_token, $ios_push_token, $deviceType);
	public function getUserByToken(Application $app, $token_received);
	public function updateUserIOSPushToken(Application $app, $user_id, $push_token);
	public function updateUserAndroidPushToken(Application $app, $user_id, $push_token);
	public function getOrCreateUserWithOutsideID(Application $app, $outside_id, $firstname, $lastname);
	public function getAllUsersWithOutsideId(Application $app, $outside_users_ary);
	public function updateUserImage(Application $app, $user_id, $image, $image_thumb);
	public function getUsersNotMe(Application $app, $my_user_id, $search, $offset);
	public function getUsersCountNotMe(Application $app, $my_user_id, $search);
	public function getUserByID(Application $app, $user_id);
	public function updateUser(Application $app, $user_id, $values);
	
	public function getGroups(Application $app, $user_id, $search, $offset, $category);
	public function getGroupsCount(Application $app, $user_id, $search, $category);
	public function getGroupMembers(Application $app, $group_id);
	public function getGroupMembersUserIDs(Application $app, $group_id);
	public function getGroupWithID(Application $app, $group_id);
	
	public function calculateBadge(Application $app, $user_id);
	
	public function isPrivateChatAlreadyExist(Application $app, $custom_chat_id);
	public function isGroupChatAlreadyExist(Application $app, $group_id);
	public function createChat(Application $app, $name, $type, $my_user_id, $group_id, $group_image, $group_image_thumb, $custom_chat_id, $category_id, $is_private);
	public function addChatMembers(Application $app, $chat_id, $members);
	public function getChatWithID(Application $app, $chat_id);
	public function getPrivateChatData(Application $app, $chat_id, $user_id);
	public function getChatMembers(Application $app, $chat_id);
	public function getChatMembersUserIDs(Application $app, $chat_id);
	public function getChatMembersAll(Application $app, $chat_id);
	public function updateChat(Application $app, $chat_id, $values);
	public function updateChatMember(Application $app, $chat_id, $user_id, $values);
	public function isChatMember(Application $app, $user_id, $chat_id);
	
	public function createMessage(Application $app, $values);
	public function getLastMessages(Application $app, $chat_id);
	public function getMessagesPaging(Application $app, $chat_id, $last_msg_id);
	public function getMessagesOnPush(Application $app, $chat_id, $first_msg_id);
	public function getCountMessagesForChat(Application $app, $chat_id);
	public function updateUnreadMessagesForMembers(Application $app, $chat_id, $user_id);
	public function resetUnreadMessagesForMember(Application $app, $chat_id, $user_id);
	public function updateChatHasMessages(Application $app, $chat_id);
	public function deleteMessage(Application $app, $message_id);
	public function updateMessage(Application $app, $message_id, $values);
	public function getMessageByID(Application $app, $message_id);
	public function getChildMessages(Application $app, $child_id_list);
	public function getModifiedMessages(Application $app, $chat_id, $modified, $last_msg_id);
	
	public function getRecentAllChats(Application $app, $user_id, $offset);
	public function getCountRecentAllChats(Application $app, $user_id);
	public function getRecentPrivateChats(Application $app, $user_id, $offset);
	public function getCountRecentPrivateChats(Application $app, $user_id);
	public function getRecentGroupChats(Application $app, $user_id, $offset);
	public function getCountRecentGroupChats(Application $app, $user_id); 
	public function getLastMessage(Application $app, $chat_id);
	
	public function getCategories(Application $app);
	public function createCategory(Application $app, $name);
	
	public function getRooms(Application $app, $user_id, $search, $offset, $category_id);
	public function getRoomsCount(Application $app, $user_id, $search, $category_id);
	public function getSearchUsersGroups(Application $app, $search, $my_user_id);
	public function getUsersForRoom(Application $app, $user_ids);
	public function getGroupMembersForRoom(Application $app, $group_ids);
	
	public function getDetailValues(Application $app);
	public function getSeenBy(Application $app, $chat_id);
	
}