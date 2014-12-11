var IDLE = 0;

var CALLERSTATE_IDLE = 1;
var CALLERSTATE_ESTABLISHINGCONNECTION = 2;
var CALLERSTATE_CONNECTIONESTSBLISHED = 3;
var CALLERSTATE_CALLESTABLISHED = 4;

var RECEIVERSTATE_CALLRECEIVED = 10;
var RECEIVERSTATE_ESTABLISHINGCONNECTION = 11;
var RECEIVERSTATE_CONNECTIONESTSBLISHED = 12;
var RECEIVERSTATE_CALLESTABLISHED = 14;


SPIKA_VideoCallManager = {
    
    /* Listners
        localStreamReady(stream)
    */
    webRTC:null,
    
    // caller callbacks
    onP2PEstablishedCaller:null,
    onAcceptedCaller:null,
    onStateChangedCaller:null,
    callTargetUserId:0,
    callTargetSessionId:'',
    
    // receiver callbacks
    onCallReceived:null,
    onStateChangedReceiver:null,
    onP2PEstablishedReceiver:null,
    onAcceptedReceiver:null,
    onMediaReadyReceiver:null,

    callerFromUserId:null,

    // general callbacks
    onFinish:null,
    onMediaStateChanged:null,

    connecionState: IDLE, 
    isConnected:false,
    callbackListener: null,
    audioActivated: false,
    videoActivated: false,
    initialAudioState: false,
    initialVideoState: false,
    init:function(userId){
         
        var self = this;
        this.userId = userId;
		
		// by default initialte WebRTC with video and audio
		this.initiateWebRTC(userId,true,true,function(){

            window.webRTC = self.webRTC;
			
		});
		
    },
    initiateWebRTC:function(roomName,useCamera,useMicrophone,onConnectionReady){
		
        var  self = this;
        	
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
            detectSpeakingEvents: false,
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
                  
            this.webRTC.on('connectionReady', function () {
                self.isConnected = true;
                U.l('connection ready');
                self.joinRoom(SPIKA_UserManager.getUser().get('id'));
            });


            this.webRTC.on('localMediaError', function () {
                self.callback(self.onFinish,true,"Failed to initialize local devices.");
                self.finishCalling();
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
	                            self.allMute();
	                            
	                        case 'completed':{
                                
                                U.l('webrtc con completed'); 
                                
                                // caller
                                if(self.isCalling() && self.connecionState == CALLERSTATE_ESTABLISHINGCONNECTION){
                                    
                                    self.callback(self.onStateChangedCaller,"Connection Established...");
                                    self.callback(self.onP2PEstablishedCaller);
                                    
                                    self.connecionState = CALLERSTATE_CONNECTIONESTSBLISHED;

                                }
                                
                                // reciver
                                if(!self.isCalling() && self.connecionState == RECEIVERSTATE_CALLRECEIVED || self.connecionState == RECEIVERSTATE_ESTABLISHINGCONNECTION){
                                    
                                    //self.setInitiateMediaState();

                                    self.callback(self.onStateChangedReceiver,"Connection Established...");
                                    self.callback(self.onP2PEstablishedReceiver);
                                    
                                    self.connecionState = RECEIVERSTATE_CONNECTIONESTSBLISHED;
                                    
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

            this.webRTC.on('localStream', function (stream) {
                
                
                U.l('local stream');
                
                self.callback(self.onStateChangedCaller,"Establishing Connection...");
                
                // caller
                if(self.isCalling() && self.connecionState == CALLERSTATE_ESTABLISHINGCONNECTION){
                    
                    // send call offer
        	        self.webRTC.connection.emit('room', self.callTargetUserId, function (err, room) {
        	                    	            
                        self.callback(self.onStateChanged,"User information fetched...");
                            
        	            if (err) {
                            
                            self.callback(self.onFinish,true,LANG.call_error_general);
        	                self.finishCalling();
        	                
        	            } else {
        	
        	                var clients = room.clients;
                            
        	                if(_.isNull(clients)){
        	                    self.callback(self.onFinish,true,LANG.call_error_general);
        	                    self.finishCalling();
        	                    return;
        	                }
        	                
        	                var keys = _.keys(clients);
        	
        	                if(keys.length == 0){
        	                    self.callback(self.onFinish,true,LANG.call_error_usernotonline);
        	                    self.finishCalling();
        	                    return;
        	                }
                            
        	                self.callTargetSessionId = keys[0];
        	                	                
        	                self.callback(self.onStateChanged,"User session id is " + self.currentPartnerSessionId);
        
        	                var payload = {
        	                    to: self.callTargetSessionId,
        	                    from: self.webRTC.connection.socket.sessionid,
        	                    type : 'callOffer',
        	                    payload : {
        	                        user: SPIKA_UserManager.getUser().get('originalData')
        	                    }
        	                };

        	                // make call request
        	                self.webRTC.connection.emit('message', payload, function (err, result) {

        	                });
        	                
        	                self.joinRoom(self.callTargetUserId);
        	
        	            }
        	            
        	        });

                } // caller
                
                // reciver
                
                
                if(!self.isCalling() && self.connecionState > IDLE){
                    
                    
                    self.callback(self.onMediaReadyReceiver);
                    
                    
                    self.joinRoom(SPIKA_UserManager.getUser().get('id'));
                    
                    self.connecionState = RECEIVERSTATE_ESTABLISHINGCONNECTION;
                    self.callback(self.onStateChangedReceiver,"Connecting to peer...");
                    
                }
                

            });

            this.webRTC.on('mute', function (data) {
                
                var fromSessionId = data.id;
                var type = data.name;
                
                self.callback(self.onMediaStateChanged);
                
                if(fromSessionId != self.webRTC.connection.socket.sessionid){
                    
                    if(type == 'audio' && self.audioActivated == true){
                        self.muteAudio();
                    }
                    
                    if(type == 'video' && self.videoActivated == true){
                        self.muteVideo();
                    }
                    
                }

                
            });

            this.webRTC.on('unmute', function (data) {

                var fromSessionId = data.id;
                var type = data.name;
                
                self.callback(self.onMediaStateChanged);
                
                if(fromSessionId != self.webRTC.connection.socket.sessionid){
                    
                    if(type == 'audio' && self.audioActivated == false){
                        self.unmuteAudio();
                    }

                    if(type == 'video' && self.videoActivated == false){
                        self.unmuteVideo();
                    }
                    
                }

                
            });
            
                        
            this.webRTC.on('readyToCall', function () {

            });
            
            
            this.webRTC.connection.on('message', function (message) {
                                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
                
                if(commandType == 'callEnd'){
                    
                    self.callback(self.onFinish,false,LANG.call_finished);
                    self.finishCalling();
	
                }

                if(commandType == 'callAnswer'){
                        
                    self.connecionState = CALLERSTATE_CALLESTABLISHED;
                    
                    self.callback(self.onStateChangedReceiver,"Call established");
                    self.callback(self.onAcceptedCaller);
                    
                    // disable listers
                    this.onStateChangedCaller = null;
                    this.onP2PEstablishedCaller = null;
                    this.onAcceptedCaller = null;


                    self.setInitiateMediaState();
                }


                if(commandType == 'callOffer'){
                    
                    
                    if(self.connecionState != IDLE)
                        return;
                        
                    self.callerFromUserId = message.payload.user.id;
                    self.callTargetSessionId = message.from;
                    
                    
                    if(!_.isEmpty(self.callerFromUserId)){
                    
                        self.connecionState = RECEIVERSTATE_CALLRECEIVED;
                        self.callback(self.onCallReceived,self.callerFromUserId);
                        
                        self.callback(self.onStateChangedReceiver,"Initializing devices...");
                        self.webRTC.startLocalVideo();
                        
                    }
                    
                    
                }


            });


        } catch(ex) {
            
            U.l(ex);
            
        }

    },
    canUseWebRTC: function(){
        return this.isConnected;
    },
    isCalling: function(){
        return this.callTargetUserId != 0;
    },
    startCalling: function(userId,onFinish,onStateChangedCaller,onP2PEstablishedCaller,onAcceptedCaller,onMediaStateChanged){
        
        this.connecionState = CALLERSTATE_ESTABLISHINGCONNECTION;

        this.callTargetUserId = userId;
        this.onFinish = onFinish;
        this.onStateChangedCaller = onStateChangedCaller;
        this.onP2PEstablishedCaller = onP2PEstablishedCaller;
        this.onAcceptedCaller = onAcceptedCaller;
        this.onMediaStateChanged = onMediaStateChanged;
        
        this.callback(this.onStateChangedCaller,"Initializing local devices...");
        
        this.webRTC.startLocalVideo();
        
    },
    callReceived: function(onCallReceived,onFinish,onStateChangedReceiver,onP2PEstablishedReceiver,onMediaReadyReceiver,onAcceptedReceiver,onMediaStateChanged){
        
        this.onCallReceived = onCallReceived;
        this.onFinish = onFinish;
        this.onStateChangedReceiver = onStateChangedReceiver;
        this.onP2PEstablishedReceiver = onP2PEstablishedReceiver;
        this.onAcceptedReceiver = onAcceptedReceiver;
        this.onMediaReadyReceiver = onMediaReadyReceiver;
        this.onMediaStateChanged = onMediaStateChanged;
        
        this.callback(this.onStateChangedReceiver,"Initializing local devices...");
                
    },
    callback: function(callbackfunc,param1,param2){
        
        if(_.isFunction(callbackfunc)){
            callbackfunc(param1,param2);
        }
        
    },
    
    finishCalling: function(){
    
        var self = this;
        
        if(this.connecionState == IDLE)
            return;

        this.onFinish = null;
        this.onStateChangedCaller = null;
        this.onP2PEstablishedCaller = null;
        this.onAcceptedCaller = null;

        
        this.callTargetUserId = 0;
        this.connecionState = IDLE;
        
        this.webRTC.stopLocalVideo();
        this.joinRoom(SPIKA_UserManager.getUser().get('id'));

        var payload = {
            to: this.callTargetSessionId,
            from: this.webRTC.connection.socket.sessionid,
            type : 'callEnd',
            payload : {
                user: SPIKA_UserManager.getUser().get('originalData')
            }
        };
        
        // send call end
        this.webRTC.connection.emit('message', payload, function (err, result) {
            
            if (err) {
                
                self.error(LANG.call_error_general);
                
            } else {
                
                U.l(result);
                
            }

        });
        
        
    },

    acceptCall:function(){
        
        var self = this;
        
        var payload = {
            to: this.callTargetSessionId,
            from: this.webRTC.connection.socket.sessionid,
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
        
        this.connecionState = RECEIVERSTATE_CALLESTABLISHED;
        this.callback(this.onAcceptedReceiver);
        
        // reset lieters

    },
    
    joinRoom: function(userId){
        
        var params = {};
        params.room_id = userId;
        params.user = SPIKA_UserManager.getUser().get('originalData');
        
        this.webRTC.joinRoom(params);
        
    },
    
    setInitiateMediaState: function(){

        if(this.initialAudioState == false)
            this.muteAudio();
        else
            this.unmuteAudio();

        if(this.initialVideoState == false)
            this.muteVideo();
        else
            this.unmuteVideo();
                    
    },
    allMute: function(){

        this.muteAudio();
        this.muteVideo();  
            
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