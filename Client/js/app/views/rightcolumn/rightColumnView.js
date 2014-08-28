var SPIKA_RightColumnView = Backbone.View.extend({
    
    currentChatData:null,
    displayMode: RIGHTCOLUMN_DISPLAYMODE_NORMALCHAT,
    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        var self = this;
                
        Backbone.on(EVENT_ENTER_CHAT, function(modelChat) {
            
            self.startNewChat(modelChat);
            
        });
        
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;
        
        require(['app/views/rightcolumn/chatProflieView','thirdparty/text!templates/rightcolumn/chatProfile.tpl',
                    'app/views/rightcolumn/chatMemberView','thirdparty/text!templates/rightcolumn/chatMember.tpl'
                ],function (ChatProflieViewTmp,TemplateChatProflieView,
                            ChatMemberViewTmp,TemplateChatMemberView
                            ) {
                    
            self.chatProfileView = new SPIKA_ChatProfileView({
                template: TemplateChatProflieView
            });

            self.chatMemberView = new SPIKA_ChatMemberView({
                template: TemplateChatMemberView
            });

            self.onload();
            
        });
        
        return this;
        
    },
    
    onload: function(){

        // handle sending message
        $(U.sel('.tab_holder li')).click(function(){
        
            $(U.sel('.tab_holder li')).removeClass('active');
            $(this).addClass('active');
            
            var contentId = $(this).attr('content');
            
            $(U.sel('#right_col_holder1')).css('display','none');
            $(U.sel('#right_col_holder2')).css('display','none');
            $(U.sel('#user_profile_holder')).css('display','none');

            $(U.sel('#' + contentId)).css('display','block');

        });
        
        $(U.sel("#right_col_holder1")).html(this.chatProfileView.render().el);
        $(U.sel("#right_col_holder2")).html(this.chatMemberView.render().el);
        
    },
    
    startNewChat: function(modelChat){
        
        this.currentChatData = modelChat;
        
        if(modelChat.get('group_id') != 0){
            this.displayMode = RIGHTCOLUMN_DISPLAYMODE_GROUPCHAT;
        }
        
        if(this.displayMode == RIGHTCOLUMN_DISPLAYMODE_NORMALCHAT){
            
        }
        

        this.chatProfileView.startNewChat(this.currentChatData);
        this.chatMemberView.startNewChat(this.currentChatData);
            

    }   
});
