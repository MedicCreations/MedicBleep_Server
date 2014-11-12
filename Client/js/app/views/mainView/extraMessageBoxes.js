var SPIKA_ExtraMessageBoxesView = Backbone.View.extend({
    
    isOpened : false,
    chatId: 0,
    localMediaStream: null,
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

        $$('#extramessage_btn_picture').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            self.startTakingPicture();
            
        });
        
        // Picture events //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        
        // take picture
        $$('#extramessage_dialog_view_takepicture .alert_bottom_ok').click(function(){
            
            var canvas = $$('#extramessage_dialog_view_takepicture canvas')[0];
            var video = $$('#extramessage_dialog_view_takepicture video')[0];
            var ctx = canvas.getContext('2d');
            
            setTimeout(function() {
            
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                if (self.localMediaStream) {
                    ctx.drawImage(video, 0, 0);
                    var dataURL = canvas.toDataURL('image/jpeg');
                    var blob = dataURItoBlob(dataURL);
                    blob.name = 'picture.jpeg';
    
                    var files = [];
                    files.push(blob);
                    Backbone.trigger(EVENT_FILE_DROP,files);
                    
                }
                $$('#extramessage_dialog_view_takepicture').fadeOut();
                
            }, 100);

            
        });
        
        $$('#extramessage_dialog_view_takepicture .alert_bottom_cancel').click(function(){
            
            self.stopPlayingVideo('#extramessage_dialog_view_takepicture video');
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
            
            var hdConstraints = {
              video: {
                mandatory: {
                  minWidth: 1280,
                  minHeight: 720
                }
              }
            };

            
            var video = $$('#extramessage_dialog_view_takepicture video')[0];
            
            if (U.canUseVideo()) {
                
                U.getUserMedia(hdConstraints, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    self.localMediaStream = stream;
                },function(){
                
                });
              
            } else {
              
              
              
            }
            
        });


    }
    
    
});