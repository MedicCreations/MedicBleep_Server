var SPIKA_notificationManger = {
    
    lastLobbyData : null,
    lastUnreadNum : null,
    unreadMessageNum : 0,
    flgStopPooling:false,
    wsConnection : null,
    websocketMode : false,
//     webSocketSession : null,
    init : function(){
        
        var self = this;
        
        if(POLING_ENABLED == false){
            self.usePoing();
        } else {
     
            try{
                            
                self.resetWebSocket();
    
            } catch (ex){
                U.l(ex);
                self.usePoing();
                
            }
            
        }

        
        Backbone.on(EVENT_MESSAGE_SENT, function(chatId) {

            self.sendNotification(chatId);
            
        });
        
    },

    //////////////////////////////////////////////////////////
    //  Web Socket mode logics
    //////////////////////////////////////////////////////////
    resetWebSocket : function(){
        
        var self = this;
        
        if(!_.isNull(self.wsConnection)){
            self.wsConnection.close();
            self.wsConnection = null;
        }

        //create a new WebSocket object.
        self.wsConnection = new WebSocket(NOTIFICATION_SERVER_URL);
        
        self.wsConnection.onopen = function(e) {
        
	        U.l('SOCKET MODE');
            self.websocketMode = true;
            
            if(SPIKA_UserManager.isAuthorised()){
                SPIKA_notificationManger.attachUser(SPIKA_UserManager.getUser().get('id'));
            }
            
            self.stopPooling();
			
			
        };
        
        self.wsConnection.onmessage = function(e) {
                        
            var data = JSON.parse(e.data);

            if(SPIKA_UserManager.getUser().get('id') != data.from_user_id){
	            self.newMessage(data.chat_id,data.message);	
            }
                
/*
			if(data.hasOwnProperty('socketSessionID')){
				self.webSocketSession = data.socketSessionID;
			}else{
*/
			
// 			}
			
        };

        self.wsConnection.onerror = function(e) {
            U.l('web socket error');

            self.webSocketSession = null;
/*            self.websocketMode = false;
*/
            
            self.usePoing();
        };


        _.debounce(function() {
	        
	        if(_.isNull(this.wsConnection)){
           		self.resetWebSocket();		        
	        }else{
		        self.socketIsAlive();
	        }
	        
        }, 60 * 1000)();

    },
        
    //////////////////////////////////////////////////////////
    //  Poling mode logics
    //////////////////////////////////////////////////////////
    
    usePoing : function(){
        
        var self = this;
        
        U.l('POLING MODE');
        
        this.flgStopPooling = false;
        
        window.setTimeout(function(){
            self.doPooling();
        }, POOLING_INTERVAL);
        
        Backbone.on(EVENT_FORCE_LOGOUT, function(page) {
            self.flgStopPooling = true;
        });
    },
    stopPooling : function(){
        this.flgStopPooling = true;
    },
    doPooling : function(){
        
        var self = this;

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

                    if(modelHistoryNew.get('unread') > historyOld.get('unread')){
                        self.newMessage(modelHistoryNew.get('chat_id'));
                    }
                    
                    
                }
                
            });
            
            self.unreadMessageNum = unread;
            
            if(lobbyData.length != self.lastLobbyData.length){

                // new chat is generated or chat is removed
                Backbone.trigger(EVENT_NEW_MESSAGE,null);
            }
            
            if(self.lastUnreadNum != unread){

/*
                Backbone.trigger(EVENT_NEW_MESSAGE,null);
                
                // new message
                if(unread > self.lastUnreadNum){
                    
                    U.l('new message 2');
                    //SPIKA_soundManager.playNewMessage();
    

                
                }
*/
                //U.updateUnread(unread);
                
            }
            
            self.lastUnreadNum = unread;
            
            
            
            self.lastLobbyData = lobbyData;
            
            if(self.flgStopPooling == false){

                window.setTimeout(function(){
                    self.doPooling();
                }, POOLING_INTERVAL);
                
            }

                 
        },function(data){
            
            if(self.flgStopPooling == false){

                window.setTimeout(function(){
                    self.doPooling();
                }, POOLING_INTERVAL);
                
            } 

        });
        

        
    },
    
    //////////////////////////////////////////////////////////
    //  Websocket mode logics
    //////////////////////////////////////////////////////////
    
    sendNotification: function(chatId){
        
        // this goes from server side
        if(_.isNull(this.wsConnection))
            return;
        
        
        //this.wsConnection.send(chatId);
    },
    
    attachUser: function(userId){
        
        // this goes from server side
        if(_.isNull(this.wsConnection))
            return;

        try{
            this.wsConnection.send(JSON.stringify({
                command:'setUser',
                identifier:SYSTEM_IDENTIFIER,
                userId:userId
            }));
        }catch(ex){
        }

    },
    
    
    deattachUser: function(userId){
        
        // this goes from server side
        if(_.isNull(this.wsConnection))
            return;

        this.wsConnection.send(JSON.stringify({
            command:'removeUser',
            identifier:SYSTEM_IDENTIFIER,
            userId:userId
        }));
    }

    ,
   
    socketIsAlive: function(){
	  
		if(_.isNull(this.wsConnection))
			return;
	    U.l('SOCKET ALIVE');
	    this.wsConnection.send(JSON.stringify({
		    command:'keepSessionAlive',
		    sessionID:self.webSocketSession
	    }));
	    
    },
    
    
    //////////////////////////////////////////////////////////
    //  On new message
    //////////////////////////////////////////////////////////
    
    newMessage: function(chatId,originalMessge){
		
		var modelData = DataCacheManager.getChatModelById(chatId);
		originalMessge = EncryptManager.decryptText(originalMessge);
		
		if(_.isEmpty(originalMessge) || _.isUndefined(originalMessge)){
			
	        if(_.isUndefined(modelData))
	        	message = LANG.new_message1;
	        else
	        	message = '[' + modelData.get('chat_name') + '] ' + LANG.new_message2;
	        	
		} else {

	        if(_.isUndefined(modelData))
	        	message = originalMessge;
	        else
	        	message = '[' + modelData.get('chat_name') + '] ' + originalMessge;
	        	
		}

        Backbone.trigger(EVENT_NEW_MESSAGE,chatId);
        
        	
        SPIKA_soundManager.playNewMessage();
        
        var noticifaction = notify.createNotification("SPIKA", {
            body:message,
            icon:WEB_ROOT+"/img/icon_desktop.png"
        });
        
        _.debounce(function() {
            noticifaction.close();
        }, 3000)();
        
    }
       
    
}