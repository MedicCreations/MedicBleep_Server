var SPIKA_PostBoxView = Backbone.View.extend({
    
    chatBoxDefaultHeight : 0,
    chatBoxMaxHeight : 0,
    isSending: false,
    replyMeessageId: 0,
    viewMode: CHATVIEW_LISTMODE,
    rootMessageId: 0,
    initialize: function(options) {
        
        _.bindAll(this, "render");
        
        this.template = options.template;
        
        var self = this;
            
        Backbone.on(EVENT_SELECT_REPLY, function(messageId) {
            self.replyMeessageId = messageId; 
        });

        Backbone.on(EVENT_THREAD_MODE, function(threadId) {
            self.viewMode = CHATVIEW_THREADMODE;
            self.rootMessageId = threadId;
        });
        
        Backbone.on(EVENT_LIST_MODE, function(chatId) {
            self.viewMode = CHATVIEW_LISTMODE;
            self.rootMessageId = 0;
        });
                
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
        
    },
    
    onload: function(){

        var self = this;
        
        this.chatBoxDefaultHeight = $(U.sel("#chat_textbox")).height();
        this.chatBoxMaxHeight = this.chatBoxDefaultHeight * 3;
        
        // handle sending message
        $(U.sel('#btn_post_message')).click(function(){
        
            self.sendMessage();
                
        });
        
        // dummy file upload click
        $(U.sel('#btn_upload_file')).click(function(){
            $(U.sel("#btn_dummy_file_upload")).click();
        });
        
        $(U.sel("#btn_dummy_file_upload")).change(function (evt){
        
            var fileName = $(this).val();

            var files = evt.target.files; // FileList object
            
            // files is a FileList of File objects. List some properties.
            var output = [];
            
            for (var i = 0 ; i < files.length ; i++) {
                
                f = files[i];
                
                self.startUpload();
                
                fileUploadHandler.processFile(f,function(origData){
                    
                    var fileId = origData.fileId;
                    var thumbId = origData.thumbId;
                    var type = origData.type;
                    var text = origData.text;
                    
                    var data = {
                        chat_id:self.chatId,
                        type:type,
                        parent_id:self.replyMeessageId
                    };
                    

                    if(type == MESSAGE_TYPE_TEXT){                        
                        data.text = text;
                    }

                    if(type == MESSAGE_TYPE_IMAGE){                        
                        data.file_id = fileId;
                        data.thumb_id = thumbId;
                    }
                    
                    if(type == MESSAGE_TYPE_VIDEO){
                        data.file_id = fileId;
                    }

                    if(type == MESSAGE_TYPE_VOICE){
                        data.file_id = fileId;
                    }
                    
                    if(type == MESSAGE_TYPE_FILE){
                        data.file_id = fileId;
                        var encryptedHex = EncryptManager.encryptText(text);
                        data.text = encryptedHex;
                    }
                    
                    self.replyMeessageId = 0;
                    
                    apiClient.sendMessage(data,function(data){
                        $(U.sel('#chat_textbox')).val('');
                        self.finishUpload();
                        Backbone.trigger(EVENT_MESSAGE_SENT,self.chatId);
                    },function(data){
                        
                        
                    });
                    
                },function(){
                    
                    self.finishUpload();
                    
                },function(progress,text){
                    
                    self.progressUpload(progress,text);
                    
                });

            }

        });
     
        
        $(U.sel("#chat_textbox")).keypress(function(event) {
            
            if(event.which == 13 && event.altKey){
                self.growHeight();
                return true;
            }else if(event.which == 13){
                
                self.sendMessage();
                return false;
            }
            
            return true;
            
        });

    },
    sendMessage : function(){
        
        if(this.isSending == true)
            return;
            
        if(this.chatId == 0){
            return;
        }
        
        var self = this;
        var message = $(U.sel('#chat_textbox')).val();
        var encryptedHex = EncryptManager.encryptText(message);

        this.isSending = true;
            
        if(this.replyMeessageId == 0 && this.viewMode == CHATVIEW_THREADMODE){
            this.replyMeessageId = this.rootMessageId;
        }        
            
        apiClient.sendMessage(
            {
                chat_id:self.chatId,
                type:MESSAGE_TYPE_TEXT,
                text:encryptedHex,
                file_id:'',
                parent_id:this.replyMeessageId
            },
                
            function(data){
                
                self.isSending = false;
                $(U.sel('#chat_textbox')).val('');
                $(U.sel("#chat_textbox")).height(self.chatBoxDefaultHeight);
                Backbone.trigger(EVENT_MESSAGE_SENT,self.chatId);
                Backbone.trigger(EVENT_TB_HEIGHT_UPDATED);
                
                self.replyMeessageId = 0;


            },function(data){
                
                self.isSending = false;
                self.replyMeessageId = 0;
                
        });
            
    },
    setChatId : function(chatId){
        
        this.chatId = chatId;
        
    },
    growHeight:function(){
        
        if($(U.sel("#chat_textbox")).height() <= this.chatBoxMaxHeight){

            $(U.sel("#chat_textbox")).height($("#chat_textbox").height() + this.chatBoxDefaultHeight);
            Backbone.trigger(EVENT_TB_HEIGHT_UPDATED);
        
        }
        
    },
    startUpload:function(){
    
        this.isSending = true;
        $(U.sel('#chat_textbox_holder')).css('display','none');
        $(U.sel('#chat_progress_holder')).css('display','table-cell');
    },
    finishUpload:function(){
        
        this.isSending = false;
        $(U.sel('#chat_textbox_holder')).css('display','table-cell');
        $(U.sel('#chat_progress_holder')).css('display','none');
    },
    progressUpload:function(progress,text){

        if(!_.isUndefined(text)){
            $(U.sel('#chat_progress_holder .progress_bar')).css('width','100%');
            $(U.sel('#chat_progress_holder .progress_bar')).text(text);
        }else{
            progress = sprintf('%.1f',progress);
            $(U.sel('#chat_progress_holder .progress_bar')).text(progress + "%");
            $(U.sel('#chat_progress_holder .progress_bar')).css('width',progress + '%');
        }

    }
    
});
