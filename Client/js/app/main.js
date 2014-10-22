// initialization
requirejs.config({

  baseUrl: WEB_ROOT + '/js',
  shim: {
    'jQuery': { exports: '$' },
    'underscore': { exports: '_' },
    'backbone': {
      deps: ['jQuery', 'underscore'],
      exports: 'Backbone'
    },
    'json2': {},
    'Notification': {}
  },
 
  paths: {
    'jQuery': 'thirdparty/jquery-1.11.1',
    'underscore': 'thirdparty/underscore',
    'backbone': 'thirdparty/backbone',
    'SpikaClient': 'app/libs/apiclient',
    'templates': 'app/templates',
    'Notification': 'thirdparty/HTML5-Desktop-Notifications/desktop-notify',
  },
 
  urlArgs: 'bust=' + (new Date()).getTime()

});

// load core library
define(['jQuery','underscore','backbone','Notification'], function($, _, Backbone) {

    // load all required thirdparty library here
    require(['app/libs/apiclient',
                'app/libs/UserManager',
                'app/libs/utils',
                'app/libs/SoundManager',
                'thirdparty/autolink-min',
                'thirdparty/CryptoJS/rollups/md5',
                'thirdparty/CryptoJS/rollups/pbkdf2',
                'thirdparty/CryptoJS/rollups/aes',
                'thirdparty/rncryptor/rncryptor',
                'thirdparty/rncryptor/sjcl',
                'thirdparty/sprintf',
                'thirdparty/FileSaver',
                'thirdparty/DataStream',
                'app/libs/NotificationManager',
                'thirdparty/jquery.cookie',
                'app/models/modelUser',
                'app/models/modelGroup',
                'app/models/modelMessage',
                'app/models/modelHistory',
                'app/models/modelChat',
                'app/models/modelRoom',
                'app/libs/SoundManager',
                'app/libs/FileUploadHandler',
                'app/libs/EncryptionManager',
                'app/views/alertView',
                'app/views/progressView',
                'thirdparty/base64'], function() {
        
        
        // global variables
        window.apiClient = new SpikaClient(API_URL);
        window.mainView = null;
        SPIKA_notificationManger.init();
        SPIKA_soundManager.init();
        
        // start app
        require(['app/router'], function () {
            
            
                    
        });
        
    });


});



