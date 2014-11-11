var APPENDBOT = 1;
var APPENDTOP = 2;
var REFRESH = 3;

var SPIKA_ChatView = Backbone.View.extend({

    postBoxView: null,
    chatData: null,
    messages : new MessageResult([]),
    totalMessageCount:0,
    displayMode: CHATVIEW_LISTMODE,
    threadViewRootMessageId:null,
    replyTargetMessageId:0,
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
            self.goListMode();
			self.resetChat(chatId);
        });
        
        Backbone.on(EVENT_MESSAGE_SENDING, function(data) {
            
            if(self.displayMode == CHATVIEW_THREADMODE){
                return;
            }
            
            data.user_id = SPIKA_UserManager.getUser().get('id');
            data.firstname = SPIKA_UserManager.getUser().get('firstname');
            data.lastname = SPIKA_UserManager.getUser().get('lastname');
            //data.image_thumb = SPIKA_UserManager.getUser().get('image'); // to prevent blinking avatar

            // add temporary message
            var newMessages = new MessageResult([]);
            newMessages.add(messageFactory.createModelByTempData(data));
            
            self.messages.add(newMessages);
            self.messages.sort();
            
			self.renderMessages(APPENDBOT,newMessages.models);
			            
        });

        Backbone.on(EVENT_MESSAGE_SENT, function(chatId) {

			if(self.displayMode == CHATVIEW_LISTMODE){
				
		        if(_.isNull(self.chatData))
		            return;
		        
		        if(chatId == self.chatData.get('chat_id')){
		            
		            self.loadNewMessages();                
					Backbone.trigger(EVENT_REFRESH_ROOMLIST);
		
		        }
				
			}
			
			if(self.displayMode == CHATVIEW_THREADMODE){
				
		        if(_.isNull(self.chatData))
		            return;
		        
		        if(chatId == self.chatData.get('chat_id')){
		            
					self.resetThreadView();
		
		        }
				
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
            
            if(self.displayMode == CHATVIEW_LISTMODE){
	            
	            var scrollPos = $$('#main_container .scrollable').scrollTop();
	            
	            if(scrollPos == 0){
	                
	                self.fetchNextMessages(false);
	                
	            }
	            
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

            if(!_.isNull(self.chatData.get("chat_id"))){
                self.startChat();
                Backbone.trigger(EVENT_ENTER_CHAT,chatId);
            }
            
        },function(data){
            
            
            
        });
	  	  
    },
    updateWindowSize: function(){

	    if(this.displayMode == CHATVIEW_LISTMODE){
	        U.setViewHeight($$("#main_container .scrollable"),[
	            $$('header'),$$('footer')
	        ]);
	    }
        
	    if(this.displayMode == CHATVIEW_THREADMODE){
	        U.setViewHeight($$("#main_container .scrollable"),[
	            $$('header'),$$('footer'),$$('#thread_view_header')
	        ]);
	    }
        
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
			self.messages.sort();

			if(refresh)
            	self.renderMessages(REFRESH,newMessages);
            else
            	self.renderMessages(APPENDTOP,newMessages);
            	
                        
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
            
            self.messages.add(newMessagesFiltered);
            self.messages.sort();

			self.renderMessages(APPENDBOT,newMessagesFiltered);

            // delete temporary messages
            $$("#main_container article section").each(function(){
    
                var messageId = $(this).attr("messageid");
                
                if(messageId == 0){
                    $(this).css("display","none");
                }
    
            });
        
        },function(data){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.chat_loadfailed);
            
        });
        
    },
    
    formatMessages : function(messages,doSort){
        

        if(doSort){
            messages.sort();
        }
        
        var self = this;
        
        _.each(messages,function(row){ 
            row.set("content",self.generateContnt(row));
	        row.set("indentpixel",20);
        });
        
        // generate tree structure
        if(this.displayMode == CHATVIEW_THREADMODE){
	        var treeData = self.unflatten(0,messages);
	        
	        var flattenMessages = [];
            self.treeViewGenerator_TreeToList(flattenMessages,treeData);
            
	        _.each(flattenMessages,function(row){          
	            row.set("indentpixel",row.get("indent") * INDENT_UNITPIXEL + 20);
	        });
	        
	        return flattenMessages;
        }
        
        return messages;
        
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
			self.goThreadMode(message);

            self.replyTargetMessageId = messageId;
            
        });

        $$("#thread_view_header a").unbind().click(function(){
	    	
	    	self.goListMode();
	    	    
        });
  
        $$("#main_container article section .icon_rootmessage").unbind().click(function(){
            
            var messageId = $(this).parent().parent().attr("messageid");
			
			if(_.isUndefined(messageId))
				return;
			
			var message = self.getMessageFromCacheById(messageId);
			self.goThreadMode(message);

            
        });

        $$("#main_container article section .icon_repliedmessage").unbind().click(function(){
            
            var messageId = $(this).parent().parent().attr("messageid");
			
			if(_.isUndefined(messageId))
				return;
			
			var message = self.getMessageFromCacheById(messageId);
			self.goThreadMode(message);
            
        });
                
    },
    
    getMessageFromCacheById:function(messageId){
	    

        for(index in this.messages.models){

            var mes = this.messages.models[index];

            if(messageId == mes.get('id'))
            	return mes;
            
        }
            
        return null;

    },
    
    goThreadMode:function(message){
	    
		if(this.displayMode==CHATVIEW_LISTMODE){
		    $$('#thread_view_header').css('display','block');
		    
		    $$('article').css('padding-top',
		    	parseInt($$('article').css('padding-top')) + $$('#thread_view_header').height()
		    );
		    this.displayMode=CHATVIEW_THREADMODE;
		}
	    
	    if(message.get('root_id') == 0){
		    this.threadViewRootMessageId = message.get('id');
	    }else{
		    this.threadViewRootMessageId =  message.get('root_id');		    
	    }
		
		this.resetThreadView();
		
		this.postBoxView.replyMeessageId = message.get('id');
		this.postBoxView.viewMode = CHATVIEW_THREADMODE;
		
		this.updateWindowSize();

    },
    goListMode:function(){
		
		if(this.displayMode==CHATVIEW_LISTMODE)
			return;
        
        this.postBoxView.replyMeessageId = 0;
        this.replyTargetMessageId = 0;
        
	    $$('article').css('padding-top',
	    	parseInt($$('article').css('padding-top')) - $$('#thread_view_header').height()
	    );
	    
	    $$('#thread_view_header').css('display','none');
		this.displayMode=CHATVIEW_LISTMODE;
		this.fetchNextMessages(true);

		this.updateWindowSize();
	
    },
    resetThreadView:function(){
	  	
	  	var self = this;
	  	
	  	this.messages = new MessageResult([]);
	  	
        apiClient.getThreadMessages(this.threadViewRootMessageId,function(data){

            var newMessages = messageFactory.createCollectionByAPIResponse(data).models;
            
            self.messages.add(newMessages);
			self.messages.sort();

			self.renderMessages(REFRESH,newMessages);
			        	
        },function(data){
            
        });
	  	  
    },
    renderMessages:function(appendPos,messages){
		
		var self = this;
		
		messages = this.formatMessages(messages,true);

        var beforeHeight = $$('#main_container article')[0].scrollHeight
                    
        if(appendPos == REFRESH){
	        
            var template = _.template($$('#template_message_row').html(), {messages: messages}); 
            $$('#main_container article').html(template);
            
        }else if(appendPos == APPENDTOP){
	        
            var template = _.template($$('#template_message_row').html(), {messages: messages}); 
            $$('#main_container article').prepend(template);
            
        }else if(appendPos == APPENDBOT){
	        
            var template = _.template($$('#template_message_row').html(), {messages: messages}); 
            $$('#main_container article').append(template);
            
        }
        
        $$('#main_container article').removeClass('nochat');
        
        var afterHeight = $$('#main_container article')[0].scrollHeight
        
        if(appendPos == APPENDBOT || appendPos == REFRESH){
            this.scrollToBottom();
        }else{
            $$("#main_container .scrollable").scrollTop(afterHeight - beforeHeight);
        }
        
        // reply target
        $$('.icon_replytarget').css('display','none');
        if(this.replyTargetMessageId != 0){
            $$('#main_container article section[messageid=' + this.replyTargetMessageId + '] .icon_replytarget').css("display","inline");
        } 
        
		if(this.displayMode==CHATVIEW_THREADMODE){
            $$('#main_container article section .icon_rootmessage').css("display","none");		
            $$('#main_container article section .icon_repliedmessage').css("display","none");		
		}

        _.debounce(function() {
            self.attachMessageEvent();
            self.processFiles();
        }, 500)();

    },


    unflatten : function(indent,array, parent, tree ){
        
        var self = this;
        
        tree = typeof tree !== 'undefined' ? tree : [];
        parent = typeof parent !== 'undefined' ? parent : new ModelMessage({id:0});
    
        var children = _.filter( array, function(child){ 
            return child.get('parent_id') == parent.get('id'); 
        });
    
        if( !_.isEmpty( children )  ){
            
            if( parent.id == 0 ){
               tree = children;   
            }else{
               //if(indent < 2)
                 parent['children'] = children
            }
            _.each( children, function( child ){ 
                child.set('indent',indent);
                self.unflatten(indent + 1,array, child ) 
            });                    
        }
    
        return tree;
    },


    treeViewGenerator_TreeToList : function(listData,treeData){
        
        for(var i = 0; i < treeData.length ; i++){

            var message = treeData[i];

            listData.push(message);
            
            if(!_.isUndefined(message.children)){
                this.treeViewGenerator_TreeToList(listData,message.children);
            }

        }
        
    },


});