define(['jQuery','underscore','backbone','Notification'], function($, _, Backbone) {

    var AppRouter = Backbone.Router.extend({
        routes: {
            "main": "mainRoute",
            "logout": "logoutRoute",
            "forcelogout": "forcelogoutRoute",
            "*actions": "defaultRoute"
        }
    });
    
    // Initiate the router
    var app_router = new AppRouter;
    window.app = app_router;

    app_router.on('route:forcelogoutRoute', function(actions) {
        
        require(['app/views/loginView',
                    'app/views/alert',
                    'thirdparty/text!templates/login.tpl',
                    'app/libs/NotificationManager',
                    'thirdparty/jquery.cookie'], function (DashboardPage,AlertView,Template) {
            
            var loginView = new SPIKA_LoginView({
                template: Template,
                noAutoLogin: true
            });
            
            $(HOLDER).attr('class', 'login');
            $(HOLDER).html(loginView.render().el);
            
            
            
        });
        

        
    });
    
    app_router.on('route:logoutRoute', function(actions) {
        
        try{
                    
            $.removeCookie(COOKIE_USERNAME);
            $.removeCookie(COOKIE_PASSWORD);
            
            document.location.href = "#login";
            
            if(!_.isUndefined(SPIKA_notificationManger))
                SPIKA_notificationManger.stopPooling();


        } catch(ex){

            U.l(ex);
            document.location.href = "#login"; 
            
        }

    });

    
    app_router.on('route:defaultRoute', function(actions) {
        
        // load models
        require(['app/views/loginView',
                    'app/views/alert',
                    'thirdparty/text!templates/login.tpl',
                    'thirdparty/CryptoJS/rollups/md5',
                    'thirdparty/CryptoJS/rollups/pbkdf2',
                    'thirdparty/CryptoJS/rollups/aes',
                    'thirdparty/rncryptor/rncryptor',
                    'thirdparty/rncryptor/sjcl',
                    'thirdparty/sprintf',
                    'thirdparty/FileSaver',
                    'app/libs/NotificationManager',
                    'thirdparty/jquery.cookie',
                    'app/models/modelUser',
                    'app/models/modelGroup',
                    'app/models/modelMessage',
                    'app/models/modelHistory',
                    'app/models/modelChat',
                    'app/libs/SoundManager',
                    'app/libs/FileUploadHandler',
                    'app/libs/EncryptionManager',
                    'thirdparty/base64'], function (DashboardPage,AlertView,Template) {
            
            SPIKA_soundManager.init();
            
            var loginView = new SPIKA_LoginView({
                template: Template
            });
            
            $(HOLDER).attr('class', 'login');
            $(HOLDER).html(loginView.render().el);

        });
        
    });

    app_router.on('route:mainRoute', function (actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            document.location.href = "#login";
            return;
        }
        
        require(['app/views/mainView','thirdparty/text!templates/main.tpl'], 
                    function (MainViewTmp,TemplateMain) {

            window.mainView = new SPIKA_MainView({
                template: TemplateMain
            });
            
            $(HOLDER).attr('class', 'chat');
            $(HOLDER).html(window.mainView.render().el);

        });
        
    });

    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
    
    
    // global events
    Backbone.on(EVENT_SHOW_PAGE, function(page) {
        document.location.href = "#" + page;
    });
    
    Backbone.on(EVENT_FORCE_LOGOUT, function(page) {
        document.location.href = "#forcelogout";
        
    });
    
});

