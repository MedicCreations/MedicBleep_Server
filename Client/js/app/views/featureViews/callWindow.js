var SPIKA_CallWindow = Backbone.View.extend({
    
    partnerUserId: 0,
    partnerSessionId : null,
    isCalling: false,
    windowEmlSelector: "#call_window",
    windowEmlSelectorCalling: "#calling_window",
    currentCallOptions: null,
    initialize: function(options) {
	    
	    var self = this;
	    
        this.template = options.template;

        Backbone.on(EVENT_CALL_INITIATE, function(options) {
			
			if(_.isUndefined(options.userId) || 
				_.isUndefined(options.useAudio) || 
				_.isUndefined(options.useVideo))
				
				return;
			
			self.currentCallOptions = options;
			self.currentCallOptions.callerIsMe = true;
			self.partnerUserId = options.userId;
			
			self.inisiateCalling();
			
        });
        
        
        /*
        SPIKA_VideoCallManager.callReceived(
        
        function(stateDescription){
            
            $$(self.windowEmlSelectorCalling + " .statustext").text(stateDescription);

			$$('#call_window .my_video_holder .avatar').hide();
			$$('#call_window .partner_video_holder .avatar').hide();


        },function(userData){

    		$$('#btn_call_close').hide();
    		$$('#btn_call_accept').show();
    		$$('#btn_call_decline').show();
		
			// receive call
			self.partnerUserId = userData.id;

	        self.currentCallOptions = {
		        userId: self.partnerUserId,
		        useVideo: true,
		        useAudio: true
	        };
	        
        },function(){
            
            // P2P established
            
			SPIKA_soundManager.playRinging();
            self.loadAvatars();

        
	    },function(message){
			
			// on finish
			
			if(SPIKA_VideoCallManager.callState == CALLSTATE_CALLESTABLISHED)
			    SPIKA_AlertManager.show(LANG.call_finished_title,message);
			    
			$$(self.windowEmlSelector).fadeOut();
			$$(self.windowEmlSelectorCalling).fadeOut();
			
			SPIKA_soundManager.stopRinging();
			
        },function(message){
			
			// on error
			SPIKA_AlertManager.show(LANG.call_finished_title,message);
			$$(self.windowEmlSelector).fadeOut();
			SPIKA_soundManager.stopRinging();
			
        });
        */
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

        $$('#btn_tuggle_audio').click(function(){
            
            SPIKA_VideoCallManager.tuggleAudio();
            self.syncMediaStateWithButton();
            
        });
        

        $$('#btn_tuggle_video').click(function(){
            
            SPIKA_VideoCallManager.tuggleVideo();
            self.syncMediaStateWithButton();
            
        });
        
        		
        $$('#btn_call_close').click(function(){
            
            SPIKA_VideoCallManager.finishCalling();
            $$(self.windowEmlSelector).fadeOut();
            $$(self.windowEmlSelectorCalling).fadeOut();
            SPIKA_soundManager.stopRinging();
            SPIKA_soundManager.stopCalling();
            
        });
        
        $$('#btn_call_accept').click(function(){
            
            SPIKA_soundManager.stopRinging();
            SPIKA_VideoCallManager.acceptCall();
			
			
			$$('#btn_call_close').show();
			$$('#btn_call_accept').hide();
			$$('#btn_call_decline').hide();

			$$(self.windowEmlSelector).fadeIn();
			$$(self.windowEmlSelectorCalling).fadeOut();

        });
        
        $$('#btn_call_decline').click(function(){
            
            SPIKA_soundManager.stopRinging();
            SPIKA_VideoCallManager.finishCalling();
            
            $$(self.windowEmlSelector).fadeOut();
            $$(self.windowEmlSelectorCalling).fadeOut();

        });

		SPIKA_VideoCallManager.callReceived(function(callerUserId){
		    // on receive
            
			$$('#btn_call_close').hide();
			$$('#btn_call_accept').show();
			$$('#btn_call_decline').show();


            $$(self.windowEmlSelector).hide();
            $$(self.windowEmlSelectorCalling).hide();


            self.currentCallOptions = {
                userId: callerUserId,
                useAudio: true,
                useVideo: true
            };
            
            self.loadAvatars();
            

		},function(isError,errorMessage){
		    
		    // on error
		    
		    if(isError)
			    SPIKA_AlertManager.show(LANG.general_errortitle,errorMessage);
			
            $$(self.windowEmlSelector).fadeOut();
            $$(self.windowEmlSelectorCalling).fadeOut();
            
            SPIKA_soundManager.stopRinging();
            
		},function(stateDescription){
		    
		    // on statuschanged
		    U.l(stateDescription);
		    $$(self.windowEmlSelectorCalling + " .statustext").text(stateDescription);
		    
		},function(){
    		
    		// on established
    		SPIKA_soundManager.playRinging();
    		$$(self.windowEmlSelectorCalling).fadeIn();
    		
		},function(){
            
            // on accepted
            self.syncMediaStateWithButton();
    		
		});


    },
    
    inisiateCalling:function(){
	    
	    var self = this;
	    
	    if(!SPIKA_VideoCallManager.canUseWebRTC()){
	        SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_nowebrtc);
	        return;
        }
        
		if(_.isUndefined(this.currentCallOptions.userId) || 
			_.isUndefined(this.currentCallOptions.useAudio) || 
			_.isUndefined(this.currentCallOptions.useVideo))
			
			return;
            
		$$('#btn_call_close').show();
		$$('#btn_call_accept').hide();
		$$('#btn_call_decline').hide();


        $$(self.windowEmlSelector).hide();
        $$(self.windowEmlSelectorCalling).fadeIn();

        this.loadAvatars();
        SPIKA_soundManager.playCalling();
        
		SPIKA_VideoCallManager.startCalling(this.currentCallOptions.userId,function(isError,message){
		    
		    // on error
		    if(isError)
			    SPIKA_AlertManager.show(LANG.general_errortitle,message);
			
            _.debounce(function() {
              
                $$(self.windowEmlSelector).fadeOut();
                $$(self.windowEmlSelectorCalling).fadeOut();
                
            }, 500)();
            
            SPIKA_soundManager.stopCalling();

            
		},function(stateDescription){
		    
		    // on statuschanged
		    $$(self.windowEmlSelectorCalling + " .statustext").text(stateDescription);
		    
		},function(){
    		
    		// on established
    		
		},function(){
    		
    		// on accept
            SPIKA_soundManager.stopCalling();
            
            // on accepted
            self.syncMediaStateWithButton();

			$$('#btn_call_close').show();
			$$('#btn_call_accept').hide();
			$$('#btn_call_decline').hide();

			$$(self.windowEmlSelector).fadeIn();
			$$(self.windowEmlSelectorCalling).fadeOut();
    		
		});

        
	    /*
	    var self = this;
	    
		if(_.isUndefined(this.currentCallOptions.userId) || 
			_.isUndefined(this.currentCallOptions.useAudio) || 
			_.isUndefined(this.currentCallOptions.useVideo))
			
			return;
        
		$$('#btn_call_close').show();
		$$('#btn_call_accept').hide();
		$$('#btn_call_decline').hide();


		this.loadAvatars();
		
		SPIKA_soundManager.playCalling();
		
		// make call
		SPIKA_VideoCallManager.startCalling(this.currentCallOptions.userId,
		
		function(stateDescription){
			
            $$(self.windowEmlSelectorCalling + " .statustext").text(stateDescription);
			
		},function(){
			
			$$('#call_window .my_video_holder .avatar').hide();
			$$('#call_window .partner_video_holder .avatar').hide();

		},function(){
			// on accepted

			SPIKA_soundManager.stopCalling();
			
			$$(self.windowEmlSelector).fadeIn();
			$$(self.windowEmlSelectorCalling).fadeOut();
			
			
			SPIKA_VideoCallManager.unmuteAudio();
			
		},function(message){
			// on finish or on declined

			SPIKA_AlertManager.show(LANG.call_finished_title,message);
			
			$$(self.windowEmlSelector).fadeOut();
			$$(self.windowEmlSelectorCalling).fadeOut();
			
            SPIKA_soundManager.stopCalling();
            
		},function(message){
			// on error
			
			SPIKA_AlertManager.show(LANG.general_errortitle,message);
			
            _.debounce(function() {
    			$$(self.windowEmlSelector).fadeOut();
    			$$(self.windowEmlSelectorCalling).fadeOut();
                SPIKA_soundManager.stopCalling();
            }, 1000)();
			
            SPIKA_soundManager.stopCalling();
		})
		
		*/
		
	    
    },
    loadAvatars:function(){
                
		// prepare avatar
        var userData = SPIKA_UserManager.getUserDataFromCache(this.currentCallOptions.userId);
		var self = this;
		
		if(_.isEmpty(userData)){

	        apiClient.getUserById(this.currentCallOptions.userId,function(data){
				
	            userData = userFactory.createModelByAPIResponse(data.user);

			    self.setPartnerAvatar(userData);
				self.setMyAvatar(SPIKA_UserManager.getUser());

        		if(self.currentCallOptions.callerIsMe){
            		AvatarManager.process($$('#calling_window .info_from img'),SPIKA_UserManager.getUser().get('image_thumb'));  		
            		AvatarManager.process($$('#calling_window .info_to img'),userData.get('image_thumb'));  
            		
                    $$('#calling_window .info_from span').text(SPIKA_UserManager.getUser().get('firstname') + " " + SPIKA_UserManager.getUser().get('lastname'));
                    $$('#calling_window .info_to span').text(userData.get('firstname') + " " + userData.get('lastname'));
        		}else{
            		AvatarManager.process($$('#calling_window .info_to img'),SPIKA_UserManager.getUser().get('image_thumb'));  	
            		AvatarManager.process($$('#calling_window .info_from img'),userData.get('image_thumb')); 		

                    $$('#calling_window .info_to span').text(SPIKA_UserManager.getUser().get('firstname') + " " + SPIKA_UserManager.getUser().get('lastname'));
                    $$('#calling_window .info_from span').text(userData.get('firstname') + " " + userData.get('lastname'));
        		}
    		
                if(SPIKA_VideoCallManager.isCalling())
                    $$(self.windowEmlSelectorCalling).show();
                
	        },function(data){
	        
	        	U.l(data);
	        
	        });

		}else{

		    self.setPartnerAvatar(userData);
		    self.setMyAvatar(SPIKA_UserManager.getUser());
		    
    		if(self.currentCallOptions.callerIsMe){
        		AvatarManager.process($$('#calling_window .info_from img'),SPIKA_UserManager.getUser().get('image_thumb'));  		
        		AvatarManager.process($$('#calling_window .info_to img'),userData.get('image_thumb'));  
        		
                $$('#calling_window .info_from span').text(SPIKA_UserManager.getUser().get('firstname') + " " + SPIKA_UserManager.getUser().get('lastname'));
                $$('#calling_window .info_to span').text(userData.get('firstname') + " " + userData.get('lastname'));
    		}else{
        		AvatarManager.process($$('#calling_window .info_to img'),SPIKA_UserManager.getUser().get('image_thumb'));  	
        		AvatarManager.process($$('#calling_window .info_from img'),userData.get('image_thumb')); 		

                $$('#calling_window .info_to span').text(SPIKA_UserManager.getUser().get('firstname') + " " + SPIKA_UserManager.getUser().get('lastname'));
                $$('#calling_window .info_from span').text(userData.get('firstname') + " " + userData.get('lastname'));
    		}
    		
    		if(SPIKA_VideoCallManager.isCalling())
    		    $$(self.windowEmlSelectorCalling).show();

		}

    },
    setPartnerAvatar:function(userData){
	    
        EncryptManager.decryptImage($$('#calling_window .partner_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
	    
    },
    
    setMyAvatar:function(userData){

        EncryptManager.decryptImage($$('#call_window .my_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
        
	    
    },
    
    syncMediaStateWithButton:function(){

        if(SPIKA_VideoCallManager.videoActivated){
             $$('#btn_tuggle_video').text(LANG.mutevideo);
        }else{
             $$('#btn_tuggle_video').text(LANG.unmutevideo);
        }            
        
        if(SPIKA_VideoCallManager.audioActivated){
            $$('#btn_tuggle_audio').text(LANG.muteaudio);
        }else{
            $$('#btn_tuggle_audio').text(LANG.unmuteaudio);
        }
            
    }

});
