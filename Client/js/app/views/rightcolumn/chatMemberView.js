var SPIKA_ChatMemberView = Backbone.View.extend({

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
        
        var self = this;
        
        apiClient.getChatMembers(modelChat.get('chat_id'),function(data){
            
            self.chatMembers = userFactory.createCollectionByAPIResponse(data);
            
            var template = _.template($(U.sel('#template_memberlist_row')).html(), {users: self.chatMembers.models});
            $(U.sel("#chatmember_holder")).html(template);
            
            
        },function(data){
            
            $(U.sel("#chatmember_holder")).html("");

        });
        
        
    }   
    
});
