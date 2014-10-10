var SPIKA_LoginView = Backbone.View.extend({

    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    onload : function(){

        var self = this;
        
        this.hideAlert(false);

        _.debounce(function() {
            self.handleNotificationSettinge();
        }, 1000)();
        
        
        if(!_.isNull($.cookie(COOKIE_USERNAME)) && !_.isUndefined($.cookie(COOKIE_USERNAME))){
            $$("#login_tb_username").val($.cookie(COOKIE_USERNAME));
        }

        if(!_.isNull($.cookie(COOKIE_PASSWORD)) && !_.isUndefined($.cookie(COOKIE_PASSWORD))){
            $$("#login_tb_password").val($.cookie(COOKIE_PASSWORD));
        }

        $$('#login_btn_login').click(function(){
            
            self.hideAlert(true);
             
            var username = $$("#login_tb_username").val();
            var password = $$("#login_tb_password").val();
            
            if(_.isEmpty(username) || _.isEmpty(password)){
                
                self.showAlert(LANG.login_validation_failed1);
                return;
            }
            
            $.cookie(COOKIE_USERNAME, username, { expires: COOKIE_EXPIRES });
            $.cookie(COOKIE_PASSWORD, password, { expires: COOKIE_EXPIRES });

            apiClient.login(username,password,function(data){
                
                apiClient.getUserById(data.user_id,function(data){
                    
                    SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                    
                    Backbone.trigger(EVENT_SHOW_PAGE,'main');
                    
                },function(data){
                    
                    self.showAlert(LANG.login_failed);
                    
                });
    
                
            },function(data){
                
                self.showAlert(LANG.login_failed);
                
            });
            
        });
        
        
    },
    showAlert:function(text){
        $$('#login_div_alert').text(text);
        $$('#login_div_alert').fadeIn();
    },
    hideAlert:function(doAnimation){
        if(doAnimation)
            $$('#login_div_alert').fadeOut();
        else
            $$('#login_div_alert').hide();
    },
    handleNotificationSettinge:function(){
        
        var notificationPermission = notify.permissionLevel();
        
        if(notificationPermission === notify.PERMISSION_DEFAULT){


            SPIKA_AlertManager.show(LANG.login_notification_alert_title,LANG.login_notification_alert,function(){
                
                notify.requestPermission(function(){

                    

                });
                
            },function(){
                
            })

            
        }else if(notificationPermission === notify.PERMISSION_DENIED){

            SPIKA_AlertManager.show(LANG.login_notification_alert_title,LANG.login_notification_alert,function(){
                
                notify.requestPermission(function(){

                    

                });
                
            },function(){
                
            })

        }else{
            
            
            
        }

        
    }
    
});
