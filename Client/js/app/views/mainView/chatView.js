var APPENDBOT = 1;
var APPENDTOP = 2;
var REFRESH = 3;

var SPIKA_ChatView = Backbone.View.extend({

    postBoxView: null,
    stickerView: null,
    noteView: null,
    imagePreviewView:null,
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
            
            mainView.setTitle(LANG.title_initial);
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
            'thirdparty/text!templates/mainView/postBoxView.tpl',
            'app/views/mainView/noteView',
            'thirdparty/text!templates/mainView/noteView.tpl',
            'app/views/featureViews/stickerView',
            'thirdparty/text!templates/featureViews/stickerView.tpl',
            'app/views/featureViews/imagePreviewView',
            'thirdparty/text!templates/featureViews/imagePreviewView.tpl'
        ], function (postBoxView,PostBoxViewTemplate,
                        noteView,NoteViewTemplate,
                        stickerView,StickerViewTemplate,
                        imagePreviewView,ImagePreviewViewTemplate) {
            
            self.postBoxView = new SPIKA_PostBoxView({
                template: PostBoxViewTemplate
            });
            
            self.stickerView = new SPIKA_StickerView({
                template: StickerViewTemplate
            });
            
            self.noteView = new SPIKA_NoteView({
                template: NoteViewTemplate
            });
            
            self.imagePreviewView = new SPIKA_imagePreviewView({
	           template: ImagePreviewViewTemplate 
            });
            
            self.onload();
            
        });
        
        return this;
        
    },
    
    onload : function(){

        var self = this;
        
        this.updateWindowSize();
        
        $$('#main_container footer').html(self.postBoxView.render().el);
        $$('#main_container').append(self.stickerView.render().el);
        $$('#main_container').append(self.imagePreviewView.render().el);   
        
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
	  	
	  	$$("img").remove("img.encrypted_image.chat_image");
	  	
        // get chat data first
        apiClient.getChatById(chatId,function(data){
            
            var cookieKey = COOKIE_ROOMPASSWORD_PREFIX + chatId;
            var savedPassword = $.cookie(cookieKey);
                        
            self.chatData = roomFactory.createModelByAPIResponse(data.chat_data);
            
            var roomPassword = self.chatData.get('password');
            
            U.l(roomPassword);
            
            if(!_.isEmpty(roomPassword)){
	            
	            var savedPasswordWorks = false;
	                
	            if(!_.isEmpty(savedPassword)){
		            
		            // saved password is already MD5
		            savedPasswordWorks = roomPassword == savedPassword;
		            
	            }
				
				if(!savedPasswordWorks){
	
		            SPIKA_PasswordManager.show(LANG.passworddialog_title,LANG.passworddialog_text,function(password,flgSavePassword){
			        	// succeed to enter
						if(roomPassword == CryptoJS.MD5(password).toString()){
					
				            if(!_.isNull(self.chatData.get("chat_id"))){
					            
					            // save password to cookie
					            if(flgSavePassword){
						            $.cookie(cookieKey, roomPassword, { expires: COOKIE_EXPIRES });
					            }
					            
				                self.enterRoom();
				                
				            }
							
						}else{
							
							SPIKA_AlertManager.show(LANG.general_errortitle,LANG.chat_wringpassword);
							
						}
			        	
			         
		            },function(){
			            // pressed cancel
			            
			            
		            });
	            
				} else {
					
					// saved password works
					self.enterRoom();
					
				}

	            
            }else{
                
				self.enterRoom();
            
            }
            
        },function(data){
            
            
            
        });
	  	  
    },
    enterRoom:function(){
        
        this.updateRoomButtons();
        
        mainView.setRoomTitle(this.chatData.get("chat_name"),this.chatData.get("chat_id"));

        if(!_.isNull(this.chatData.get("chat_id"))){
            this.startChat();
        }
    },
    updateWindowSize: function(){

	    if(this.displayMode == CHATVIEW_LISTMODE){
	        U.setViewHeight($$("#main_container .scrollable"),[
	            $$('header'),$$('footer')
	        ]);
	        
	        U.setViewHeight($$("#main_container #room_actions"),[
	            $$('header'),$$('footer')
	        ]);


	    }
        
	    if(this.displayMode == CHATVIEW_THREADMODE){
	        U.setViewHeight($$("#main_container .scrollable"),[
	            $$('header'),$$('footer'),$$('#thread_view_header')
	        ]);

	        U.setViewHeight($$("#main_container #room_actions"),[
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

			if(refresh){
			    Backbone.trigger(EVENT_ENTER_CHAT,self.chatData.get("chat_id"));
            	self.renderMessages(REFRESH,self.messages.models);
            }else
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
            
            var modelsToRemove = [];
            
            _.each(self.messages.models,function(model){
                
                if(model.get('id') == 0){
                    modelsToRemove.push(model);
                }
                
            });
            
            self.messages.remove(modelsToRemove);
            
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
        
        if(messageType == MESSAGE_TYPE_TEXT || messageType == MESSAGE_TYPE_STICKER){
            content = decryptedText;
           
            var isCode = false;
             
            if(!_.isNull(message.get('attributes'))){
                if(message.get('attributes').textType){
                    
                    var textType = message.get('attributes').textType;
                    
                    if(textType == 'code'){
                        
                        isCode = true;
                        
                    }
                    
                }
            }
            
            if(isCode){
                content = U.escapeHTML(content);
                content = '<pre><code>' + content + '</code></pre>';
            }else{
                content = U.escapeHTML(content);
                content = U.generalMessageFilter(content);
                content = content.autoLink({ target: "_blank", rel: "nofollow", id: "1" });
                content = content.split("\n").join("<br />");
            }
        }
        
        else if(messageType == MESSAGE_TYPE_IMAGE){
            content = '<img width="' + THUMB_PIC_SIZE_INVIEW + '" height="' + THUMB_PIC_SIZE_INVIEW + '" class="encrypted_image chat_image" src="' + WEB_ROOT + '/img/loading.png" fileid="' + message.get('thumb_id') + '" state="loading" messageid= "'+ message.get('id') +'" style="cursor:pointer;"/>';

        }

        else if(messageType == MESSAGE_TYPE_VIDEO){
            content = '<div class="media_loading_holder video"><video controls class="encrypted_video" fileid="' + message.get('file_id') + '" state="loading"><source type="video/mp4" src="" ></video>';
            content += '<div>';
            content += '<div class="loadbutton"><div style="padding-top:50px"><i class="fa fa-play-circle fa-3x"></i></div></div>';
            content += '<div class="loading_cover" style="display:none"><div class="meter"><span style="width: 100%"></span></div></div></div>';
            content += '</div>';
            content += '<input class="download marginfix" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';
            
        }
        
        else if(messageType == MESSAGE_TYPE_LOCATION){
            
            var latitude = decryptedText = EncryptManager.decryptText(message.get('latitude'));
            var longitude = decryptedText = EncryptManager.decryptText(message.get('longitude'));
            var mapID = "locationMap" + message.get('id');
            
            content = '<div id="' + mapID +'" class="locationMap" messageid= "'+ message.get('id') +'" style="cursor:pointer;"></div>';
            
        }
        
        else if(messageType == MESSAGE_TYPE_VOICE){
            content = '<div class="media_loading_holder voice"><audio controls class="encrypted_audio" fileid="' + message.get('file_id') + '" state="loading"><source type="audio/wav" src="" ></audio>';    
            content += '<div>';
            content += '<div class="loadbutton"><i class="fa fa-play-circle fa-3x"></i></div>';
            content += '<div class="loading_cover" style="display:none"><div class="meter"><span style="width: 100%"></span></div></div></div>';
            content += '</div>';
            content += '<input class="download marginfix" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';
                
        }
        
        else if(messageType == MESSAGE_TYPE_FILE){
            content = decryptedText;
            content += '<br /><input class="download" type="button" id="downloadlink_' + message.get('file_id') + '" onclick="EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')" value="Download" />';

        }
        
        else {
            content = decryptedText;
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
                AvatarManager.process(this,fileId)
                
                
            }
            
        });

        $$('.encrypted_video').each(function(){

            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            var videoElm = this;
            
            $(this).parent().find('.loadbutton').click(function(){
                
                $(this).parent().find('.loadbutton').css('display','none');
                $(this).parent().find('.loading_cover').css('display','block');
                
                if(state == 'loading'){
                    
                    EncryptManager.decryptMedia(videoElm,fileId,'video/mp4',apiClient,function(base64Data){
                        $(videoElm).parent().find('.loading_cover').remove();
                        $(videoElm).children().attr('src','data:video/mp4;base64,' + base64Data);  
                        $(videoElm).load(); 
                    },function(){},true,true);
                        
                }

                
            });

        });

        $$('.encrypted_audio').each(function(){

            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            var audioElm = this;
            
            $(this).parent().find('.loadbutton').click(function(){

                $(this).parent().find('.loadbutton').css('display','none');
                $(this).parent().find('.loading_cover').css('display','block');
                
                if(state == 'loading'){
                    
                    EncryptManager.decryptMedia(audioElm,fileId,'audio/wav',apiClient,function(base64Data){
                        $(audioElm).parent().find('.loading_cover').remove();
                        $(audioElm).children().attr('src','data:audio/wav;base64,' + base64Data);  
                        $(audioElm).load();
                    });
                        
                }
                
            });

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
        
        $$('.usericon').unbind().click(function(){
            var userId = $(this).attr('userid');
            Backbone.trigger(EVENT_OPEN_PROFLIE,userId);
        });
        
        
        $$("img.encrypted_image").click(function(){

			var messagePreview = self.getMessageFromCacheById($(this).attr('messageid'));

	        self.imagePreviewView.show(messagePreview);

			return;
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

		$$(".locationMap").unbind().click(function(){
			
			var messagePreview = self.getMessageFromCacheById($(this).attr('messageid'));
			var coordinates = {
				latitude: EncryptManager.decryptText(messagePreview.get("latitude")),
				longitude: EncryptManager.decryptText(messagePreview.get("longitude"))
		    };
			window.open('http://maps.google.com/?q=' + coordinates.latitude + ',' + coordinates.longitude ,'_blank');
		});

        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
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
		
		messages = this.formatMessages(messages,false);

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
        
        //if message is location render map to cell
        _.each(messages,function(cellMessage){
			if(cellMessage.get("type") === "4"){
				self.loadMapToDiv(cellMessage);
            }
        });
        
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
    
    updateRoomButtons: function(){
        
        var self = this;

        // handle room buttons
        var user = SPIKA_UserManager.getUser();

        $$('#btn_edit_room').css('display','none');
        $$('#btn_delete_room').css('display','none');
        $$('#btn_deactivate_room').css('display','none');
        $$('#btn_activate_room').css('display','none');
        $$('#btn_leave_room').css('display','none');

        $$('#btn_note').unbind().click(function(){

            Backbone.trigger(EVENT_OPEN_NOTE,self.chatData.get('chat_id'));
             
        });


        if(self.chatData.get('type') == 3){ // edit options are showed only if the room is created

            if(this.chatData.get('admin_id') == user.get('id')) { // if the user is owner
            
                $$('#btn_edit_room').css('display','inline-block');
                
                $$('#btn_edit_room').unbind().click(function(){
    
                    U.goPage('editroom');
                     
                });

                $$('#btn_delete_room').css('display','inline-block');
                
                $$('#btn_delete_room').unbind().click(function(){
                    
                    SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                        
                        // update room info
                        apiClient.updateRoom(
                            self.chatData.get('chat_id') ,
                            '',
                            '',
                            '',
                            '',
                            '',
                            '',
                            '1',
                            '',
                            function(updateResult){
    
                                Backbone.trigger(EVENT_LEAVE_CHAT,self.chatData.get('chat_id'));
                
                            },function(data){
                            
                                SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                
                        });
                        
                    },function(){
                        
                    });
                         
                });
                
                if(this.chatData.get('is_active') == 1){

                    $$('#btn_deactivate_room').css('display','inline-block');
                    $$('#btn_deactivate_room').unbind().click(function(){
        
                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // update room info
                            apiClient.updateRoom(
                                self.chatData.get('chat_id') ,
                                '',
                                '',
                                '',
                                '',
                                '',
                                '',
                                '',
                                '0',
                                function(updateResult){
        
                                    _.debounce(function() {
                                        Backbone.trigger(EVENT_START_CHAT,self.chatData.get('chat_id'));
                                    }, 1000)();
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });
                            
                        },function(){
                            
                        });
        
                        
                    });
                    
                } else {

                
                    $$('#btn_activate_room').css('display','inline-block');
                    $$('#btn_activate_room').unbind().click(function(){
                        
                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // update room info
                            apiClient.updateRoom(
                                self.chatData.get('chat_id') ,
                                '',
                                '',
                                '',
                                '',
                                '',
                                '',
                                '',
                                '1',
                                function(updateResult){
        
                                    _.debounce(function() {
                                        Backbone.trigger(EVENT_START_CHAT,self.chatData.get('chat_id'));
                                    }, 1000)();
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });
        
                        },function(){
                            
                        });
        
        
                    });  
    

                }
                                
            } else {

				var self = this;

                $$('#btn_leave_room').css('display','inline-block');
                $$('#btn_leave_room').unbind().click(function(){
                    
                    SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                        
                        // delete users
                        apiClient.deleteUsersFromChat(
                            self.chatData.get('chat_id'),
                            user.get('id'),
                            null,
                            null,
                            function(dataChat2){
    
                                Backbone.trigger(EVENT_LEAVE_CHAT,self.chatData.get('chat_id'));
    
                            },function(data){
                            
                                SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                
                        });
                        
                    },function(){
                        
                    });
                    
                }); 
                 
            }

        }
    
        
    },
    
    loadMapToDiv:function(locationMessage){
		
		//extract div ID	    
	    var divider = document.createElement("div");
	    divider.innerHTML = locationMessage.get("content");
	    
	    var coordinates = {
		  latitude: EncryptManager.decryptText(locationMessage.get("latitude")),
		  longitude: EncryptManager.decryptText(locationMessage.get("longitude"))
	    };
	    
	    //show map in div
	    SPIKA_LocationManager.showMap(divider.lastChild.id, true, coordinates);
	    
    }

});