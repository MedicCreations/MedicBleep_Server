var SPIKA_notificationManger = {
    
    lastLobbyData : null,
    lastUnreadNum : null,
    unreadMessageNum : 0,
    flgStopPooling:false,
    init : function(){
        
        var self = this;
        
        window.setTimeout(function(){
            self.doPooling();
        }, POOLING_INTERVAL);
        
        Backbone.on(EVENT_FORCE_LOGOUT, function(page) {
            self.flgStopPooling = true;
        });
        
    },
    stopPooling : function(){
        U.l('stop');
        this.flgStopPooling = true;
    },
    doPooling : function(){

        var self = this;
        
        self.flgStopPooling = false;
        
        if(apiClient == null || apiClient.authorized == false){
            
            window.setTimeout(function(){
                self.doPooling();
            }, POOLING_INTERVAL);
        
            return;
        }

        apiClient.lobby(function(data){
            
            var lobbyData = historyFactory.createCollectionByAPIResponse(data);
            
            if(_.isNull(self.lastLobbyData)){
                self.lastLobbyData = lobbyData;
                
                window.setTimeout(function(){
                    self.doPooling();
                }, POOLING_INTERVAL);
                
                return;
            }
            
            var unread = 0;
                           
            _.each(self.lastLobbyData.models,function(historyOld){
                
                unread += parseInt(historyOld.get('unread'));
                
                var modelHistoryNew = lobbyData.searchById(historyOld.get('chat_id'));
                
                if(!_.isNull(modelHistoryNew) && modelHistoryNew.get('unread') != historyOld.get('unread')){
                    
                    Backbone.trigger(EVENT_NEW_MESSAGE,modelHistoryNew.get('chat_id'));
                    
                }
                
            });
            
            U.l(lobbyData.length + ":" + self.lastLobbyData.length);
            
            if(lobbyData.length != self.lastLobbyData.length){
                U.l('new chat');
                // new chat is generated or chat is removed
                Backbone.trigger(EVENT_NEW_MESSAGE,null);
            }
            
            if(self.lastUnreadNum != unread){

                Backbone.trigger(EVENT_NEW_MESSAGE,null);
                
                // new message
                if(unread > self.lastUnreadNum){

                    SPIKA_soundManager.playNewMessage();
    
                    var noticifaction = notify.createNotification("SPIKA", {
                        body:"You have new message.",
                        icon:WEB_ROOT+"/img/icon_desktop.png"
                    });
                    
                    _.debounce(function() {
                        noticifaction.close();
                    }, 2000)();
                
                
                
                }
                
                U.updateUnread(unread);
                
            }
            
            self.lastUnreadNum = unread;
            
            
            
            self.lastLobbyData = lobbyData;
            
            if(self.flgStopPooling == false){

                window.setTimeout(function(){
                    self.doPooling();
                }, POOLING_INTERVAL);
                
            }

                 
        },function(data){
            
            

        });
        

        
    }
    
}