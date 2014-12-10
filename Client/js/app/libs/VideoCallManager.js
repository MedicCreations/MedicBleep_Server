SPIKA_VideoCallManager = {
    
    /* Listners
        localStreamReady(stream)
    */
    webRTC:null,
    
    // caller callbacks
    onP2PEstablishedCaller:null,
    onStateChangedCaller:null,
    callerUserId:0,
    
    
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
                  
            this.webRTC.on('connectionReady', function () {
                self.isConnected = true;
            });
                    
            this.webRTC.on('readyToCall', function () {
                self.callback(self.onStateChangedCaller,"Local devices ready...");
            });
            
        } catch(ex) {
            
            U.l(ex);
            
        }

    },
    canUseWebRTC: function(){
        return this.isConnected;
    },
    
    startCalling: function(userId,onStateChangedCaller,onP2PEstablishedCaller){
        
        this.callerUserId = userId;
        this.onStateChangedCaller = onStateChangedCaller;
        this.onP2PEstablishedCaller = onP2PEstablishedCaller;
        
        this.callback(this.onStateChangedCaller,"Establishing connection...");
        
        this.webRTC.startLocalVideo();
        
    },
    
    callback: function(callbackfunc,param){
        
        if(_.isFunction(callbackfunc)){
            callbackfunc(param);
        }
        
    }
}