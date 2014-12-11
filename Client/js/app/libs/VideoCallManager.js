var IDLE = 0;

var CALLERSTATE_IDLE = 1;
var CALLERSTATE_ESTABLISHINGCONNECTION = 2;

var RECEIVERSTATE_CALLRECEIVED = 10;


SPIKA_VideoCallManager = {
    
    /* Listners
        localStreamReady(stream)
    */
    webRTC:null,
    
    // caller callbacks
    onP2PEstablishedCaller:null,
    onStateChangedCaller:null,
    callTargetUserId:0,
    callTargetSessionId:'',
    
    // receiver callbacks
    onCallReceived:null,
    onStateChangedReceiver:null,
    onP2PEstablishedReceiver:null,
    callerFromUserId:null,

    // general callbacks
    onError:null,

    connecionState: IDLE, 
    isConnected:false,
    callbackListener: null,
    init:function(userId){
         
        var self = this;
        this.userId = userId;
		
		// by default initialte WebRTC with video and audio
		this.initiateWebRTC(userId,true,true,function(){
			
            self.webRTC.joinRoom(self.userId);
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
            debug: true,
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
                
                self.webRTC.joinRoom(SPIKA_UserManager.getUser().get('id'));
            });


            this.webRTC.on('localMediaError', function () {
                self.callback(self.onError,"Failed to initialize local devices.");
                self.finishCalling();
            });
            
            this.webRTC.on('readyToCall', function () {
            
                self.callback(self.onStateChangedCaller,"Establishing Connection...");
                
                self.webRTC.joinRoom(self.callTargetUserId);
                
                // caller
                if(self.isCalling() && self.connecionState == CALLERSTATE_ESTABLISHINGCONNECTION){
                    
                    U.l(self.callTargetUserId);
                    
                    // send call offer
        	        self.webRTC.connection.emit('room', self.callTargetUserId, function (err, room) {
        	                    	            
                        self.callback(self.onStateChanged,"User information fetched...");
                            
        	            if (err) {
                            
                            self.callback(self.onError,LANG.call_error_general);
        	                
        	            } else {
        	
        	                var clients = room.clients;
                            
        	                if(_.isNull(clients)){
        	                    self.callback(self.onError,LANG.call_error_general);
        	                    return;
        	                }
        	                
        	                var keys = _.keys(clients);
        	
        	                if(keys.length == 0){
        	                    self.callback(self.onError,LANG.call_error_usernotonline);
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
        	                
        	                
        	
        	            }
        	        });

                } // caller
                
                // reciver
                U.l(self.callTargetUserId);
                U.l(self.callTargetUserId);
                U.l(self.isCalling());
                
                if(!self.isCalling() && self.connecionState == RECEIVERSTATE_CALLRECEIVED){
                    
                    U.l('joining to the room');
                    self.webRTC.joinRoom(SPIKA_UserManager.getUser().get('id'));
                    
                }
                
            });
            
            
            this.webRTC.connection.on('message', function (message) {
                                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
            
                if(commandType == 'callOffer'){
                    
                    
                    self.callerFromUserId = message.payload.user.id;
                    
                    if(!_.isEmpty(self.callerFromUserId)){
                    
                        self.connecionState == RECEIVERSTATE_CALLRECEIVED;
                        self.callback(self.onCallReceived,self.callerFromUserId);
                        
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
    startCalling: function(userId,onError,onStateChangedCaller,onP2PEstablishedCaller){
        
        this.connecionState = CALLERSTATE_ESTABLISHINGCONNECTION;

        this.callTargetUserId = userId;
        this.onError = onError;
        this.onStateChangedCaller = onStateChangedCaller;
        this.onP2PEstablishedCaller = onP2PEstablishedCaller;
        
        this.callback(this.onStateChangedCaller,"Initializing local devices...");
        
        this.webRTC.startLocalVideo();
        
    },
    callReceived: function(onCallReceived,onError,onStateChangedReceiver,onP2PEstablishedReceiver){
        
        this.connecionState = RECEIVERSTATE_CALLRECEIVED;
        this.onCallReceived = onCallReceived;
        this.onError = onError;
        this.onStateChangedReceiver = onStateChangedReceiver;
        this.onP2PEstablishedReceiver = onP2PEstablishedReceiver;
        
        this.callback(this.onStateChangedReceiver,"Initializing local devices...");
                
    },
    callback: function(callbackfunc,param){
        
        if(_.isFunction(callbackfunc)){
            callbackfunc(param);
        }
        
    },
    
    finishCalling: function(){
        this.callTargetUserId == 0;
        this.connecionState = IDLE;
        
    }
}