<?php


define('HTTP_PORT', 80);

define ('TOKEN_DEFAULT', 'tokendefault');

define ('MSG_PAGE_SIZE', 100);
define ('USERS_PAGE_SIZE', 50);
define ('GROUPS_PAGE_SIZE', 50);
define ('RECENT_PAGE_SIZE', 50);
define ('ROOMS_PAGE_SIZE', 50);
define ('DEFAULT_USER_IMAGE', 'default_user_image');
define ('DEFAULT_GROUP_IMAGE', 'default_group_image');

//chat types
define('CHAT_USER_TYPE', 1);
define('CHAT_GROUP_TYPE', 2);
define('CHAT_ROOM_TYPE', 3);

//lobby types
define('LOBBY_ALL_TYPE', 0);
define('LOBBY_USERS_TYPE', 1);
define('LOBBY_GROUPS_TYPE', 2);
define('LOBBY_ALL_TOGETHER_TYPE', 3);

//push_types
define ('PUSH_TYPE_MESSAGE', 1);
define ('PUSH_TYPE_SEEN', 2);

//push service provider type
define("SERVICE_PROVIDOR_APN_PROD",1);
define("SERVICE_PROVIDOR_APN_DEV",2);
define("SERVICE_PROVIDOR_GCM",3);


//message types
define("MSG_TEXT", 1);
define("MSG_IMAGE", 2);
define("MSG_VIDEO", 3);
define("MSG_LOCATION", 4);
define("MSG_VOICE", 5);
define("MSG_FILE", 6);
define("MSG_DELETED", 7);

//search types
define("USERS", 1);
define("GROUPS", 2);
define("ROOMS", 3);
define("ALL", 4);

//success codes
define('CODE_SUCCESS', 2000);

//error codes
define('ER_DEFAULT', 1111);
define('ER_INVALID_TOKEN', 1000);
define('ER_TOKEN_EXPIRED', 1001);
define('ER_DIR_NOT_WRITABLE', 1002);
define('ER_INVALID_LOGIN', 1003);
define('ER_NO_CHILD_MSGS', 1004);
define('ER_NOT_CHAT_MEMBER', 1005);
define('ER_CHAT_INACTIVE', 1006);
define('ER_CHAT_DELETED', 1007);
define('ER_PAGE_NOT_FOUND', 1008);
define('ER_NOT_GROUP_ADMIN', 1009);
define('ER_EMAIL_MISSING', 1010);

define('ER_TEMP_PASSWORD_NOT_VALID', 1011);
define('ER_LOGIN_WITH_TEMP_PASS', 1012);
define('ER_USERNAME_NOT_EXIST', 1013);
define('ER_INVALID_TEMP_PASSWORD', 1014);
define('ER_PASSWORD_EXIST', 1015);

define('ER_ROOM_LIMIT', 1016);
define('ER_DISKSPACE_LIMIT', 1017);

define('ER_ACCOUNT_SUSPENDED', 1018);
define('ER_ACCOUNT_DISABLED', 1019);

// device types
define('DEVICE_IOS', 2);
define('DEVICE_ANDROID', 3);
define('DEVICE_WEB', 1);

// auto disconnect threashhold
define('DISCONNECT_LIMIT_SEC',30);

define('MESSAGE_LOG_SEND',1);
define('MESSAGE_LOG_READ',2);
