    var AppRouter = Backbone.Router.extend({
        routes: {
            "editprofile": "editprofileRoute",
            "createroom": "createRoomRoute",
            "editroom": "editRoomRoute",
            "main": "mainRoute",
            "login": "loginRoute",
            "logout": "logoutRoute",
            "forcelogout": "loginRoute",
            "*actions": "defaultRoute"
        }
    });
    
    // Initiate the router
    var app_router = new AppRouter;
    window.app = app_router;
    
    app_router.on('route:defaultRoute', function(actions) {
        U.goPage('login');
    });
    
    app_router.on('route:loginRoute', function(actions) {

        // load models
        require(['app/views/loginView',
                    'thirdparty/text!templates/login.tpl'
                ], function (DashboardPage,Template) {
            
            var loginView = new SPIKA_LoginView({
                template: Template
            });
            
            $(HOLDER).fadeOut('slow',function(){
                $(HOLDER).attr('id', 'login');
                $(HOLDER).html(loginView.render().el);
                $(HOLDER).fadeIn('slow');
            });
            
        });
        
    });

    app_router.on('route:logoutRoute', function(actions) {

		$.cookie(COOKIE_PASSWORD, '' , { expires: COOKIE_EXPIRES });
		
        apiClient.logout(function(data){
        	
        	if(SPIKA_UserManager.isAuthorised())
            	SPIKA_notificationManger.deattachUser(SPIKA_UserManager.getUser().get('id'));
            	
            SPIKA_UserManager.setUser(null);

            U.goPage("login");
        
        },function(data){

            SPIKA_notificationManger.deattachUser(SPIKA_UserManager.getUser().get('id'));
            SPIKA_UserManager.setUser(null);

            U.goPage("login");

        });
        
    });
    app_router.on('route:mainRoute', function(actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            U.goPage('login');
            return;
        }
        // reset all event listener
        Backbone.off();
        
        // load models
        require([
                    'app/views/mainView',
                    'thirdparty/text!templates/main.tpl'
                ], function (DashboardPage,Template) {
            
            var mainView = new SPIKA_MainView({
                template: Template
            });
            
            window.mainView = mainView;
            
            $(HOLDER).fadeOut('slow',function(){
                $(HOLDER).attr('id', 'chat');
                $(HOLDER).html(mainView.render().el);
                $(HOLDER).fadeIn('slow',function(){
                    mainView.updateUserInfo();
                });
            });
            
        });
        
    });
    
    app_router.on('route:createRoomRoute', function(actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            U.goPage('login');
            return;
        }
        
        // reset all event listener
        Backbone.off();
        
        // load models
        require([
                    'app/views/featureViews/createRoomView',
                    'thirdparty/text!templates/featureViews/createRoomView.tpl'
                ], function (CreateRoomView,Template) {
            
            var createRoomView = new SPIKA_CreateRoomView({
                template: Template
            });
            
            $(HOLDER).fadeOut('fast',function(){
                $(HOLDER).attr('id', 'chat');
                $(HOLDER).html(createRoomView.render().el);
                $(HOLDER).fadeIn('fast');
            });
            
        });
        
    });

    app_router.on('route:editRoomRoute', function(actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            U.goPage('login');
            return;
        }
        
        if(_.isNull(mainView.chatView.chatData) || _.isUndefined(mainView.chatView.chatData))
            return;
            
        
        // reset all event listener
        Backbone.off();
        
        // load models
        require([
                    'app/views/featureViews/createRoomView',
                    'thirdparty/text!templates/featureViews/createRoomView.tpl'
                ], function (CreateRoomView,Template) {
            
            var createRoomView = new SPIKA_CreateRoomView({
                template: Template,
                chatData: mainView.chatView.chatData
            });
                        
            $(HOLDER).fadeOut('fast',function(){
                $(HOLDER).attr('id', 'chat');
                $(HOLDER).html(createRoomView.render().el);
                $(HOLDER).fadeIn('fast');
            });

        });
        
    });
    
    app_router.on('route:editprofileRoute', function(actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            U.goPage('login');
            return;
        }
        
        // reset all event listener
        Backbone.off();
        
        // load models
        require([
                    'app/views/featureViews/editProfileView',
                    'thirdparty/text!templates/featureViews/editProfileView.tpl'
                ], function (EditProflieView,Template) {
            
            var editProfileView = new SPIKA_EditProflieView({
                template: Template
            });
            
            $(HOLDER).fadeOut('fast',function(){
                $(HOLDER).attr('id', 'chat');
                $(HOLDER).html(editProfileView.render().el);
                $(HOLDER).fadeIn('fast');
            });
            
        });
        
    }); 
    
    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
    
    
    // global events
    Backbone.on(EVENT_SHOW_PAGE, function(page) {
        U.goPage(page);
    });
    
    Backbone.on(EVENT_FORCE_LOGOUT, function(page) {
        U.goPage('forcelogout');
    });
    