<?php

/*
 * This file is part of the Silex framework.
 *
 * Copyright (c) 2013 clover studio official account
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
 
define('TOKEN_VALID_TIME', 60*60*24);
define('PW_RESET_CODE_VALID_TIME', 60*5);
define('ROOT_URL', "http://localhost:8080/server/wwwroot");
define('PUSH_ROOT_URL', "https://www.spikaent.com/push/receiver.php");
define('SYSTEM_IDENTIFIER', "clover");
define('WEBSOCKET_SERVER_HOST', "www.spikaent.com");
define('WEBSOCKET_SERVER_PORT', "8443");
define('USEWEBSOCKET',true);

define('INFORMATION_URL', "http://enterprise.spikaapp.com/index.html");

//define sql database
define('DB_NAME', "spikadb");
define('DB_USERNAME', "root");
define('DB_PASSWORD', "");


define('LDAP_SERVER', '192.168.1.180');
define('LDAP_PORT', 389);
define('LDAP_BASE_DN', 'DC=clover-studio,DC=com');

define('HTTP_PORT', 80);

define ('TOKEN_DEFAULT', 'tokendefault');

define ('MSG_PAGE_SIZE', 10);
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

//success codes
define('CODE_SUCCESS', 2000);

//error codes
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


// device types
define('DEVICE_IOS', 2);
define('DEVICE_ANDROID', 3);
define('DEVICE_WEB', 1);

// auto disconnect threashhold
define('DISCONNECT_LIMIT_SEC',30);
?>