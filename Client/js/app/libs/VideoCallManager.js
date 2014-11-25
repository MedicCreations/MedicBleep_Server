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
    init:function(userId){
        
        var self = this;
        this.userId = userId;
        
        var stun = {
            'url': 'stun:54.176.174.246:3478'
        };
        
        var turn = {
            'url': 'turn:54.176.174.246:3478',
            'username': 'turn',
            'credential': 'turn'
        };
        
        try{

            // create our webrtc connection
            this.webRTC = new SimpleWebRTC({
                peerConnectionConfig: { 'iceServers': [stun, turn] },
                url:'http://54.176.174.246:32400',
                // the id/element dom element that will hold "our" video
                localVideoEl: 'webrtcVideoMine',
                // the id/element dom element that will hold remote videos
                remoteVideosEl: 'webrtcVideoPartner',
                // immediately ask for camera access
                autoRequestMedia: false,
                debug: true,
                detectSpeakingEvents: true,
                autoAdjustMic: false
            });
            
            this.webRTC.on('readyToCall', function () {
                
                self.roomName = this.userId;
                self.webRTC.joinRoom(self.roomName);
                
            });

            // callbacks
            this.webRTC.on('localStream', function (stream) {
    
                if(_.isEmpty(self.callbackListener))
                    return;
                    
                if(!_.isUndefined(self.callbackListener.localStreamReady))
                    self.callbackListener.localStreamReady(stream)
                
            });
    
            
            this.webRTC.connection.on('message', function (message) {
                
                U.l('on message -----------');
                U.l(message);
                
                var commandType = message.type;
                
                if(_.isNull(commandType))
                    return;
                
                if(commandType == 'callAnswer'){
                    
                    if(self.callState != 1)
                        return;
                        
                    self.webRTC.joinRoom(self.roomName);
    
                }
                
                if(commandType == 'callDecline'){
    
                    if(self.callState != 1)
                        return;
    
                    self.callState = 0;
    
                    if(_.isEmpty(self.callbackListener))
                        return;
                        
                    if(!_.isUndefined(self.callbackListener.callDeclined))
                        self.callbackListener.callDeclined()
                    
                }
                
                if(commandType == 'callEnd'){
    
                    self.finishCalling();
                    
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
                        Backbone.trigger(EVENT_CALL_OFFER,message);
                        self.callState = 4;
                    }
                    
                }

            });
            
            // a peer video has been added
            this.webRTC.on('videoAdded', function (video, peer) {
                
                U.l('videoAdded');
                
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
                            self.callState = 3;
                            self.currentPeerId = peer.id;
                            
                            if(_.isEmpty(self.callbackListener))
                                return;
                                
                            if(!_.isUndefined(self.callbackListener.callEstablished))
                                self.callbackListener.callEstablished(video,peer.id)
                            
                            break;
                        }
                        case 'disconnected':
                            self.finishCalling();
                            break;
                        case 'failed':
                            self.error(LANG.call_error_noconnection);
                            break;
                        case 'closed':
                            self.finishCalling();
                            break;
                        }
                        
                    });
                    
                }
                    
            });
            
            // a peer was removed
            this.webRTC.on('videoRemoved', function (video, peer) {
                self.finishCalling();
            });
            
            // main function
            
            this.webRTC.joinRoom(this.userId);
            window.webRTC = this.webRTC;
            
            
        } catch(ex) {
            
            U.l(ex);
            this.callState = -1;
            
        }

    
    },
    canUseWebRTC:function(){
        
        return !_.isEmpty(this.webRTC);
          
    },
    startLocalVideo:function(){
        
        this.webRTC.startLocalVideo();
        
    },
    stopLocalVideo:function(){
        
        this.webRTC.stopLocalVideo();
        
    },
    startCalling:function(roomName){
        
        if(this.callState != 0)
            return;
            
        var self = this;
        self.mySessionId = self.webRTC.connection.socket.sessionid;
        
        // leave from my room
        self.webRTC.leaveRoom(self.roomName);
        
        // set to new room (oppornent users room) join room will be called after
        self.roomName = roomName;
        
        self.callState = 1;
        
        if(_.isEmpty(self.mySessionId) || self.mySessionId == 0){
            self.error(LANG.call_error_noconnection);
            return;
        }
        this.webRTC.connection.emit('room', roomName, function (err, room) {
            
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
                    self.error(LANG.call_error_general);
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
        
    },
    error:function(message){
        
        var self = this;
        
        if(_.isEmpty(self.callbackListener))
            return;
            
        if(!_.isUndefined(self.callbackListener.callFailed))
            self.callbackListener.callFailed(message)

        
    },
    finishCalling:function(){
        
        if(this.callState == 0)
            return;
        
        this.callState = 0;
        
        var self = this;
        
        // leave room every time
        self.webRTC.leaveRoom(self.roomName);

        // back to my room
        self.roomName = self.userId;
        self.webRTC.joinRoom(self.roomName);


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

        
        if(_.isEmpty(self.callbackListener))
            return;
            
        if(!_.isUndefined(this.callbackListener.callFinished))
            this.callbackListener.callFinished(this.currentPeerId)

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
        self.roomName = SPIKA_UserManager.getUser().get('id');
        
        if(this.callState != 4)
            return;
            
        this.callState = 2;
        
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
                
                self.webRTC.joinRoom(self.roomName);
                
            }
        });


    }

    
}