SPIKA_VideoCallManager = {
    
    /* Listners
        localStreamReady(stream)
    */
    
    callbackListener: null,
    webRTC:null,
    userId:0,
    currentPartnerSessionId:0,
    currentPartnerUserId:0,
    mySessionId:0,
    callState:0, // -1: not working 0 : nothing, 1: calling, 2: call established, 3: video stream established, 4: calloffer received
    roomName:"",
    currentPeerId:0,
    onLocalMediaReady: null,
    onLocalMediaError: null,
    onConnectionReady: null,
    onStateChanged: null,
    onEstablished: null,
    onFinish: null,
    onError: null,
    onCallReceived: null,
    init:function(userId){
         
        var self = this;
        this.userId = userId;
		
		// by default initialte WebRTC with video and audio
		this.initiateWebRTC(userId,true,true,function(){
			
            // after connected to nodejs
            self.roomName = userId;
            self.webRTC.joinRoom(self.userId);
            window.webRTC = self.webRTC;
			
		});
		
    },
    initiateWebRTC:function(roomName,useCamera,useMicrophone,onConnectionReady){
		
		var  self = this;
		
		self.onConnectionReady = null;
		if(!_.isUndefined(onConnectionReady))
			self.onConnectionReady = onConnectionReady;
			
		if(!_.isNull(this.webRTC)){
			this.webRTC.disconnect();
		}
		
        var stun = {
            'url':WEBRTC_STUN
        };
        
        var turn = {
            'url': WEBRTC_TURN,
            'username': WEBRTC_TURN_USER,
            'credential': WEBRTC_TURN_PASSWORD
        };
        
	    var configOptions = {
            peerConnectionConfig: { 'iceServers': [stun, turn] },
            url:WEBRTC_SIGNALING,
            // the id/element dom element that will hold "our" video
            localVideoEl: 'localvideo',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'remotevideo_holder',
            // immediately ask for camera access
            autoRequestMedia: false,
            debug: false,
            detectSpeakingEvents: true,
            autoAdjustMic: false,
            peerVolumeWhenSpeaking: 0.25,
            media: {
                video: useCamera,
                audio: useMicrophone
            },
            localVideo: {
                autoplay: true,
                mirror: true,
                muted: true
            }
        };
        
        try{

            // create our webrtc connection
            this.webRTC = new SimpleWebRTC(configOptions);
               
            // callbacks
            
            this.webRTC.on('connectionReady', function () {

                if(!_.isNull(self.onLocalMediaReady))
                	self.onConnectionReady();
                	
                self.onConnectionReady();

            });

            this.webRTC.on('disconnected', function () {
				

            });
            

            this.webRTC.on('localMediaError', function () {
				

                if(!_.isNull(self.onLocalMediaError))
                	self.onLocalMediaError();
                	
                self.onLocalMediaError();

            });

            this.webRTC.on('readyToCall', function () {
                
                // connecting to the server happens only once for initialization so this is called only when local media is ready
                if(!_.isNull(self.onLocalMediaReady))
                	self.onLocalMediaReady();
                	
                self.onLocalMediaReady();

            });
            
            this.webRTC.on('joinedRoom', function (roomName) {
				
            });
            
            this.webRTC.on('localStream', function (stream) {
				
            });
    
            
            this.webRTC.connection.on('message', function (message) {
                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
                
                if(commandType == 'callAnswer'){
                    
                     U.l(self.callState);
                     
                    if(self.callState != 1)
                        return;
                        
                     U.l(self.currentPartnerUserId);
                    
                    self.webRTC.joinRoom(self.currentPartnerUserId);
    
                }
                
                if(commandType == 'callDecline'){
					
                    if(self.callState != 1)
                        return;
    
                    self.callState = 0;
    
                    self.finishCalling();

	                if(!_.isNull(self.onFinish))
	                	self.onFinish(LANG.call_error_userdeclined);
                    
                }
                
                if(commandType == 'callEnd'){
    
                    self.finishCalling();

	                if(!_.isNull(self.onFinish))
	                	self.onFinish(LANG.call_finished);
		                	
                }
            
                if(commandType == 'callOffer'){
					
                    if(self.callState != 0)
                        return;
                    
                    self.currentPartnerSessionId = message.from;

                    if(!_.isEmpty(message.payload.user.user_id)){
                        self.currentPartnerUserId = message.payload.user.user_id;
                    }
                    
                    if(!_.isEmpty(message.payload.user.id)){
                        self.currentPartnerUserId = message.payload.user.id;
                    }
                    
                    if(!_.isEmpty(self.currentPartnerSessionId) && !_.isEmpty(self.currentPartnerUserId)){
						
						self.callState = 4;
						
		                if(!_.isNull(self.onCallReceived))
		                	self.onCallReceived(message.payload.user);
                	
                        
                    }
                    
                }

            });
            
            // a peer video has been added
            this.webRTC.on('videoAdded', function (video, peer) {
                
                // show the ice connection state
                if (peer && peer.pc) {
                    
                    peer.pc.on('iceConnectionStateChange', function (event) {
                    
                        switch (peer.pc.iceConnectionState) {
	                        case 'checking':
	                            U.l('webrtc con checking'); 
	                            break;
	                        case 'connected':
	                            U.l('webrtc con connected'); 
	                        case 'completed':{
	                            U.l('webrtc con completed'); 
	                            
	                            if(self.callState != 3){
		                            self.callState = 3;
		                            self.currentPeerId = peer.id;
		                            
		                            
					                if(!_.isNull(self.onEstablished))
					                	self.onEstablished(peer.id);
	                            }
	                            
	                            break;
	                        }
	                        case 'disconnected':
	                            break;
	                        case 'failed':
	                        	
	                        	if(self.callState != 0)
	                            	self.error(LANG.call_error_rtc_failed);
	                            	
	                            break;
	                        case 'closed':
	                            break;
                        }
                        
                    });
                    
                }
                    
            });
            
            // a peer was removed
            this.webRTC.on('videoRemoved', function (video, peer) {
                //self.finishCalling();
            });
            
            
        } catch(ex) {
            
			U.l("failed to initialize webrtc");
            U.l(ex);
            this.callState = -1;
            
        }

 
	    
    },
    canUseWebRTC:function(){
        
        return !_.isEmpty(this.webRTC);
          
    },
    startLocalMedia:function(onLocalMediaReady,onLocalMediaError){
        
        this.onLocalMediaReady = onLocalMediaReady;
        this.onLocalMediaError = onLocalMediaError;
        this.webRTC.startLocalVideo();
        
    },
    stopLocalMedia:function(){
        
        this.webRTC.stopLocalVideo();
        
    },
    startCalling:function(userId,onStateChanged,onEstablished,onFinish,onError){
        
        if(this.callState != 0)
            return;
            
        var self = this;
        self.mySessionId = self.webRTC.connection.socket.sessionid;
		self.onStateChanged = onStateChanged;
		self.onEstablished = onEstablished;
		self.onFinish = onFinish;
		self.onError = onError;
		self.currentPartnerUserId = userId;
        
        
        if(_.isEmpty(self.mySessionId) || self.mySessionId == 0){
            self.error(LANG.call_error_noconnection);
            return;
        }

        this.startLocalMedia(function(){
			
			if(self.callState != 0)
				return;
			
			self.callState = 1;
			
	        self.webRTC.connection.emit('room', userId, function (err, room) {
	            
	            if (err) {
	
	                self.error(LANG.call_error_general);
	                
	            } else {
	
	                var clients = room.clients;

	                if(_.isNull(clients)){
	                    self.error(LANG.call_error_general);
	                    return;
	                }
	                
	                var keys = _.keys(clients);
	
	                if(keys.length == 0){
	                    self.error(LANG.call_error_usernotonline);
	                    return;
	                }
	
	                self.currentPartnerSessionId = keys[0];
	                
	                var payload = {
	                    to: self.currentPartnerSessionId,
	                    from: self.webRTC.connection.socket.sessionid,
	                    type : 'callOffer',
	                    payload : {
	                        user: SPIKA_UserManager.getUser().get('originalData')
	                    }
	                };
	                
	                // make call request
	                self.webRTC.connection.emit('message', payload, function (err, result) {
	                    
	                    if (err) {
	                        
	                        self.error(LANG.call_error_general);
	                        
	                    } else {
	                        
	                        U.l(result);
	                        
	                    }
	                });
	
	            }
	        });
	
	        
        },function(){
	        
	        // local media error
	        self.error(LANG.call_localmedia_error);
	        
        });
        
    },
    onCallReceived:function(onCallReceived,onEstablished,onFinish,onError){
	    
	   var self = this;
	   self.onCallReceived = onCallReceived;
	   self.onEstablished = onEstablished;
	   self.onFinish = onFinish;
	   self.onError = onError;
	    
    },
    error:function(message){
        
        U.l("on error " + message);
        
        this.callState = 0;
        
        var self = this;
        this.stopLocalMedia();
        
        if(!_.isUndefined(self.onError))
            self.onError(message)
		
    },

    finishCalling:function(){
        
        if(this.callState == 0)
            return;
        
        this.callState = 0;
        this.stopLocalMedia();
		
        var self = this;

        var payload = {
            to: self.currentPartnerSessionId,
            from: self.mySessionId,
            type : 'callEnd',
            payload : {
                user: SPIKA_UserManager.getUser().get('originalData')
            }
        };
        
        // make call request
        self.webRTC.connection.emit('message', payload, function (err, result) {
            
            if (err) {
                
                self.error(LANG.call_error_general);
                
            } else {
                
                U.l(result);
                
            }

        });
		
		
		this.webRTC.joinRoom(this.userId);
		
    },
    declineCall:function(){
        
        var self = this;
        
        if(this.callState != 4)
            return;
            
        this.callState = 0;
        
        var payload = {
            to: this.currentPartnerSessionId,
            from: this.mySessionId,
            type : 'callDecline',
            payload : {
                user: SPIKA_UserManager.getUser().get('originalData')
            }
        };
        
        // make call request
        self.webRTC.connection.emit('message', payload, function (err, result) {
            
            if (err) {
                
                self.error(LANG.call_error_general);
                
            } else {
                
                U.l(result);
                
            }
        });


    },

    acceptCall:function(){
        
        var self = this;
        
        if(this.callState != 4)
            return;
        
        this.startLocalMedia(function(){

	        var payload = {
	            to: this.currentPartnerSessionId,
	            from: this.mySessionId,
	            type : 'callAnswer',
	            payload : {
	                user: SPIKA_UserManager.getUser().get('originalData')
	            }
	        };
	        
	        // make call request
	        self.webRTC.connection.emit('message', payload, function (err, result) {
	            
	            if (err) {
	                
	                self.error(LANG.call_error_general);
	                
	            } else {
	                
	                // do nothing because who received a call is already in the room
	                
	            }
	            
	        });


	    },function(){
		    
		    // send call finished signal to user
		    self.finishCalling();
		    
	        // local media error
	        self.error(LANG.call_localmedia_error);
		    
	    });


    }

    
}