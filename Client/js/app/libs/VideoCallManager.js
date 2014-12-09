var CALLSTATE_NOTWORKING = -1;
var CALLSTATE_IDLE = 0;
var CALLSTATE_CALLING = 1;
var CALLSTATE_CALLESTABLISHED = 2;
var CALLSTATE_P2PESTABLISHING = 3;
var CALLSTATE_P2PESTABLISHED = 4;
var CALLSTATE_CALLOFFERRECEIVED = 5;
var CALLSTATE_CALLESTABLISHED = 6;


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
    callState:CALLSTATE_IDLE, // -1: not working 0 : nothing, 1: calling, 2: call established, 3: video stream established, 4: calloffer received
    roomName:"",
    currentPeerId:0,
    onLocalMediaReady: null,
    onLocalMediaError: null,
    onConnectionReady: null,
    onStateChanged: null,
    onEstablishedReceiver: null,
    onEstablishedCaller: null,
    onAccepted: null,
    onFinish: null,
    onError: null,
    onCallReceived: null,
    isCalling:false,
    audioActivated: true,
    videoActivated: true,
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
                video: true,
                audio: true
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
				
				U.l('disconnected');

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

                if(!_.isUndefined(self.onStateChanged) && _.isFunction(self.onStateChanged))
                    self.onStateChanged("Joined to user room " + roomName);


            });
            
            this.webRTC.on('localStream', function (stream) {
				
            });

            this.webRTC.on('localScreenStopped', function (stream) {
                U.l('localScreenStopped');
            });

            
            this.webRTC.connection.on('message', function (message) {
                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
                
                if(commandType == 'callAnswer'){
                                         
                    if(self.callState != CALLSTATE_P2PESTABLISHED)
                        return;
                        
                    self.callState = CALLSTATE_CALLESTABLISHED;
                    
                    self.unmuteAudio();
                    
	                if(!_.isNull(self.onAccepted))
	                	self.onAccepted();
    
                }
                
                if(commandType == 'callDecline'){

	                if(!_.isNull(self.onFinish))
	                	self.onFinish(LANG.call_error_userdeclined);

                    self.finishCalling();
                    
                }
                
                if(commandType == 'callEnd'){
                    
                    U.l("callEnd");

                    self.finishCalling();

	                if(!_.isNull(self.onFinish))
	                	self.onFinish(LANG.call_finished);
		                	
                }
            
                if(commandType == 'callOffer'){
                    
                    if(!_.isUndefined(self.onStateChanged) && _.isFunction(self.onStateChanged))
                        self.onStateChanged("Call request received.");
                    
                    if(self.callState != CALLSTATE_IDLE)
                        return;
                    
                    self.isCalling = false;

                    self.currentPartnerSessionId = message.from;

                    if(!_.isEmpty(message.payload.user.user_id)){
                        self.currentPartnerUserId = message.payload.user.user_id;
                    }
                    
                    if(!_.isEmpty(message.payload.user.id)){
                        self.currentPartnerUserId = message.payload.user.id;
                    }
                    
                    if(!_.isEmpty(self.currentPartnerSessionId) && !_.isEmpty(self.currentPartnerUserId)){
						
						self.callState = CALLSTATE_P2PESTABLISHING;
						
    	                if(!_.isNull(self.onCallReceived))
    	                	self.onCallReceived(message.payload.user);

                        self.startLocalMedia(function(){
                        });
                        
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
	                            
	                            U.l(self.callState);
	                            
	                            if(self.callState != CALLSTATE_P2PESTABLISHED){
	                            
		                            self.callState = CALLSTATE_P2PESTABLISHED;
		                            self.currentPeerId = peer.id;
		                            
					                if(!_.isNull(self.onEstablishedCaller)){
					                    
					                    if(self.isCalling && !_.isNull(self.onEstablishedCaller))
					                	    self.onEstablishedCaller(peer.id);

                                        if(!_.isUndefined(self.onStateChanged) && _.isFunction(self.onStateChanged))
                                            self.onStateChanged("P2P connection is established. Calling user.");
                                            
                                    }
                                    
					                if(!self.isCalling && !_.isNull(self.onEstablishedReceiver))
					                	self.onEstablishedReceiver(peer.id);
					               
					                self.muteAudio();
					                
	                            }
	                            
	                            break;
	                        }
	                        case 'disconnected':
	                            U.l('webrtc con disconnected'); 
	                            break;
	                        case 'failed':
	                        	U.l('webrtc con failed'); 
	                        	if(self.callState != 0)
	                            	self.error(LANG.call_error_rtc_failed);
	                            	
	                            break;
	                        case 'closed':
	                            U.l('webrtc con closed'); 
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
    startCalling:function(userId,onStateChanged,onEstablished,onAccepted,onFinish,onError){
        
        if(this.callState != 0)
            return;
            
        var self = this;
        
        self.isCalling = true;
        
        self.mySessionId = self.webRTC.connection.socket.sessionid;
		self.onStateChanged = onStateChanged;
		self.onEstablishedCaller = onEstablished;
		self.onAccepted = onAccepted;
		self.onFinish = onFinish;
		self.onError = onError;
		self.currentPartnerUserId = userId;
        
        if(_.isEmpty(self.mySessionId) || self.mySessionId == 0){
            self.error(LANG.call_error_noconnection);
            return;
        }
        
        if(!_.isUndefined(self.onStateChanged))
            self.onStateChanged("Initializing devices...");

        this.startLocalMedia(function(){
			
			if(self.callState != CALLSTATE_IDLE)
				return;
			
			self.callState = CALLSTATE_CALLING;
			
            if(!_.isUndefined(self.onStateChanged))
                self.onStateChanged("Getting user information...");
            
	        self.webRTC.connection.emit('room', userId, function (err, room) {
	            
	            
                if(!_.isUndefined(self.onStateChanged))
                    self.onStateChanged("User information fetched...");
                    
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
	                
                    if(!_.isUndefined(self.onStateChanged))
                        self.onStateChanged("User session id is " + self.currentPartnerSessionId);


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
	                    
	                    U.l("response got");
	                    
	                    if (err) {
	                        
	                        self.error(LANG.call_error_general);
	                        
	                        
	                    } else {
	                        
	                        U.l("joining the room");
	                        self.webRTC.joinRoom(self.currentPartnerUserId);
	                        U.l(result);
	                        
	                    }
	                });
	                
	                self.callState = CALLSTATE_P2PESTABLISHING;
	                self.webRTC.joinRoom(self.currentPartnerUserId);
	
	            }
	        });
	
	        
        },function(){
	        
	        // local media error
	        self.error(LANG.call_localmedia_error);
	        
        });
        
    },
    callReceived:function(onStateChanged,onCallReceived,onEstablished,onFinish,onError){
	    
	   var self = this;
	   self.onStateChanged = onStateChanged;
	   self.onCallReceived = onCallReceived;
	   self.onEstablishedReceiver = onEstablished;
	   self.onFinish = onFinish;
	   self.onError = onError;
	    
    },
    error:function(message){
        
        U.l("on error " + message);
        
        this.callState = CALLSTATE_IDLE;
        
        var self = this;
        
        this.webRTC.leaveRoom();
        this.stopLocalMedia();

        
        if(!_.isUndefined(self.onError))
            self.onError(message)
		
    },

    finishCalling:function(){
        
        if(this.callState == CALLSTATE_IDLE)
            return;
        
        this.callState = CALLSTATE_IDLE;
        
        this.webRTC.leaveRoom();
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
        
        if(this.callState != CALLSTATE_P2PESTABLISHED)
            return;
        
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


    },
    
    muteAudio: function(){
        
        this.audioActivated = false;
        this.webRTC.mute();
        
    },
    unmuteAudio: function(){
        
        this.audioActivated = true;
        this.webRTC.unmute();
        
    },
    tuggleAudio: function(){
        
        if(this.audioActivated)
            this.muteAudio();
        else
            this.unmuteAudio();
        
        return this.audioActivated;
    },
    
    muteVideo: function(){
        
        this.videoActivated = false;
        this.webRTC.pauseVideo();
        
    },
    unmuteVideo: function(){
        
        this.videoActivated = true;
        this.webRTC.resumeVideo();
        
    },
    tuggleVideo: function(){
        
        if(this.videoActivated)
            this.muteVideo();
        else
            this.unmuteVideo();
        
        return this.videoActivated;
    }


    
}