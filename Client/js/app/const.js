// event trigers
var EVENT_WINDOW_SIZE_CHANGED = 'windowSizeChanged';
var EVENT_SHOW_PAGE = 'showPage';
var EVENT_START_CHAT = 'startChat';
var EVENT_MESSAGE_SENT = 'messageSent';
var EVENT_NEW_MESSAGE = 'newMessage';
var EVENT_FILE_DROP = 'eventFileDrop';
var EVENT_REFRESH_ROOMLIST = 'eventRefreshRoomList';
var EVENT_OPEN_PROFLIE = 'openProflie';
var EVENT_OPEN_CHATPROFLIE = 'openChatProflie';
var EVENT_CLICK_ANYWHARE = 'clickAnyWhere';
var EVENT_ENTER_CHAT = 'eventEnterChat';
var EVENT_LEAVE_CHAT = 'leaveChat';
var EVENT_FORCE_LOGOUT = 'eventForceLogout';
var EVENT_MESSAGE_SENDING = 'eventMessageSending';
var EVENT_OPEN_EXTRAMESSAGE = 'eventOpenExtraMessage';
var EVENT_CALL_ERROR = 'eventCallError';
var EVENT_CALL_FINISH = 'eventCallFinish';


var EVENT_START_PRIVATE_CHAT = 'startPrivateChat';
var EVENT_START_GROUP_CHAT = 'startGroupChat';
var EVENT_TB_HEIGHT_UPDATED = 'tbHeightUpdated';
var EVENT_OPEN_LEFTMENU = 'eventOpenLeftMenu';
var EVENT_ADDUSER_TO_CHAT = 'eventAddUserToChat';
var EVENT_SELECT_REPLY = 'eventSelectReply';
var EVENT_THREAD_MODE = 'eventThreadMode';
var EVENT_LIST_MODE = 'eventListMode';
var EVENT_NEW_GROUP = 'eventNewGroup';

// message types
var MESSAGE_TYPE_TEXT = 1;
var MESSAGE_TYPE_IMAGE = 2;
var MESSAGE_TYPE_VIDEO = 3;
var MESSAGE_TYPE_LOCATION = 4;
var MESSAGE_TYPE_VOICE = 5;
var MESSAGE_TYPE_FILE = 6;

// image
var BIG_PIC_SIZE = 1024;
var PROFLIE_PIC_SIZE = 512;
var THUMB_PIC_SIZE = 250;
var THUMB_PIC_SIZE_INVIEW = 100;

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

var LOADING_IMAGE = '';

var DEVICE_WEB = 1;
var DEVICE_IOS = 2;
var DEVICE_ANDROID = 3;

var KEEPALIVE_INTERVAL = 20 * 1000; //msec
var INDENT_UNITPIXEL= 20; // pixel per one 

var WEBCAMPIC_WIDTH = 640;
var WEBCAMPIC_HEIGHT = 480;
