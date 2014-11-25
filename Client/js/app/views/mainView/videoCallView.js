var SPIKA_VideoCallView = Backbone.View.extend({
    
    partnerUserId: 0,
    roomName: 0,
    webRTC: null,
    partnerSessionId : null,
    initialize: function(options) {
        this.template = options.template;
        this.partnerUserId = options.partnerUserId;
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
        
        this.roomName = this.partnerUserId;
        
        var self = this;
        
        this.webRTC = window.webRTC;
        
        // check room existance
        //webrtc.emit('message', ' {"args":"' + this.roomName + '","name":"room"}');
        
        this.webRTC.startLocalVideo();
        
        this.webRTC.connection.on('message', function (message) {
            
            var commandType = message.type;
            
            if(_.isNull(commandType))
                return;
            
            if(commandType == 'callAnswer'){
                
                self.webRTC.joinRoom(self.roomName);
                
                
                
            }
            
            if(commandType == 'callDecline'){
                
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_declined);
                self.stop();
                
            }
            
        });
        
        this.webRTC.on('localStream', function (stream) {
 
            self.webRTC.connection.emit('room', self.roomName, function (err, room) {
                
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
                    
                    self.partnerSessionId = keys[0];
                    
                    var payload = {
                        to: self.partnerSessionId,
                        from: self.webRTC.connection.socket.sessionid,
                        type : 'callOffer',
                        payload : {
                            user: SPIKA_UserManager.getUser().get('originalData')
                        }
                    };
                    
                    // make call request
                    self.webRTC.connection.emit('message', payload, function (err, result) {
                        
                        U.l(err);
                        
                        if (err) {
                            
                            self.error(LANG.call_error_general);
                            
                        } else {
                            
                            U.l(result);
                            
                        }
                    });
                    
                    /*
                    self.webRTC.joinRoom(this.roomName);
                    */
                }
            });
        
        });

        // a peer video has been added
        this.webRTC.on('videoAdded', function (video, peer) {
            
            U.l('video');
            
            var remotes = document.getElementById('videoRemotes');
            
            if (remotes) {
                var container = document.createElement('div');
                container.className = 'videoContainer';
                container.id = 'container_' + self.webRTC.getDomId(peer);
                container.appendChild(video);

                // suppress contextmenu
                video.oncontextmenu = function () { return false; };

                // show the remote volume
                var vol = document.createElement('div');
                vol.id = 'volume_' + peer.id;
                vol.className = 'volumeBar';
                video.onclick = function () {
                    video.style.width = video.videoWidth + 'px';
                    video.style.height = video.videoHeight + 'px';
                };
                container.appendChild(vol);
                
                // show the ice connection state
                if (peer && peer.pc) {
                    var connstate = document.createElement('div');
                    connstate.className = 'connectionstate';
                    container.appendChild(connstate);
                    peer.pc.on('iceConnectionStateChange', function (event) {
                        switch (peer.pc.iceConnectionState) {
                        case 'checking': 
                            $(connstate).text('Connecting to peer...');
                            break;
                        case 'connected':
                        case 'completed': // on caller side
                            $(connstate).text('Connection established.');
                            break;
                        case 'disconnected':
                            $(connstate).text('Disconnected.');
                            break;
                        case 'failed':
                            $(connstate).text('Connection failed.');
                            break;
                        case 'closed':
                            $(connstate).text('Connection closed.');
                            break;
                        }
                    });
                }
                remotes.appendChild(container);
            }
        });
        // a peer was removed
        this.webRTC.on('videoRemoved', function (video, peer) {

            var remotes = document.getElementById('videoRemotes');
            var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
            if (remotes && el) {
                remotes.removeChild(el);
            }
        });
        
            /*
        webrtc.on('readyToCall', function () {
            // you can name it anything
            if (room) webrtc.joinRoom(this.roomName);
        });
            */

/*
        webrtc.on('message', function (message) {
            var peers = self.webrtc.getPeers(message.from, message.roomType);
            var peer;
    
            if (message.type === 'offer') {
                if (peers.length) {
                    peer = peers[0];
                } else {
                    peer = self.webrtc.createPeer({
                        id: message.from,
                        type: message.roomType,
                        enableDataChannels: self.config.enableDataChannels && message.roomType !== 'screen',
                        sharemyscreen: message.roomType === 'screen' && !message.broadcaster,
                        broadcaster: message.roomType === 'screen' && !message.broadcaster ? self.connection.socket.sessionid : null
                    });
                }
                peer.handleMessage(message);
            } else if (peers.length) {
                peers.forEach(function (peer) {
                    peer.handleMessage(message);
                });
            }
        });
*/
 
    },
    stop:function(){
        U.l('stop');
        this.webRTC.stopLocalVideo();
        Backbone.trigger(EVENT_CALL_FINISH);
    },
    error: function(){
        
        this.webRTC.stopLocalVideo();
        Backbone.trigger(EVENT_CALL_ERROR);
        
    }
    
});
