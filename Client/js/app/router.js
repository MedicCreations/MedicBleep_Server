    var AppRouter = Backbone.Router.extend({
        routes: {
            "main": "mainRoute",
            "login": "loginRoute",
            "logout": "logoutRoute",
            "forcelogout": "forcelogoutRoute",
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

    app_router.on('route:mainRoute', function(actions) {
        
        if(apiClient == null || SPIKA_UserManager.isAuthorised() == false){
            U.goPage('login');
            return;
        }
        
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
                $(HOLDER).fadeIn('slow');
            });
            
        });
        
    });
    
    
    
    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
    
    
    // global events
    Backbone.on(EVENT_SHOW_PAGE, function(page) {
        U.goPage(page);
        document.location.href = "#" + page;
    });
    
    Backbone.on(EVENT_FORCE_LOGOUT, function(page) {
        U.goPage('forcelogout');
    });
    