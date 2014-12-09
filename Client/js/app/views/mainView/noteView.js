var SPIKA_NoteView = Backbone.View.extend({
    
    holderSelector: "#main_container #note_holder",
    initialize: function(options) {
        
        var self = this;
        
        this.template = options.template;
        
        $$('#main_container').append(this.render().el);
        
        Backbone.on(EVENT_CLICK_ANYWHARE, function() {
            //$$(self.holderSelector).fadeOut();
        });

        Backbone.on(EVENT_OPEN_NOTE, function() {
            $$(self.holderSelector).fadeIn();
            self.refresh();
        });

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });

        Backbone.on(EVENT_ENTER_CHAT, function(chatId) {
            self.refresh();
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
        
        this.updateWindowSize();

        
        $$(this.holderSelector + " .close").unbind().click(function(){
            
            $$(self.holderSelector).fadeOut();
            
        });

        $$(this.holderSelector + " .save").unbind().click(function(){
            
            $$(self.holderSelector + " .save").addClass('gray');
            $$(self.holderSelector + " .save").text(LANG.saving);
            
            self.save(function() {
                
                $$(self.holderSelector + " .save").removeClass('gray');
                $$(self.holderSelector + " .save").text(LANG.save);
                
            });
            
        });

        
    },

    updateWindowSize: function(){

        U.setViewHeight($$(this.holderSelector),[
            $$('header'),$$('footer')
        ]);
        
        $$(this.holderSelector).width($$("#main_container").width() / 3);
        
        $$("#main_container #note_holder textarea").width($$(this.holderSelector).width() - 20);
        $$(this.holderSelector + " textarea").height($$(this.holderSelector).height() - $$('#note_holder .note_footer').height() - 15);
    },
    
    refresh: function(){
        
        apiClient.getChatNote(mainView.chatView.chatData.get("chat_id"),function(data){

            $$("#main_container #note_holder textarea").val(data.note);
                        
        },function(data){

            //SPIKA_AlertManager.show(LANG.general_errortitle,LANG.chat_loadfailed);
            
        });    
        
    },
    
    save: function(finished){
        
        apiClient.saveChatNote(
                        mainView.chatView.chatData.get("chat_id"),
                        $$("#main_container #note_holder textarea").val(),function(data){
            
            U.l(data);
            
            $$("#main_container #note_holder textarea").val(data.note);
            
            if(!_.isUndefined(finished))
                finished();
            
        },function(data){

            if(!_.isUndefined(finished))
                finished();
            
        });    
        

        
    }


});