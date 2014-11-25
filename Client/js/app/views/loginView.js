var SPIKA_LoginView = Backbone.View.extend({

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
			
	        apiClient.login(username,password,function(data){
	            

                var stun = {
                    'url': 'stun:54.176.174.246:3478'
                };
                
                var turn = {
                    'url': 'turn:54.176.174.246:3478',
                    'username': 'turn',
                    'credential': 'turn'
                };
        
        
                // create our webrtc connection
                window.webRTC = new SimpleWebRTC({
                    peerConnectionConfig: { 'iceServers': [stun, turn] },
                    url:'http://54.176.174.246:32400',
                    // the id/element dom element that will hold "our" video
                    localVideoEl: 'webrtcVideoMine',
                    // the id/element dom element that will hold remote videos
                    remoteVideosEl: 'webrtcVideoPartner',
                    // immediately ask for camera access
                    autoRequestMedia: false,
                    debug: false,
                    detectSpeakingEvents: true,
                    autoAdjustMic: false
                });
                
                window.webRTC.joinRoom(data.user_id);


	            apiClient.getUserById(data.user_id,function(data){
	                
	                SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
	                SPIKA_notificationManger.attachUser(data.user.id);
	                AvatarManager.init();
	                
	                U.goPage("main");
	                
	            },function(data){
	                
	                self.showAlert(LANG.login_failed);
	                
	            });
	
	            
	        },function(data){
	            
	            self.showAlert(LANG.login_failed);
	            
	        });
        
	        return this;
	        
        }else{

	        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
	        
	        var self = this;
	        
	        _.debounce(function() {
	            self.onload();
	        }, 100)();
	              
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

        apiClient.login(username,password,function(data){
            
            apiClient.getUserById(data.user_id,function(data){
                
                SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                SPIKA_notificationManger.attachUser(data.user.id);
                AvatarManager.init();
                
                U.goPage("main");
                
            },function(data){
                
                self.showAlert(LANG.login_failed);
                
            });

            
        },function(data){
            
            self.showAlert(LANG.login_failed);
            
        });
    
    }
    
});
