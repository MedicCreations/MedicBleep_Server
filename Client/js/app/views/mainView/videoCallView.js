var SPIKA_VideoCallView = Backbone.View.extend({
    
    partnerUserId: 0,
    partnerSessionId : null,
    isCalling: false,
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
        
        var self = this;
        
        // check room existance
        //webrtc.emit('message', ' {"args":"' + this.roomName + '","name":"room"}');
        
        SPIKA_VideoCallManager.callbackListener = this;
        SPIKA_VideoCallManager.startLocalVideo();
         
    },
    stop:function(){
        
        SPIKA_VideoCallManager.finishCalling();
        Backbone.trigger(EVENT_CALL_FINISH);
        
    },
    error: function(message){
        SPIKA_VideoCallManager.stopLocalVideo();
        Backbone.trigger(EVENT_CALL_ERROR,message);
    },
    
    // WebRTC callback ///////////////////////////////////////////////////////////////////
    
    localStreamReady:function(stream){
        
        var self = this;
        
        U.l('call state' + SPIKA_VideoCallManager.callState);
        
        // callFailed and callEstablished is called from this.
        
        if(SPIKA_VideoCallManager.callState == 0){
            SPIKA_VideoCallManager.startCalling(this.partnerUserId);
        }

        if(SPIKA_VideoCallManager.callState == 4){
            SPIKA_VideoCallManager.acceptCall();
        }
            
    },
    callFailed:function(message){
        
        this.error(message);
        
    },
    callEstablished:function(video,peerId){
        
        var remotes = document.getElementById('videoRemotes');
        this.isCalling = true;
        
        if (remotes) {
            var container = document.createElement('div');
            container.className = 'videoContainer';
            container.id = 'container_' + peerId;
            container.appendChild(video);

            // suppress contextmenu
            video.oncontextmenu = function () { return false; };

            // show the remote volume
            var vol = document.createElement('div');
            vol.id = 'volume_' + peerId;
            vol.className = 'volumeBar';
            video.onclick = function () {
                video.style.width = video.videoWidth + 'px';
                video.style.height = video.videoHeight + 'px';
            };
            container.appendChild(vol);
            
            remotes.appendChild(container);
            
        }
        
    },
    callDeclined:function(){
    
        SPIKA_VideoCallManager.stopLocalVideo();

        SPIKA_AlertManager.show(LANG.call_declined_title,LANG.call_declined);
        $$('#extramessage_dialog_view_conference').fadeOut();
        
        this.isCalling = false;
            
    },
    callFinished:function(peerId){
        
        if(this.isCalling){
        
            SPIKA_AlertManager.show(LANG.call_finished_title,LANG.call_finished);
            SPIKA_VideoCallManager.stopLocalVideo();
            Backbone.trigger(EVENT_CALL_FINISH);

        }
        
        this.isCalling = false;
        
    }
    
    //////////////////////////////////////////////////////////////////////////////////////
    
    
});
