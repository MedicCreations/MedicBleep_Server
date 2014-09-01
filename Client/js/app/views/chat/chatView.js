var SPIKA_ChatView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        
        var self = this;
        this.currentUser = null;
        this.currentGroup = null;
        this.chatId = 0;
        this.currentPage = 0;
        this.isPagingAcrive = false;
        this.totalMessageCount = 0;
        this.viewmode = CHATVIEW_LISTMODE;
        this.chatData = null;
        this.threadId = 0;
        
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function(sizeObj) {
            var width = sizeObj.width;
            var height = sizeObj.height;
            self.updateWindowSize(width,height);
        });
    
        Backbone.on(EVENT_TB_HEIGHT_UPDATED, function(modelUser) {
        
            var windowWidth = U.getWidth();
            var windowHeight = U.getHeight();

            self.updateWindowSize(windowWidth,windowHeight);
        });
        
        Backbone.on(EVENT_START_PRIVATE_CHAT, function(modelUser) {
            
            if(!_.isNull(modelUser)){
                
                apiClient.startPrivateChat(modelUser,function(data){

                    if(!_.isUndefined(data.chat_id)){
                        
                        var chatData = chatFactory.createModelByAPIResponse(data);
                        self.currentUser = modelUser;
                        self.currentGroup = null;
                        
                        self.startChat(chatData);
                        
                    }
                
                },function(data){
                
                
                
                });
                
            }
            
        });
        
        Backbone.on(EVENT_START_GROUP_CHAT, function(modelGroup) {
            
            if(!_.isNull(modelGroup)){
                
                apiClient.startGroupChat(modelGroup,function(data){
                
                    if(!_.isUndefined(data.chat_id)){
                        
                        var chatData = chatFactory.createModelByAPIResponse(data);
                        chatData.set('group_id',modelGroup.get('id'));
                        self.currentUser = null;
                        self.currentGroup = modelGroup;
                        
                        self.startChat(chatData);
                        
                    }
                
                },function(data){
                
                
                
                });
        
                
            }
            
        });
        
        Backbone.on(EVENT_START_CHAT_BY_CHATDATA, function(chatData) {
            
            if(!_.isNull(chatData.get("chat_id"))){
                self.startChat(chatData);
            }
            
        });
        
        Backbone.on(EVENT_NEW_MESSAGE, function(chatId) {
            if(!_.isNull(chatId) && chatId == self.chatId){
                
                if(self.viewmode == CHATVIEW_LISTMODE)
                    self.loadNewMessages();
                else
                    self.openThreadMode(self.threadId);
            }
            
        });
        
        Backbone.on(EVENT_MESSAGE_SENT, function(chatId) {
            if(chatId == self.chatId){

                if(self.viewmode == CHATVIEW_LISTMODE)
                    self.loadNewMessages();
                else
                    self.openThreadMode(self.threadId);
                    
            }
        });
      
        Backbone.on(EVENT_ADDUSER_TO_CHAT, function(userId) {
            
            if(self.chatId != null && userId != null){

                apiClient.addUserToChat(self.chatId,userId,function(data){
                    
                    var chatData = chatFactory.createModelByAPIResponse(data.chat);
                    self.currentUser = null;
                    self.currentGroup = null;
                    
                    self.startChat(chatData);
                        
                },function(data){
                
                
                
                });
            
            }
            
        });
          
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        var self = this;
        
        require(['app/views/chat/postBoxView','thirdparty/text!templates/chat/postBox.tpl'
                ],function (
                        PostBoxViewTmp,TemplatePostBox
                ) {

            self.postBoxView = new SPIKA_PostBoxView({
                template: TemplatePostBox
            });
            
            self.onload();
            
        });
        
        $(this.el).html(this.template);
              
        return this;
        
    },
    
    onload: function(){
        
        $(U.sel("#chat_post_holder")).html(this.postBoxView.render().el);

        var self = this;
        
        // handle paging
        $(U.sel('#chat_view')).scroll(function() {
            
            var scrollPos = $(U.sel('#chat_view')).scrollTop();
            
            if(!self.isPagingAcrive)
                return;

            if(self.totalMessageCount <= self.messages.length)
                return;
                
            if(scrollPos == 0){
                
                self.isPagingAcrive = false;
                
                var lastMessage = self.messages.at(0);
                
                apiClient.getMessages(self.chatId,lastMessage.get('id'),function(data){
                    
                    self.messages.add(messageFactory.createCollectionByAPIResponse(data).models);
                    self.formatMessages(true);
                    
                    var template = _.template($(U.sel('#template_message_row')).html(), {messages: self.messages.models});
                    $(U.sel("#chat_view ul")).html(template);
                    
                    self.isPagingAcrive = true;
                    
                    self.scrollToMessage(lastMessage);
                    
                    if(!_.isUndefined(data.total_count))
                        self.totalMessageCount = data.total_count;
                
                    _.debounce(function() {
                        self.attachMessageEvent();
                        self.processFiles();
                    }, 500)();
            
                },function(data){
                
                
                
                });
                    
            }
            
        });
        
        // load last chat at first
        if(!_.isNull($.cookie(COOKIE_LAST_CHATID)) && 
            !_.isNull($.cookie(COOKIE_LAST_CHATNAME)) &&
            !_.isUndefined($.cookie(COOKIE_LAST_CHATID)) && 
            !_.isUndefined($.cookie(COOKIE_LAST_CHATNAME)) && 
            $.cookie(COOKIE_LAST_CHATID) != 0){
            
            var lastChatId = $.cookie(COOKIE_LAST_CHATID);
            
            
            apiClient.getChatById(lastChatId,function(data){
                
                var chatData = chatFactory.createModelByAPIResponse2(data.chat_data);
                self.startChat(chatData);
                
            },function(data){
            
                
            
            });

        }
        
        $(U.sel("#chat_view")).on("dragover", function(event) {
            event.preventDefault();  
            event.stopPropagation();
            $(this).addClass('dragging');
        });
        
        $(U.sel("#chat_view")).on("dragleave", function(event) {
            event.preventDefault();  
            event.stopPropagation();
            $(this).removeClass('dragging');
        });
        
        $(U.sel("#chat_view")).on("drop", function(event) {
            event.preventDefault();  
            event.dataTransfer = event.originalEvent.dataTransfer;
            
            if(_.isUndefined(event.dataTransfer))
                return;
                
            Backbone.trigger(EVENT_FILE_DROP,event.dataTransfer.files);
            
        });
        
        
    },
    
    startChat : function(chatModel){
        
        this.viewmode = CHATVIEW_LISTMODE;
        
        $.cookie(COOKIE_LAST_CHATID, chatModel.get('chat_id'), { expires: COOKIE_EXPIRES });
        $.cookie(COOKIE_LAST_CHATNAME, chatModel.get('chat_name'), { expires: COOKIE_EXPIRES });
            
        $(U.sel('#chat_title')).text(chatModel.get('chat_name'));
        this.chatId = chatModel.get('chat_id');
        this.postBoxView.setChatId(this.chatId);
        this.loadPage(true,0);
        this.chatData = chatModel;
        
        Backbone.trigger(EVENT_ENTER_CHAT,chatModel);
        Backbone.trigger(EVENT_LIST_MODE,this.chatId);

        _.debounce(function() {
            self.updateWindowSize(U.getWidth(),U.getHeight());   
        }, 100)(); 
            
    },
    
    updateWindowSize: function(width,height){

       var headerHeight = $(U.sel('#main_top')).height();
       var chatBoxHeight = $(U.sel('#chat_post')).height();
       var messageBoxHeight = height - chatBoxHeight - headerHeight ;
       
       $(U.sel('#chat_view')).height(messageBoxHeight);
       
    },
    
    loadPage : function(refresh,pageNum){
        
        var self = this;
        
        apiClient.getMessages(this.chatId,0,function(data){
            
            if(refresh == true){
                self.messages = new MessageResult([]);
            }else{
                
            }
            
            if(!_.isUndefined(data.total_count))
                self.totalMessageCount = data.total_count;
            
            self.messages.add(messageFactory.createCollectionByAPIResponse(data).models);
            self.formatMessages(true);
            
            var template = _.template($(U.sel('#template_message_row')).html(), {messages: self.messages.models});
            $(U.sel("#chat_view ul")).html(template);
            
            if(refresh == true){
                self.scrollToBottom();
                self.isPagingAcrive = true;
            }

            _.debounce(function() {
                self.attachMessageEvent();
                self.processFiles();
            }, 500)();

        },function(data){
            
            
            
        });
        
    },
    
    loadNewMessages : function(){
        
        var self = this;
        var lastMessageId = 0;
        
        if(this.messages.length > 0)
            lastMessageId = this.messages.at(this.messages.length - 1).get('id');
        
        apiClient.getNewMessages(this.chatId,lastMessageId,function(data){
            
            if(!_.isUndefined(data.total_count))
                self.totalMessageCount = data.total_count;
                
            self.messages.add(messageFactory.createCollectionByAPIResponse(data).models);
            self.formatMessages(true);
            
            var template = _.template($(U.sel('#template_message_row')).html(), {messages: self.messages.models});
            $(U.sel("#chat_view ul")).html(template);

            self.scrollToBottom();
            
            _.debounce(function() {
                self.attachMessageEvent();
                self.processFiles();
            }, 500)();
            
        },function(data){
            
            
            
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
    
    scrollToBottom: function(){
        $(U.sel('#chat_view')).scrollTop($(U.sel('#chat_view'))[0].scrollHeight);
    },
    scrollToMessage : function(message){
        
        var sumHeight = 0;
        
        $(U.sel('#chat_view ul li')).each(function(){
           
           var messageIdElm = $(this).attr('data-messageid');
           
           if(messageIdElm ==  message.get('id')){
               
               sumHeight += $(this).height();
               
               $(U.sel('#chat_view')).scrollTop(sumHeight);
               
               return;
           }
            
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
            content = content.split("\n").join("<br />");
        }
        
        else if(messageType == MESSAGE_TYPE_IMAGE){
            content = '<img class="encrypted_image" src="data:image/png;base64,' + LOADING_IMAGE + '" fileid="' + message.get('thumb_id') + '" state="loading" />';
            content += '<br /><span><a id="downloadlink_' + message.get('file_id') + '" href="javascript:EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'picture\')"><img src="img/btn_download.png" /></a></span>';
        }

        else if(messageType == MESSAGE_TYPE_VIDEO){
            content = '<i class="fa fa-file-video-o fa-2x"></i> <a id="downloadlink_' + message.get('file_id') + '" href="javascript:EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'video.mp4\')"><img src="img/btn_download.png"></a>';
        }
        
        else if(messageType == MESSAGE_TYPE_LOCATION){
            
            var latitude = decryptedText = EncryptManager.decryptText(message.get('latitude'));
            var longitude = decryptedText = EncryptManager.decryptText(message.get('longitude'));
            
            content = '<a target="_blank" href="http://maps.google.com/?q=' + latitude + ',' + longitude + '">' + 'Lon:' + longitude+ ' Lat:' + latitude + '</a>';
        }
        
        else if(messageType == MESSAGE_TYPE_VOICE){
            content = '<i class="fa fa-file-sound-o fa-2x"></i> <a id="downloadlink_' + message.get('file_id') + '" href="javascript:EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'sound.mp3\')"><img src="img/btn_download.png"></a>';        
        }
        
        else if(messageType == MESSAGE_TYPE_FILE){
            content = '<i class="fa fa-file fa-2x"></i> <a id="downloadlink_' + message.get('file_id') + '" href="javascript:EncryptManager.downloadFile(\'' + message.get('file_id') + '\',\'' + decryptedText + '\')"><img src="img/btn_download.png" ></a><br />' + decryptedText;    
        }
        
        else {
            content = message.get('text');
        }
        
        if(this.viewmode == CHATVIEW_LISTMODE){
            if(message.get('root_id') != 0){
                content = '<a href="#" class="parent_icon" data-threadid="' + message.get('root_id') + '"><i class="fa fa-arrow-left"></i></a> ' + content;
            }
        }
        
        return content;
    
    },
    
    attachMessageEvent : function(){
        
        var self = this;
        
        
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
        
        
    },
    
    openOptions : function(el){
        
        $(el).find("em").css('display','none');
        
        $(el).find(".mess_body").animate({
            width: "-=75px"
        }, 250, function() {
        // Animation complete.
        });
        
        $(el).find(".mess_option").animate({
            width: "75px"
        }, 250, function() {
        // Animation complete.
        });
        
    },
    
    closeOptions : function(el){
        
        $(el).find(".mess_body").animate({
            width: "+=75px"
        }, 250, function() {
        // Animation complete.
             $(el).find("em").fadeIn();
        });
        
        $(el).find(".mess_option").animate({
            width: "0px"
        }, 250, function() {
        // Animation complete.
        });
        
    },
    
    openThreadMode: function(rootMessageId){
        
        var self=this;
        
        this.threadId = rootMessageId;
        
        Backbone.trigger(EVENT_THREAD_MODE,this.threadId);
        
        $(U.sel('#chat_title')).html(this.chatData.get('chat_name') + ' (Thread Mode  <a href="#" id="listmode">Back</a> )' + '');
        
        apiClient.getThreadMessages(rootMessageId,function(data){
            
            self.viewmode = CHATVIEW_THREADMODE;
            self.isPagingAcrive = false;
            
            var messageList = messageFactory.createCollectionByAPIResponse(data).models;
            //messageList.sort();
            
            // make tree
            var treeData = self.unflatten(0,messageList);
            
            self.messages = new MessageResult([]);
            self.treeViewGenerator_TreeToList(self.messages,treeData);

            self.formatMessages(false);
            
            var template = _.template($(U.sel('#template_message_row')).html(), {messages: self.messages.models});
            $(U.sel("#chat_view ul")).html(template);
            
            $(U.sel("#listmode")).click(function(){
                self.backToListMode();
                return false;
            });
            
            _.debounce(function() {
                self.attachMessageEvent();
            }, 500)();
            
        },function(data){
            
            
            
        });
        
    },
    
    backToListMode: function(){
        
        Backbone.trigger(EVENT_LIST_MODE,this.chatId);
        this.viewmode = CHATVIEW_LISTMODE;
        this.startChat(this.chatData);
        
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
    
    processFiles : function(){
        
        $('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                EncryptManager.decryptImage(this,fileId,150,apiClient);
                    
            }
            
        });

        
        $('.encrypted_image_profile').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                EncryptManager.decryptImage(this,fileId,0,apiClient);
                    
            }
            
        });
        
    },
    
    // file drop handlig
    dragover : function(){
        
        $(U.sel("#chat_view")).css('border','1px solid #f00');
        
    },
    
    dragleave : function(){
        
        $(U.sel("#chat_view")).css('border','none');
        
    },
    
    drop : function(){
        
        
    }
    
});
