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


require(['app/libs/apiclient',
            'app/libs/utils',
            'app/libs/SoundManager'], function() {
    
    // global variables
    window.apiClient = new SpikaClient(API_URL);
    SPIKA_soundManager.init();
    
    // start app
    require(['app/router'], function () {
        
        
                
    });
    
});

