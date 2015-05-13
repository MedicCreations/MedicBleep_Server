var SPIKA_LoginView = Backbone.View.extend({

    isAutologin : false,
    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
	    
	    var self = this;
	    
        if(!_.isNull($.cookie(COOKIE_USERNAME)) 
        	&& !_.isUndefined($.cookie(COOKIE_USERNAME)) 
        	&& !_.isEmpty($.cookie(COOKIE_USERNAME))
        	&& !_.isNull($.cookie(COOKIE_PASSWORD))
        	&& !_.isUndefined($.cookie(COOKIE_PASSWORD))
        	&& !_.isEmpty($.cookie(COOKIE_PASSWORD))){
	        
			var username = $.cookie(COOKIE_USERNAME);
			var password = $.cookie(COOKIE_PASSWORD);
            
            this.isAutologin = true;
            this.proceedLogin(username,password,true);
            
	        return this;
	        
        }else{

	        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
	        
	        var self = this;
	        
            require([
                'app/views/dialogs/forgetPasswordDialog'
            ], function (forgetPasswordDialog) {
    
                self.onload();
                
            });
	         
	        return this;
        }

    },
    
    onload : function(){

        var self = this;
        this.hideAlert(false);
        
        // Browser compatibility check
        if (window.File && 
            window.FileReader && 
            window.FileList && 
            window.Blob && 
            window.WebSocket && 
            window.localStorage && 
            typeof(Worker) !== "undefined") {
          // Great success! All the File APIs are supported.
        } else {
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.browser_doesnt_support);
            $$('#login_btn_login').attr('disabled','disabled');
            return;
        }

        _.debounce(function() {
            self.handleNotificationSettinge();
        }, 1000)();
        
        
        if(!_.isNull($.cookie(COOKIE_USERNAME)) && !_.isUndefined($.cookie(COOKIE_USERNAME)) && !_.isEmpty($.cookie(COOKIE_USERNAME))){
            $$("#login_tb_username").val($.cookie(COOKIE_USERNAME));
            $$("#login_checkbox").prop("checked",true);
        }else{
            $$("#login_checkbox").prop("checked",false);
        }

        if(!_.isNull($.cookie(COOKIE_PASSWORD)) && !_.isUndefined($.cookie(COOKIE_PASSWORD))){
            $$("#login_tb_password").val($.cookie(COOKIE_PASSWORD));
        }
		
        $$('#login_btn_login').click(function(){
            self.doLogin();            
        });

        $$("#login_tb_password").keyup(function(e){
            if(e.keyCode == 13)
            {
                self.doLogin();
            }
        });
        
        $$("#login_btn_forgot").click(function(){
           
            SPIKA_ForgetPasswordManager.showDialogForUsername(
                LANG.forget_password,
                LANG.forget_password_firststep_text,
            function(username){
                
    	        apiClient.sendTempPassword(username,function(data){
    	            
    	            self.showAlert(LANG.forget_password_firststep_emailsent);
    	            
    	        },function(data){
    	            
    	            self.showAlert(LANG.forget_password_firststep_wrongusername);
    	            
    	        });

                
                
            },function(){
                
                
                
            })
            
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
        
        if(USE_DESKTOPNOTIFICATION == false)
            return;
		
		if(U.isIE())
			return;
            
        var notificationPermission = notify.permissionLevel();
        
        U.l("permission " + notificationPermission);
        
        if(notificationPermission === notify.PERMISSION_DEFAULT){


            SPIKA_AlertManager.show(LANG.login_notification_alert_title,LANG.login_notification_alert,function(){
                
                notify.requestPermission(function(){

                    

                });
                
            },function(){
                
            })

            
        }else if(notificationPermission === notify.PERMISSION_DENIED){
            
            /* if denied doesn't show up again
            SPIKA_AlertManager.show(LANG.login_notification_alert_title,LANG.login_notification_alert,function(){
                
                notify.requestPermission(function(){

                    

                });
                
            },function(){
                
            })
            */
            
        }else{
            
            
            
        }

        
    },
    doLogin : function(){
        
        var self = this;
        
        self.hideAlert(true);
         
        var username = $$("#login_tb_username").val();
        var password = $$("#login_tb_password").val();
        
        if(_.isEmpty(username) || _.isEmpty(password)){
            
            self.showAlert(LANG.login_validation_failed1);
            return;
        }
        
        var savePassword = $$("#login_checkbox").prop("checked");

        if(savePassword){
            $.cookie(COOKIE_USERNAME, username, { expires: COOKIE_EXPIRES });
            $.cookie(COOKIE_PASSWORD, password, { expires: COOKIE_EXPIRES });
        } else {
            $.cookie(COOKIE_USERNAME, '', { expires: COOKIE_EXPIRES });
            $.cookie(COOKIE_PASSWORD, '', { expires: COOKIE_EXPIRES });
        }
        
        this.proceedLogin(username,password);
    },
    
    proceedLogin: function(username,password,forceLogout){
        
        if(_.isUndefined(forceLogout))
            forceLogout = false;
            
        var self = this;
        
        U.l('proceedLogin');
        
        apiClient.prelogin(username,password,function(data){
            
            if(_.isNull(data.organizations)){
                self.showAlert(LANG.login_failed);
                if(forceLogout)
                    U.goPage('logout');
                    
                return;
            }
            
            if(data.organizations.length < 1){
                self.showAlert(LANG.login_failed);
                if(forceLogout)
                    U.goPage('logout');
                return;
            }
            
            if(data.organizations.length == 1){
                
                var tmpOrganization = data.organizations[0];
                
                apiClient.login(username,password,tmpOrganization.id,function(data){
                    
        			
                    apiClient.getUserById(data.user_id,function(data){
                        
                        SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                        SPIKA_notificationManger.attachUser(data.user.id);
                        AvatarManager.init();

                        SPIKA_VideoCallManager.init(data.user_id);
                        
                        U.goPage("main");
                        
                    },function(data){
                        
                        self.showAlert(LANG.login_failed);
                        if(forceLogout)
                            U.goPage('logout');
                        
                    });
        
                    
                },function(data){
                    
                    var code = data.code; 
                            
    	            if(!_.isUndefined(data.code) && data.code == 1018){
        	             self.showAlert(LANG.login_account_suspened);
    	            }
    	            
    	            else if(!_.isUndefined(data.code) && data.code == 1019){
        	            self.showAlert(LANG.login_account_disabled);
    	            }
    	            
    	            else{
        	           self.showAlert(LANG.login_failed);
    	            }
    	            
    	            if(self.isAutologin){
        	            U.goPage('logout');
    	            }
                    
                });
    
            } else {
                
                SPIKA_UserManager.preloginData = {
                    organizations : data.organizations,
                    username : username,
                    password : password
                };
                
                U.goPage("organizationSelect");  
                              
            }
                    
        },function(data){
            
            if(data.code == 1012){ // temporary password login
                
                SPIKA_ForgetPasswordManager.showDialogForNewPassword(
                
                    LANG.forget_password_secondstep_title,
                    LANG.forget_password_secondstep_text,
                    
                    function(tempPass,newPass){
                        
            			var errorMessage = U.validatePassword(newPass,newPass);
            			
            			if(!_.isEmpty(errorMessage)){
            				self.showAlert(errorMessage);
            				return;
            			}
                        
                        apiClient.resetPassword(tempPass,newPass,function(data){
                        
                            self.showAlert(LANG.forget_password_done);
                        
                        },function(data){
                            
                            var code = data.code;
                            
                            if(code == 1015){
                                
                                self.showAlert(LANG.forget_password_secondstep_failed_samepassword);
                                return;
                            }
                            
                            self.showAlert(LANG.forget_password_secondstep_failed);
                        
                        });
                    
                    },function(){
                    
                    
                    
                    });
                    
                return;
            }
            
            self.showAlert(LANG.login_failed);
            if(forceLogout)
                U.goPage('logout');
            
        });


    }
    
});
