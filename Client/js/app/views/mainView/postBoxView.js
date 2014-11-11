var SPIKA_PostBoxView = Backbone.View.extend({
    
    chatId: 0,
    isSending: false,
    replyMeessageId: 0,
    filesQueue:null,
    processingFileIndex:0,
    chatBoxMaxHeight: 100,
    chatBoxDefaultHeight: 28,
    chatBoxGrowHeight: 20,
    viewMode:CHATVIEW_LISTMODE,
    initialize: function(options) {
        
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_LEAVE_CHAT, function() {
             self.chatId = 0;
        });
        
        Backbone.on(EVENT_ENTER_CHAT, function(chatId) {
            
            self.chatId = chatId;
            
            if(mainView.chatView.chatData.get('is_active') == 0){
                $$("#chat_textbox").attr('disabled','disabled');
                $$("#chat_textbox").attr('placeholder',LANG.roomdisabled);
                
                
            }else{
                $$("#chat_textbox").removeAttr('disabled');
                $$("#chat_textbox").attr('placeholder',LANG.textboxplaceholer);
            }
            
            $$("#chat_textbox").val('');

        });
    
        // drop file
        Backbone.on(EVENT_FILE_DROP, function(files) {

            if(_.isUndefined(files)){
                return;
            }
            
            self.filesQueue = files;
            self.processingFileIndex = 0;
            self.startProcessQueue();
            
        });
        
    },

    render: function() {
        
        var template = _.template(this.template);
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    onload : function(){

        var self = this;

        $$("#chat_textbox").keypress(function(event) {
            
            if(event.which == 13 && event.shiftKey){
                self.growHeight();
                return true;
            }else if(event.which == 13){
                
                self.sendMessage();
                return false;
            }
            
            return true;
            
        });
        
        $$('#btn_send').click(function(){
            self.sendMessage();
        });

        // dummy file upload click
        $$('#btn_upload_file').click(function(){
        
            if(self.chatId == 0){
                return;
            }
        
            $$("#btn_dummy_file_upload").click();
            
            
        });
        
        $$("#btn_dummy_file_upload").change(function (evt){

            if(self.chatId == 0){
                return;
            }

            if(self.processingFileIndex > 0)
                return;
                
            var files = evt.target.files; // FileList object
            
            // files is a FileList of File objects. List some properties.
            var output = [];
            
            self.filesQueue = files;
            self.processingFileIndex = 0;
            self.startProcessQueue();

        });


    },

    sendMessage : function(){
        
        if(this.isSending == true)
            return;
            
        if(this.chatId == 0){
            return;
        }
        
        var self = this;
        var message = $$('#chat_textbox').val();
        
        if(_.isEmpty(message))
            return;
        
        $$('#chat_textbox').height(self.chatBoxDefaultHeight);   
        
        var encryptedHex = EncryptManager.encryptText(message);

        this.isSending = true;
            
        if(this.replyMeessageId == 0 && this.viewMode == CHATVIEW_THREADMODE){
            this.replyMeessageId = this.rootMessageId;
        }        
        
        //$$('#chat_textbox').attr('disabled','disabled');
        //$$('#chat_textbox').addClass('disabled');
        $$('#chat_textbox').val('');
        
        var data = {
                chat_id:self.chatId,
                type:MESSAGE_TYPE_TEXT,
                text:encryptedHex,
                file_id:'',
                parent_id:this.replyMeessageId
        };
        
        Backbone.trigger(EVENT_MESSAGE_SENDING,data);
        
        apiClient.sendMessage(data,
            function(data){
                
                self.isSending = false;
                
                //$$('#chat_textbox').removeAttr('disabled');
                //$$('#chat_textbox').removeClass('disabled');
                
                Backbone.trigger(EVENT_MESSAGE_SENT,self.chatId);
                
                /*
                $(U.sel('#chat_textbox')).val('');
                $(U.sel("#chat_textbox")).height(self.chatBoxDefaultHeight);
                Backbone.trigger(EVENT_MESSAGE_SENT,self.chatId);
                Backbone.trigger(EVENT_TB_HEIGHT_UPDATED);
                
                self.replyMeessageId = 0;
                */

            },function(data){
                
                self.isSending = false;
                
        });
            
    },
    
    startProcessQueue:function(){

        var self = this;
        
        if(this.processingFileIndex >= this.filesQueue.length){
            this.processingFileIndex = 0;
            SPIKA_ProgressManager.hide();
            return;
        }
        
        var f = this.filesQueue[this.processingFileIndex];
            
        self.startUpload();
        
        _.debounce(function() {

    
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
                
                Backbone.trigger(EVENT_MESSAGE_SENDING,data);
                
                apiClient.sendMessage(data,function(data){
                    $$('#chat_textbox').val('');
                    self.finishUpload();
                    Backbone.trigger(EVENT_MESSAGE_SENT,self.chatId);
                },function(data){
                    
                    
                });
                
            },function(){
                
                self.finishUpload();
                
            },function(progress,text,title){
                
                self.progressUpload(progress,text,title);
                
            });
            
        }, 500)();
        
              
    },
    startUpload:function(){
        this.isSending = true;
        SPIKA_ProgressManager.show();
    },
    finishUpload:function(){
        
        var self = this;
        
        this.isSending = false;        
        this.processingFileIndex++;

        _.debounce(function() {
            self.startProcessQueue();
        }, 500)();
        
        
    },
    progressUpload:function(progress,text,filename){
        SPIKA_ProgressManager.setTitle(filename);
        SPIKA_ProgressManager.setText(text);
        SPIKA_ProgressManager.setProgress(progress);
    },
    growHeight:function(){
        
        if($$('#chat_textbox').height() <= this.chatBoxMaxHeight){
            $$('#chat_textbox').height($("#chat_textbox").height() + this.chatBoxGrowHeight);        
        }
        
    },
    
    
});
