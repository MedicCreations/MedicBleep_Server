var SPIKA_ChatView = Backbone.View.extend({

    postBoxView: null,
    chatData: null,
    messages : new MessageResult([]),
    totalMessageCount:0,
    initialize: function(options) {
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });

        Backbone.on(EVENT_LEAVE_CHAT, function() {
            self.messages = new MessageResult([]);
            self.chatData = null;
            $$('#main_container article').html('<div id="nochatbox"><i class="fa fa-exclamation-triangle"></i> ' + LANG.chat_nochat + '</div>');
            $$('#main_container article').addClass('nochat');
            //mainView.setTitle(LANG.title_initial);
        });
        
        Backbone.on(EVENT_START_CHAT, function(chatId) {
			
			self.resetChat(chatId);
            
        });


        Backbone.on(EVENT_MESSAGE_SENT, function(chatId) {
			
            if(_.isNull(self.chatData))
                return;
            
            if(chatId == self.chatData.get('chat_id')){
                
                // refresh lobby data if first post in the chat
                if(self.totalMessageCount == 0)
                    Backbone.trigger(EVENT_REFRESH_ROOMLIST);
                
                self.loadNewMessages();
                
/*
                if(self.viewmode == CHATVIEW_LISTMODE)
                    self.loadNewMessages();
                else
                    self.openThreadMode(self.threadId);
*/

            }
        });

        Backbone.on(EVENT_NEW_MESSAGE, function(chatId) {
     
            if(_.isNull(self.chatData))
                return;
                
            if(!_.isNull(chatId) && chatId == self.chatData.get('chat_id')){

                self.loadNewMessages();
                
                /*
                if(self.viewmode == CHATVIEW_LISTMODE)
                    self.loadNewMessages();
                else
                    self.openThreadMode(self.threadId);
                */
                
            }

            var totalUnread = SPIKA_notificationManger.unreadMessageNum;

            if( totalUnread == 0 )
                mainView.setRoomTitle(self.chatData.get("chat_name"),self.chatData.get("chat_id"));
            else
                mainView.setRoomTitle(self.chatData.get("chat_name") + '(' + totalUnread + ')',self.chatData.get("chat_id"));
                
        });

    },
	
    render: function() {
        
        var self = this;

        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));

        require([
            'app/views/mainView/postBoxView',
            'thirdparty/text!templates/mainView/postBoxView.tpl'
        ], function (postBoxView,PostBoxViewTemplate) {
            
            self.postBoxView = new SPIKA_PostBoxView({
                template: PostBoxViewTemplate
            });

            self.onload();
            
        });
        
        
        return this;
    },
    
    onload : function(){

        var self = this;
        
        this.updateWindowSize();
        
        $$('#main_container footer').html(self.postBoxView.render().el);
        
        $$('#main_container .scrollable').scroll(function(){
            
            var scrollPos = $$('#main_container .scrollable').scrollTop();
            
            if(scrollPos == 0){
                
                self.fetchNextMessages(false);
                
            }
            
        });
        
        $$("#main_container article").on("dragover", function(event) {
            event.preventDefault();  
            event.stopPropagation();
            $(this).addClass('dragging');
        });
        
        $$("#main_container article").on("dragleave", function(event) {
            event.preventDefault();  
            event.stopPropagation();
            $(this).removeClass('dragging');
        });
        
        $$("#main_container article").on("drop", function(event) {
            event.preventDefault();  
            event.dataTransfer = event.originalEvent.dataTransfer;
            
            if(_.isUndefined(event.dataTransfer))
                return;
                
            Backbone.trigger(EVENT_FILE_DROP,event.dataTransfer.files);
            
        });
        
        self.updateWindowSize();
    },
    
    resetChat: function(chatId){
	  	
	  	var self = this;
	  	
        // get chat data first
        apiClient.getChatById(chatId,function(data){
            
            self.chatData = roomFactory.createModelByAPIResponse(data.chat_data);
            
            mainView.setRoomTitle(self.chatData.get("chat_name"),self.chatData.get("chat_id"));
            
            U.l(self.chatData);
            
            if(!_.isNull(self.chatData.get("chat_id"))){
                self.startChat();
                Backbone.trigger(EVENT_ENTER_CHAT,chatId);
            }
            
        },function(data){
            
            
            
        });
	  	  
    },
    updateWindowSize: function(){
        U.setViewHeight($$("#main_container .scrollable"),[
            $$('header'),$$('footer')
        ]);
        
        $$('#thread_view_header').css('width',U.getWidth() - parseInt($$('#thread_view_header').css('left')));
    },
    
    startChat: function(){
        
        if(_.isNull(this.chatData))
            return;
            
        this.lastMessageId = 0;
        this.fetchNextMessages(true);
        
    },
    
    fetchNextMessages: function(refresh){

        var self = this;
        
        if(refresh){
            this.messages = new MessageResult([]);
        }
        
        
        //reached to last page
        if(self.messages.models.length > 0 && self.messages.models.length >= this.totalMessageCount)
            return;
            
        var lastMessageId = null;
        
        if(this.messages.models.length > 0)
            lastMessageId = this.messages.at(0).get('id');

        apiClient.getMessages(this.chatData.get("chat_id"),lastMessageId,function(data){
            
            if(!_.isUndefined(data.total_count))
                self.totalMessageCount = data.total_count;
            
            var newMessages = messageFactory.createCollectionByAPIResponse(data).models;
            
            self.messages.add(newMessages);

            self.formatMessages(true);
            
            var beforeHeight = $$('#main_container article')[0].scrollHeight
                        
            if(refresh){
                var template = _.template($$('#template_message_row').html(), {messages: self.messages.models}); 
                $$('#main_container article').html(template);
            }else{
                var template = _.template($$('#template_message_row').html(), {messages: newMessages}); 
                $$('#main_container article').prepend(template);
            }
            
            $$('#main_container article').removeClass('nochat');
            
            var afterHeight = $$('#main_container article')[0].scrollHeight
            
            if(refresh){
                self.scrollToBottom();
                Backbone.trigger(EVENT_REFRESH_ROOMLIST);
            }else{
                $$("#main_container .scrollable").scrollTop(afterHeight - beforeHeight);
            }

            _.debounce(function() {
                self.attachMessageEvent();
                self.processFiles();
            }, 500)();
            
        },function(data){

            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.chat_loadfailed);
            
        });    
        
    },

    loadNewMessages : function(){
        
        var self = this;
        var lastMessageId = 0;
        
        if(this.messages.models.length > 0)
            lastMessageId = this.messages.at(this.messages.models.length - 1).get('id');
        
        apiClient.getNewMessages(this.chatData.get("chat_id"),lastMessageId,function(data){
            
            if(!_.isUndefined(data.total_count))
                self.totalMessageCount = data.total_count;
            
            var newMessages = messageFactory.createCollectionByAPIResponse(data).models;
            var newMessagesFiltered = [];

            for(index in newMessages){

				var messagedAllowedToShow = true;
				
                var mes = newMessages[index];
                
                for(index2 in self.messages.models){
	                
	                var mes2 = self.messages.models[index2];
	                
	                if(mes2.get('id') == mes.get('id'))
	                	messagedAllowedToShow = false;
	                
	            }

				if(messagedAllowedToShow)
                	newMessagesFiltered.push(mes);
                
            }
            
            //U.l(newMessagesFiltered);
            
            self.messages.add(newMessagesFiltered);
            self.formatMessages(true);

            var template = _.template($$('#template_message_row').html(), {messages: newMessagesFiltered});
            $$('#main_container article').append(template);
            $$('#main_container article').removeClass('nochat');

            self.scrollToBottom();
            
            _.debounce(function() {
                self.attachMessageEvent();
                self.processFiles();
            }, 500)();

            
        },function(data){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.chat_loadfailed);
            
        });
        
    },
    
    formatMessages : function(doSort){
    
        if(doSort)
            this.messages.sort();
        
        var self = this;
        
        _.each(this.messages.models,function(row){            
            row.set("content",self.generateContnt(row));
        });
        
    },
    generateContnt : function(message){
        
        var content = "";
        var messageType = message.get('type');
        
        // decrypt
        var cryptedText = '';
        var decryptedText = '';
        
        try{
        
            decryptedText = EncryptManager.decryptText(message.get('text'));  
            
        } catch (ex){

            U.l(ex);
        }        
        
        if(messageType == MESSAGE_TYPE_TEXT){
            content = decryptedText;
            content = U.escapeHTML(content);
            content = U.generalMessageFilter(content);
            content = content.autoLink({ target: "_blank", rel: "nofollow", id: "1" });
            content = content.split("\n").join("<br />");
        }
        
        else if(messageType == MESSAGE_TYPE_IMAGE){
            content = '<img width="' + THUMB_PIC_SIZE_INVIEW + '" height="' + THUMB_PIC_SIZE_INVIEW + '" class="encrypted_image" src="' + WEB_ROOT + '/img/loading.png" fileid="' + message.get('thumb_id') + '" state="loading" />';
            content += '<input class="download" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'picture\')" value="Download" />';
        }

        else if(messageType == MESSAGE_TYPE_VIDEO){
            content = '<div class="media_loading_holder video"><video controls class="encrypted_video" fileid="' + message.get('file_id') + '" state="loading"><source type="video/mp4" src="" ></video>';
            content += '<div class="loading_cover"><div class="meter"><span style="width: 100%"></span></div></div></div>';
            content += '<input class="download marginfix" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';
            
        }
        
        else if(messageType == MESSAGE_TYPE_LOCATION){
            
            var latitude = decryptedText = EncryptManager.decryptText(message.get('latitude'));
            var longitude = decryptedText = EncryptManager.decryptText(message.get('longitude'));
            
            content = '<a target="_blank" href="http://maps.google.com/?q=' + latitude + ',' + longitude + '">' + 'Lon:' + longitude+ ' Lat:' + latitude + '</a>';
        }
        
        else if(messageType == MESSAGE_TYPE_VOICE){
            content = '<div class="media_loading_holder voice"><audio controls class="encrypted_audio" fileid="' + message.get('file_id') + '" state="loading"><source type="audio/wav" src="" ></audio>';    
            content += '<div class="loading_cover"><div class="meter"><span style="width: 100%"></span></div></div></div>';
            content += '<input class="download marginfix" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';
                
        }
        
        else if(messageType == MESSAGE_TYPE_FILE){
            content = decryptedText;
            content += '<br /><input class="download" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';

        }
        
        else {
            content = message.get('text');
        }
        
        if(message.get('is_deleted') == 1){
	        
	        content = "<i>This message is deleted</i>";
	        
        }
        
        if(this.viewmode == CHATVIEW_LISTMODE){
            if(message.get('root_id') != 0){
                content = '<a href="#" class="parent_icon" data-threadid="' + message.get('root_id') + '"><i class="fa fa-arrow-left"></i></a> ' + content;
            }
        }
        
        return content;
    
    },
    scrollToBottom: function(){
        $$("#main_container .scrollable").scrollTop($$("#main_container .scrollable")[0].scrollHeight);   
    },
    processFiles : function(){
        
        $$('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                //EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient,null,null,true,true);
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient,null,null,true,true);
                AvatarManager.process(this,fileId);
                
            }
            
        });

        $$('.encrypted_video').each(function(){

            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            var videoElm = this;
            
            if(state == 'loading'){
                
                EncryptManager.decryptMedia(this,fileId,'video/mp4',apiClient,function(base64Data){
                    $(videoElm).parent().find('.loading_cover').remove();
                    $(videoElm).children().attr('src','data:video/mp4;base64,' + base64Data);  
                    $(videoElm).load(); 
                },function(){},true,true);
                    
            }

        });

        $$('.encrypted_audio').each(function(){

            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            var audioElm = this;

            if(state == 'loading'){
                
                EncryptManager.decryptMedia(this,fileId,'audio/wav',apiClient,function(base64Data){
                    $(audioElm).parent().find('.loading_cover').remove();
                    $(audioElm).children().attr('src','data:audio/wav;base64,' + base64Data);  
                    $(audioElm).load();
                });
                    
            }

        });
        
        $$('.encrypted_image_profile').each(function(){
            
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                //EncryptManager.decryptImage(this,fileId,0,apiClient);
                AvatarManager.process(this,fileId);
                
            }

        });
        
    },

    attachMessageEvent : function(){
        
        var self = this;
        
        $$("#main_container .chat_content .text").each(function(){
                
            var elm = this;

    
        });
        
        $$('.usericon').click(function(){
            var userId = $(this).attr('userid');
            Backbone.trigger(EVENT_OPEN_PROFLIE,userId);
        });
        
        $$("#main_container article section").unbind().dblclick(function(){

            $$("#main_container article .replay").hide();
            $$("#main_container article section").removeClass('selected');

			var userId = $(this).attr("userid");
			var messageId = $(this).attr("messageid");
			
			var message = self.getMessageFromCacheById(messageId);
			
			// do nothing for deleted message
			if(!_.isNull(message) && message.get('is_deleted') == 1){
				return;
			}

            $(this).find(".replay").fadeIn();
            
            $(this).addClass('selected');
			
			if(userId != SPIKA_UserManager.getUser().get('id')){
				$(this).find(".message-menu-btn-delete").css('display','none');
			}

        });
        
        $$("#main_container article section .btn-delete").unbind().click(function(){
            
            var messageId = $(this).attr("messageid");
			
			if(_.isUndefined(messageId))
				return;
			
            SPIKA_AlertManager.show(LANG.general_confirmation,LANG.confirmation_delete,function(){

	            apiClient.deleteMessage(messageId,function(data){

	                self.resetChat(self.chatData.get("chat_id"));
	            	
	            },function(data){
	                
	            });
                
            },function(){
                
            })
            
        });
                
        
        $$("#main_container article section .btn-reply").unbind().click(function(){
            
            var messageId = $(this).attr("messageid");
			
			if(_.isUndefined(messageId))
				return;
			
			var message = self.getMessageFromCacheById(messageId);
			
			
			
            apiClient.getThreadMessages(message.get('root_id'),function(data){

                U.l(data);
            	
            },function(data){
                
            });
            
        });

                
        /*
        $(U.sel("#chat_view ul li")).unbind().click(function(){
            
            Backbone.trigger(EVENT_SELECT_REPLY,0);
            
            var messageId = $(this).attr('data-messageid');
            var openedMessageId = 0;
            
            $(U.sel("#chat_view ul li")).each(function(){
            
                $(this).removeClass('selected');
                
                if($(this).attr('state') == 'opened'){
                    self.closeOptions(this);
                    $(this).attr('state','closed');
                    
                    openedMessageId = $(this).attr('data-messageid');
                }
            });
            
            if(messageId == openedMessageId && openedMessageId != 0)
                return;
                
            $(this).find(".mess_option").css('display','block');
            
            if($(this).attr('state') != 'opened'){

                self.openOptions(this);
                $(this).attr('state','opened');
                
            }else{
                
                self.closeOptions(this);
                $(this).attr('state','closed');
                
            }

        });
        
        $(U.sel("#chat_view ul li .reply")).unbind().click(function(){
            
            var messageId = $(this).attr('data-messageid');
            
            Backbone.trigger(EVENT_SELECT_REPLY,messageId);

            $(U.sel("#chat_view ul li")).each(function(){
                $(this).removeClass('selected');
            });
            
            $(U.sel('#chat_view ul li[data-messageid="' + messageId + '"]')).addClass('selected');
            
            return false;
            
        });
        
        $(U.sel("#chat_view ul li .parent_icon")).unbind().click(function(){
            
            Backbone.trigger(EVENT_SELECT_REPLY,0);
            
            var threadId = $(this).attr('data-threadid');
            
            self.openThreadMode(threadId);
            
            return false;

        });
        */
        
    },
    
    getMessageFromCacheById:function(messageId){
	    

        for(index in this.messages.models){

            var mes = this.messages.models[index];

            if(messageId == mes.get('id'))
            	return mes;
            
        }
            
        return null;

    }

});