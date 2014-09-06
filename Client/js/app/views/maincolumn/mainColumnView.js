var SPIKA_MainColumnView = Backbone.View.extend({
    
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
        
        require(['app/views/maincolumn/chat/chatView','thirdparty/text!templates/maincolumn/chat/chat.tpl'
                ],function (ChatViewTmp,TempChat) {
            
            self.chatView = new SPIKA_ChatView({
                template: TempChat
            });
            
            self.onload();
            
        });
        
        return this;
        
    },
    
    onload: function(){
        
        $(U.sel("#main_content")).html(this.chatView.render().el);
        
    },
    
});
