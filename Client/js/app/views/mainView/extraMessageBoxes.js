var SPIKA_ExtraMessageBoxesView = Backbone.View.extend({
    
    isOpened : false,
    chatId: 0,
    localMediaStream: null,
    postBoxView: null,
    initialize: function(options) {
        
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_CLICK_ANYWHARE, function() {

            if(self.isOpened)
                self.hide();
        });
        
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
        
        $$('header .userprofile').click(function(){
            self.showContextMenu(); 
        });
        
        $$('#extra_message_box li').mouseover(function(){
            $(this).addClass('selected');
        });
        
        $$('#extra_message_box li').mouseleave(function(){
            $(this).removeClass('selected');
        });
        
        $$('#extra_message_box').mouseleave(function(){
            self.hide();
        });
        
        $$('#extramessage_btn_file').click(function(){
            
            if(self.chatId == 0){
                return;
            }
        
            $$("#btn_dummy_file_upload").click();
            
        });

        
        // Source Code //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $$('#extramessage_btn_code').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_code textarea').val('');
            self.openSourceCodeDialog();
            
        });

        // take picture
        $$('#extramessage_dialog_view_code .alert_bottom_ok').click(function(){
            
            var text = $$('#extramessage_dialog_view_code textarea').val();
            
            var encryptedHex = EncryptManager.encryptText(text);
            
            var data = {
                    chat_id:self.chatId,
                    type:MESSAGE_TYPE_TEXT,
                    text:encryptedHex,
                    file_id:'',
                    parent_id:self.postBoxView.replyMeessageId,
                    attributes:{
                        textType:'code'
                    }
            };

            self.postBoxView.sendTextMessage(data);
            $$('#extramessage_dialog_view_code').fadeOut();
            
        });
        
        $$('#extramessage_dialog_view_code .alert_bottom_cancel').click(function(){
            
            $$('#extramessage_dialog_view_code').fadeOut();
            
        });
        
        // Picture events //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        $$('#extramessage_btn_picture').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            self.startTakingPicture();
            
        });
        
        // take picture
        $$('#extramessage_dialog_view_takepicture .alert_bottom_ok').click(function(){
            

            Webcam.snap( function(data_uri, canvas, context) {
                
                Webcam.reset();
                
                if(_.isNull(canvas))
                    return;
                    
                var ctx = canvas.getContext('2d');
                
                setTimeout(function() {
                
                    //canvas.width = WEBCAMPIC_HEIGHT;
                    //canvas.height = WEBCAMPIC_HEIGHT;
    
                    var dataURL = canvas.toDataURL('image/jpeg');
                    var blob = dataURItoBlob(dataURL);
                    blob.name = 'picture.jpeg';
    
                    var files = [];
                    files.push(blob);
                    Backbone.trigger(EVENT_FILE_DROP,files);
                    
                    $$('#extramessage_dialog_view_takepicture').fadeOut();
                    
                }, 100);


            } );
            
        });
        
        $$('#extramessage_dialog_view_takepicture .alert_bottom_cancel').click(function(){
            
            Webcam.reset();
            $$('#extramessage_dialog_view_takepicture').fadeOut();
            
        });
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    },
    
    show : function(){
        
        var self = this;
        
        if(self.isOpened)
            return;
            
        _.debounce(function() {
            $$('#extra_message_box').css('display','block');
            self.isOpened = true;
        }, 100)();
  
    },
    
    hide : function(){
        
        $$('#extra_message_box').css('display','none');
        this.isOpened = false;
        
    },
    
    stopPlayingVideo:function(selector){
        
        if (this.localMediaStream) {
            this.localMediaStream.getVideoTracks[0].close();
        }
                
    },
    startTakingPicture:function(){
        
        var self = this;

        $$('#extramessage_dialog_view_takepicture').fadeIn(function(){
            
            Webcam.attach( '#extramessage_dialog_view_takepicture .video_preview' );

        });


    },
    
    openSourceCodeDialog:function(){
        
        $$('#extramessage_dialog_view_code').fadeIn(function(){
            
            

        });
        
    }
    
    
});