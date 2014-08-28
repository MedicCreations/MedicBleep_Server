var SPIKA_ChatProfileView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        var self = this;

        
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
        
        
        
        
    },
    
    startNewChat: function(modelChat){
        
        this.currentChatData = modelChat;

        $(U.sel('#chatproflie_image')).attr('src',"img/default_group.png");
        $(U.sel('#chatproflie_image')).attr('state',"loading");
        $(U.sel('#chatproflie_title')).html(modelChat.get('chat_name'));
        
        EncryptManager.decryptImage($(U.sel('#chatproflie_image')),modelChat.get('image_thumb'),0,apiClient);
        
    }   
    
});

