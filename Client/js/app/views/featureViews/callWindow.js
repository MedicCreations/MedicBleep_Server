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
            
            if(SPIKA_VideoCallManager.tuggleAudio()){
                $(this).text(LANG.muteaudio);
            }else{
                $(this).text(LANG.unmuteaudio);
            }
            
        });
        

        $$('#btn_tuggle_video').click(function(){
            
            if(SPIKA_VideoCallManager.tuggleVideo()){
                $(this).text(LANG.mutevideo);
            }else{
                $(this).text(LANG.unmutevideo);
            }
            
        });
        
        		
        $$('#btn_call_close').click(function(){
            
            SPIKA_VideoCallManager.finishCalling();
            $$(self.windowEmlSelector).fadeOut();
            $$(self.windowEmlSelectorCalling).fadeOut();
            SPIKA_soundManager.stopRinging();
            SPIKA_soundManager.stopCalling();
            
        });
        
        $$('#btn_call_accept').click(function(){
            
            SPIKA_VideoCallManager.acceptCall();
			SPIKA_soundManager.stopRinging();
			
			$$('#btn_call_close').show();
			$$('#btn_call_accept').hide();
			$$('#btn_call_decline').hide();

			$$(self.windowEmlSelector).fadeIn();
			$$(self.windowEmlSelectorCalling).fadeOut();

        });
        
        $$('#btn_call_decline').click(function(){
            
            SPIKA_VideoCallManager.declineCall();
            
            SPIKA_VideoCallManager.finishCalling();
            $$(self.windowEmlSelector).fadeOut();
            $$(self.windowEmlSelectorCalling).fadeOut();
            
            SPIKA_soundManager.stopRinging();


        });
        
    },
    
    inisiateCalling:function(){
	    
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
            		AvatarManager.process($$('#calling_window .info_to img'),userData.get('image_thumb'));  		
            		AvatarManager.process($$('#calling_window .info_from img'),SPIKA_UserManager.getUser().get('image_thumb'));  		

                    $$('#calling_window .info_to span').text(SPIKA_UserManager.getUser().get('firstname') + " " + SPIKA_UserManager.getUser().get('lastname'));
                    $$('#calling_window .info_from span').text(userData.get('firstname') + " " + userData.get('lastname'));
        		}
    		
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
    		}else{
        		AvatarManager.process($$('#calling_window .info_to img'),userData.get('image_thumb'));  		
        		AvatarManager.process($$('#calling_window .info_from img'),SPIKA_UserManager.getUser().get('image_thumb'));  		
    		}
            
            $$(self.windowEmlSelectorCalling).show();

		}
		

    },
    setPartnerAvatar:function(userData){
	    
        EncryptManager.decryptImage($$('#calling_window .partner_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
	    
    },
    
    setMyAvatar:function(userData){

        EncryptManager.decryptImage($$('#call_window .my_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
        
	    
    }
});
