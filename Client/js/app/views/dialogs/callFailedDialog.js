var SPIKA_CallFailedDialog = Backbone.View.extend({
    
    initialize: function(options) {
        this.template = options.template;
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
            
    }
    
});

var SPIKA_CallFailedDialogManager = {

    template : '<div id="dialog_view" style="display:none"> <div id="alert_box"> <div id="alert_title"> <a href=""> <i class="fa fa-times fa-2x"></i> </a> </div> <div id="alert_content"> </div> <div id="alert_bottom"> <a href="javascript:void(0)" id="alert_bottom_ok"> Close </a> <a href="javascript:void(0)" id="alert_bottom_voice_message"> Leave voice message </a> <a href="javascript:void(0)" id="alert_bottom_video_message"> Leave video message </a> </div> </div> </div>',
    
    show : function(title,text,onOK,onVoice,onVideo){
        
        var self = this;
        
        var theView = new SPIKA_CallFailedDialog({
            template: this.template
        });
            
        $(HOLDER).append(theView.render().el);
        
        $$('#alert_title').text(title);
        $$('#alert_content').text(text);

        $$('#alert_bottom_ok').unbind().click(function(){
             self.hide(onOK);
        });
                    
        $$('#alert_bottom_voice_message').unbind().click(function(){
             self.hide(onVoice);
        });
                    
        $$('#alert_bottom_video_message').unbind().click(function(){
             self.hide(onVideo);
        });
                    
        $$('#dialog_view').fadeIn();
        
    },
    hide : function(callback){
    
        $$('#dialog_view').fadeOut(function(){
            
            $$('#dialog_view').remove();
            
            if(!_.isUndefined(callback))
                callback();
        });
            
    }
}


