// config
var API_URL = 'https://www.spikaent.com/dev/server/v1';
var WEB_ROOT = 'https://www.spikaent.com/dev/web'
var AES_PASSWORD = 'jFglBLpOJQ4RLlVTl5EulWS2NLrTgHzB';

var POOLING_INTERVAL = 3000; // ms
var HOLDER = "#spika_window";
var WINDOW_MODE = true;
var THREE_COLMODE_WIDTH = 640;

// event trigers
var EVENT_WINDOW_SIZE_CHANGED = 'windowSizeChanged';
var EVENT_SHOW_PAGE = 'showPage';
var EVENT_START_PRIVATE_CHAT = 'startPrivateChat';
var EVENT_START_CHAT_BY_CHATDATA = 'startChatByChatData';
var EVENT_START_GROUP_CHAT = 'startGroupChat';
var EVENT_NEW_MESSAGE = 'newMessage';
var EVENT_MESSAGE_SENT = 'messageSent';
var EVENT_TB_HEIGHT_UPDATED = 'tbHeightUpdated';
var EVENT_FORCE_LOGOUT = 'eventForceLogout';
var EVENT_OPEN_LEFTMENU = 'eventOpenLeftMenu';
var EVENT_ENTER_CHAT = 'eventEnterChat';
var EVENT_ADDUSER_TO_CHAT = 'eventAddUserToChat';
var EVENT_SELECT_REPLY = 'eventSelectReply';
var EVENT_THREAD_MODE = 'eventThreadMode';
var EVENT_LIST_MODE = 'eventListMode';

// message types
var MESSAGE_TYPE_TEXT = 1;
var MESSAGE_TYPE_IMAGE = 2;
var MESSAGE_TYPE_VIDEO = 3;
var MESSAGE_TYPE_LOCATION = 4;
var MESSAGE_TYPE_VOICE = 5;
var MESSAGE_TYPE_FILE = 6;

// image
var BIG_PIC_SIZE = 1024;
var THUMB_PIC_SIZE = 250;

// cookie
var COOKIE_USERNAME = 'cookieusername';
var COOKIE_PASSWORD = 'cookiepassword';
var COOKIE_EXPIRES = 30; // days
var COOKIE_LAST_CHATID = 'lastchatid';
var COOKIE_LAST_CHATNAME = 'lastchatname';

// right column
var RIGHTCOLUMN_DISPLAYMODE_NORMALCHAT = 'displaymode_normal_chat';
var RIGHTCOLUMN_DISPLAYMODE_GROUPCHAT = 'displaymode_group_chat';

// chat view
var CHATVIEW_LISTMODE = 'chatview_list_mode';
var CHATVIEW_THREADMODE = 'chatview_thread_mode';

var CHATTYPE_PRIVATE = '1';
var CHATTYPE_GROUP = '2';

var LOADING_IMAGE = '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';