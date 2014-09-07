var SPIKA_LoginView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, "render", "login_press");
        this.template = options.template;
        
        this.preventAutoLogin = false;
        if(!_.isUndefined(options.noAutoLogin)){
            this.preventAutoLogin = options.noAutoLogin;
        }
    },
    
    events: {
        "click #btn_login":  "login_press"
    },
    
    render: function() {
    
        $(this.el).html(this.template);
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    /*
    // notification init
    _.debounce(function() {

        var notificationPermission = notify.permissionLevel();
        if(notificationPermission === notify.PERMISSION_DEFAULT){
            notify.requestPermission(function(){
                
            });
             U.l('request');
        }
        
        U.l(notificationPermission);
        
    }, 5000)();
    */

    
    
    


    login_press: function(e) {
        
        $(U.sel('#alertholder')).css('display','none');
        
        var username = $(U.sel("#tb_username")).val();
        var password = $(U.sel("#tb_password")).val();

        if($(U.sel('#login_remember_checkbox:checked')).length > 0){
            $.cookie(COOKIE_USERNAME, username, { expires: COOKIE_EXPIRES });
            $.cookie(COOKIE_PASSWORD, password, { expires: COOKIE_EXPIRES });
        }
        
        apiClient.login(username,password,function(data){
            
            apiClient.getUserById(data.user_id,function(data){
            
                SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                
                $(U.sel('#loginform')).fadeOut(200,function(){
                    
                    $(U.sel('#loginform')).css('display','none');
                    $(U.sel('#login_loading')).css('display','block');
                    
                    $(U.sel('#loading')).fadeIn(200,function(){
                        
                        Backbone.trigger(EVENT_SHOW_PAGE,'main');
                        
                    });
                    
                });
                
            },function(data){
                
                
                
            });

            
        },function(data){
            
           $(U.sel('#alertholder')).css('display','block');
            
            SPIKA_AlertView.msg($(U.sel('#alertholder')),{ 
                 alert: 'danger', 
                 msg: 'Wrong password or username.'
            });
            
        });

            
    },
    
    onload : function(){

        var self = this;

        this.username = $(U.sel("#tb_username"));
        this.password = $(U.sel("#tb_password"));
        
        $(U.sel('#permission_allow')).css('cursor','pointer');
        
        var notificationPermission = notify.permissionLevel();
        if(notificationPermission === notify.PERMISSION_DEFAULT){
            
            $(U.sel('#permission_allow')).css('display','block');
            
            $(U.sel('#permission_allow')).click(function(){

                notify.requestPermission(function(){
                    $(U.sel('#permission_allow')).fadeOut();
                });
            
            });

            
        }else if(notificationPermission === notify.PERMISSION_DENIED){
            
            $(U.sel('#permission_allow')).css('display','block');
            $(U.sel('#permission_allow')).text('Desktop notification is disables.')

            
        }else{
            $(U.sel('#permission_allow')).css('display','none');
        }
        
        
        
        
        if(!_.isNull($.cookie(COOKIE_USERNAME)) && !_.isUndefined($.cookie(COOKIE_USERNAME))){
            $(U.sel("#tb_username")).val($.cookie(COOKIE_USERNAME));
        }

        if(!_.isNull($.cookie(COOKIE_PASSWORD)) && !_.isUndefined($.cookie(COOKIE_PASSWORD))){
            $(U.sel("#tb_password")).val($.cookie(COOKIE_PASSWORD));
            
            if(this.preventAutoLogin != true)
                this.login_press();
        }
        
    }
    
});
