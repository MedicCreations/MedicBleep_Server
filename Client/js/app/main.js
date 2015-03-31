if(document.URL.search(WEB_ROOT) == -1)
    location.href = WEB_ROOT;
else{
    
    // initialization
    requirejs.config({
    
      baseUrl: WEB_ROOT + '/js',
      waitSeconds: 200,
      shim: {
        'jQuery': { exports: '$' },
        'underscore': { exports: '_' },
        'backbone': {
          deps: ['jQuery', 'underscore'],
          exports: 'Backbone'
        },
        'json2': {},
        'Notification': {},
        'sjcl': {}
      },
     
      paths: {
        'jQuery': 'thirdparty/jquery-1.11.1',
        'underscore': 'thirdparty/underscore',
        'backbone': 'thirdparty/backbone',
        'SpikaClient': 'app/libs/apiclient',
        'templates': 'app/templates',
        'sjcl': 'thirdparty/sjcl/sjcl',
        'sha256': 'thirdparty/sjcl/sha256',
        'Notification': 'thirdparty/HTML5-Desktop-Notifications/desktop-notify',
      },
     
      urlArgs: 'bust=' + (new Date()).getTime()
    
    });
    
    // load core library
    define(['jQuery','underscore','backbone','Notification','sjcl'], function($, _, Backbone) {
	    
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
                    'thirdparty/blob',
                    'thirdparty/FileSaver',
                    'thirdparty/DataStream',
                    'app/libs/NotificationManager',
                    'app/libs/DataCacheManager',
                    'thirdparty/jquery.cookie',
                    'app/models/modelUser',
                    'app/models/modelGroup',
                    'app/models/modelMessage',
                    'app/models/modelHistory',
                    'app/models/modelChat',
                    'app/models/modelProfileParameter',
                    'app/models/modelRoom',
                    'app/models/modelSticker',
                    'app/models/modelCategory',
                    'app/libs/SoundManager',
                    'app/libs/FileUploadHandler',
                    'app/libs/EncryptionManager',
                    'app/libs/AvatarManager',
                    'app/libs/VideoCallManager',
                    'app/views/dialogs/callFailedDialog',
                    'app/views/dialogs/alertView',
                    'app/views/dialogs/inputPasswordDialog',
                    'app/views/progressView',
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
                    'thirdparty/sjcl/srp',
                    'thirdparty/browser',
                    'thirdparty/mimetype',
                    'thirdparty/RecordRTC',
                    'thirdparty/webcamjs/webcam',
                    'thirdparty/highlight/highlight.pack',
                    'thirdparty/chosen/chosen.jquery.min',
                    'thirdparty/base64',
                    'thirdparty/socket.io',
                    'thirdparty/OpenLayers.light',
                    'app/libs/LocationManger'], function() {

	        // load dependency libary
	        require(['thirdparty/sjcl/random'], function() { // thirdparty/sjcl/random depends on sjcl/sha256
	            
	            
	            // global variables
	            window.apiClient = new SpikaClient(API_URL,ENCODER_URL);
	            window.mainView = null;
	            SPIKA_notificationManger.init();
	            SPIKA_soundManager.init();
	            
                Webcam.set({
                    width: 320,
                    height: 240,
                    dest_width: WEBCAMPIC_WIDTH,
                    dest_height: WEBCAMPIC_HEIGHT,
                    image_format: 'jpeg',
                    jpeg_quality: 90,
                    force_flash: false
                });

	            // start app
	            require(['app/router'], function () {
	                
	                
	                        
	            });
	            
	        });
	        
		});
    
    });

}
