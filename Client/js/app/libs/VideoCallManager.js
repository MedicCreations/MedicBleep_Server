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
    onFinish:null,

    connecionState: IDLE, 
    isConnected:false,
    callbackListener: null,
    init:function(userId){
         
        var self = this;
        this.userId = userId;
		
		// by default initialte WebRTC with video and audio
		this.initiateWebRTC(userId,true,true,function(){
			
            self.joinRoom(self.userId);
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
                
                self.joinRoom(SPIKA_UserManager.getUser().get('id'));
            });


            this.webRTC.on('localMediaError', function () {
                self.callback(self.onFinish,true,"Failed to initialize local devices.");
                self.finishCalling();
            });
            
            this.webRTC.on('readyToCall', function () {
            
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
                U.l(self.callTargetUserId);
                U.l(self.callTargetUserId);
                U.l(self.isCalling());
                
                if(!self.isCalling() && self.connecionState == RECEIVERSTATE_CALLRECEIVED){
                    
                    U.l('joining to the room');
                    self.joinRoom(SPIKA_UserManager.getUser().get('id'));
                    
                }
                
            });
            
            
            this.webRTC.connection.on('message', function (message) {
                                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
                
                U.l(message);
                
                if(commandType == 'callEnd'){
                    
                    U.l("callEnd");

                    self.finishCalling();

	                self.callback(self.onFinish,false,LANG.call_finished);
		                	
                }
                
                if(commandType == 'callOffer'){
                    
                    
                    self.callerFromUserId = message.payload.user.id;
                    self.callTargetSessionId = message.from;
                    
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
    startCalling: function(userId,onFinish,onStateChangedCaller,onP2PEstablishedCaller){
        
        this.connecionState = CALLERSTATE_ESTABLISHINGCONNECTION;

        this.callTargetUserId = userId;
        this.onFinish = onFinish;
        this.onStateChangedCaller = onStateChangedCaller;
        this.onP2PEstablishedCaller = onP2PEstablishedCaller;
        
        this.callback(this.onStateChangedCaller,"Initializing local devices...");
        
        this.webRTC.startLocalVideo();
        
    },
    callReceived: function(onCallReceived,onFinish,onStateChangedReceiver,onP2PEstablishedReceiver){
        
        this.connecionState = RECEIVERSTATE_CALLRECEIVED;
        this.onCallReceived = onCallReceived;
        this.onFinish = onFinish;
        this.onStateChangedReceiver = onStateChangedReceiver;
        this.onP2PEstablishedReceiver = onP2PEstablishedReceiver;
        
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
            
        this.callTargetUserId == 0;
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
    
    joinRoom: function(userId){
        
        var params = {};
        params.room_id = userId;
        params.user = SPIKA_UserManager.getUser().get('originalData');
        
        this.webRTC.joinRoom(params);
        
    }
}