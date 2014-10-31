if(document.URL.search(WEB_ROOT) == -1)
    location.href = WEB_ROOT;
else{
    
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
                    'thirdparty/sjcl/sjcl',
                    'thirdparty/sjcl/aes',
                    'thirdparty/sjcl/bitArray',
                    'thirdparty/sjcl/bn',
                    'thirdparty/sjcl/cbc',
                    'thirdparty/sjcl/ccm',
                    'thirdparty/sjcl/codecBase32',
                    'thirdparty/sjcl/codecBase64',
                    'thirdparty/sjcl/codecBytes',
                    'thirdparty/sjcl/codecHex',
                    'thirdparty/sjcl/codecString',
                    'thirdparty/sjcl/convenience',
                    'thirdparty/sjcl/ecc',
                    'thirdparty/sjcl/gcm',
                    'thirdparty/sjcl/hmac',
                    'thirdparty/sjcl/ocb2',
                    'thirdparty/sjcl/pbkdf2',
                    'thirdparty/sjcl/sha1',
                    'thirdparty/sjcl/sha256',
                    'thirdparty/sjcl/sha512',
                    'thirdparty/sjcl/random',
                    'thirdparty/sjcl/srp',
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

}
