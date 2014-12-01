var SPIKA_CallWindow = Backbone.View.extend({
    
    partnerUserId: 0,
    partnerSessionId : null,
    isCalling: false,
    windowEmlSelector: "#call_window",
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
			self.partnerUserId = options.userId;
			
			$$(self.windowEmlSelector).fadeIn();
			
			self.inisiateCalling();
			
        });
        
        SPIKA_VideoCallManager.callbackListener = this;
        
        SPIKA_VideoCallManager.onCallReceived(function(userData){
			
			U.l('call received');
			SPIKA_soundManager.playRinging();
			$$('#call_window .my_video_holder .avatar').hide();
			$$('#call_window .partner_video_holder .avatar').show();
			$$('#call_window .partner_video_holder video').remove();
			$$('#btn_call_close').hide();
			$$('#btn_call_accept').show();
			$$('#btn_call_decline').show();
			
			self.partnerUserId = userData.id;
			$$(self.windowEmlSelector).fadeIn();
	        
	        self.currentCallOptions = {
		        userId: self.partnerUserId,
		        useVideo: true,
		        useAudio: true
	        };
	       
	        self.loadAvatars();
	        
        },function(){
	       // call established
	       SPIKA_soundManager.stopRinging();
		   $$('#call_window .partner_video_holder .avatar').hide();

	    },function(message){
			
			// on finish
			SPIKA_AlertManager.show(LANG.call_finished_title,message);
			$$(self.windowEmlSelector).fadeOut();
			$$('#call_window .my_video_holder .avatar').show();
			SPIKA_soundManager.stopRinging();
			
        },function(message){
			
			// on error
			SPIKA_AlertManager.show(LANG.call_finished_title,message);
			$$(self.windowEmlSelector).fadeOut();
			$$('#call_window .my_video_holder .avatar').show();
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
		
        $$('#btn_call_close').click(function(){
            
            SPIKA_VideoCallManager.finishCalling();
            $$(self.windowEmlSelector).fadeOut();
            SPIKA_soundManager.stopRinging();
            SPIKA_soundManager.stopCalling();
            
        });
        
        $$('#btn_call_accept').click(function(){
            
            SPIKA_VideoCallManager.acceptCall();
			SPIKA_soundManager.stopRinging();
			
			$$('#btn_call_close').show();
			$$('#btn_call_accept').hide();
			$$('#btn_call_decline').hide();


        });
        
        $$('#btn_call_decline').click(function(){
            
            SPIKA_VideoCallManager.declineCall();
            $$(self.windowEmlSelector).fadeOut();
			SPIKA_soundManager.stopRinging();
			
			$$('#btn_call_close').show();
			$$('#btn_call_accept').hide();
			$$('#btn_call_decline').hide();

        });
        
    },
    
    inisiateCalling:function(){
	    
	    var self = this;
	    
		if(_.isUndefined(this.currentCallOptions.userId) || 
			_.isUndefined(this.currentCallOptions.useAudio) || 
			_.isUndefined(this.currentCallOptions.useVideo))
			
			return;
			
		$$('#call_window .my_video_holder .avatar').hide();			
		$$('#call_window .partner_video_holder .avatar').show();
		$$('#call_window .partner_video_holder video').remove();
		$$('#btn_call_close').show();
		$$('#btn_call_accept').hide();
		$$('#btn_call_decline').hide();

		this.loadAvatars();
		
		SPIKA_soundManager.playCalling();
		
		// make call
		SPIKA_VideoCallManager.startCalling(this.currentCallOptions.userId,
		
		function(stateDescription){
			
			// on state change
			U.l('on state change ' + stateDescription);

			
		},function(){
			// on established
			$$('#call_window .partner_video_holder .avatar').hide();
			SPIKA_soundManager.stopCalling();
			
		},function(message){
			// on finish or on declined

			SPIKA_AlertManager.show(LANG.call_finished_title,message);
			$$(self.windowEmlSelector).fadeOut();
			$$('#call_window .my_video_holder .avatar').show();
			SPIKA_soundManager.stopCalling();
			
		},function(message){
			// on error
			
			SPIKA_AlertManager.show(LANG.general_errortitle,message);
			$$(self.windowEmlSelector).fadeOut();
			$$('#call_window .my_video_holder .avatar').show();
			SPIKA_soundManager.stopCalling();
			
		})
		
		/*
	    // make call
	    SPIKA_VideoCallManager.initiateWebRTC(this.currentCallOptions.userId,
	    										this.currentCallOptions.useVideo,
	    										this.currentCallOptions.useAudio,
	    										function(){ 										
		    
		    U.l('connected to node');
		    
		    SPIKA_VideoCallManager.startLocalMedia(function(){
			    
			    U.l('video ready');
			    
			    $$('#call_window my_video_holder .avatar').hide();
			    
		    });
		    
	    });
		*/
	    
    },
    loadAvatars:function(){

		// prepare avatar
        var userData = SPIKA_UserManager.getUserDataFromCache(this.currentCallOptions.userId);
		var self = this;
		
		if(_.isEmpty(userData)){

	        apiClient.getUserById(this.currentCallOptions.userId,function(data){
				
	            var modelUser = userFactory.createModelByAPIResponse(data.user);

			    self.setPartnerAvatar(modelUser);
				self.setMyAvatar(SPIKA_UserManager.getUser());
				
	        },function(data){
	        
	        	U.l(data);
	        
	        });

		}else{

		    self.setPartnerAvatar(userData);
		    self.setMyAvatar(SPIKA_UserManager.getUser());

		}

    },
    setPartnerAvatar:function(userData){
	    
	    //AvatarManager.process($$('#call_window .partner_video_holder .avatar'),userData.get('image_thumb'));
        EncryptManager.decryptImage($$('#call_window .partner_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
	    
    },
    
    setMyAvatar:function(userData){

	    //AvatarManager.process($$('#call_window .my_video_holder .avatar'),userData.get('image_thumb'));
        EncryptManager.decryptImage($$('#call_window .my_video_holder .avatar'),userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
        
	    
    }
});
