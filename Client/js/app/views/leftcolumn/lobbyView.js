var SPIKA_LobbyView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        this.lobbyData = null;
        
        var self = this;
        
        Backbone.on(EVENT_NEW_MESSAGE, function(chatId) {
        
            // if chat id is null the signal is for rehresshing lobby
            if(_.isNull(chatId))
                self.newMessage();
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
        this.newMessage();
    },
    
    newMessage : function(){
        
        var self = this;
        
        apiClient.lobby(function(data){
            
            self.lobbyData = historyFactory.createCollectionByAPIResponse(data);
            
            var template = _.template($(U.sel('#template_history_row')).html(), {history: self.lobbyData.models});
            $(U.sel("#history_list")).html(template);

            $(U.sel('#history_list li')).click(function(){
               Backbone.trigger(EVENT_START_CHAT_BY_CHATDATA,self.lobbyData.searchById($(this).attr('data-chatid')));
               return false;
            });
                        
        },function(data){
            
            

        });
        
    }
        
});
