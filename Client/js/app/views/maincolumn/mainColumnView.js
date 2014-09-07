var SPIKA_MainColumnView = Backbone.View.extend({
    
    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        var self = this;
        
        Backbone.on(EVENT_OPEN_PROFLIE, function(files) {
            
            require(['app/views/maincolumn/profileEditView','thirdparty/text!templates/maincolumn/profileEdit.tpl'
                    ],function (ProflieEditTmp,TempProfileEdit) {
                
                self.profileEditView = new SPIKA_ProflieEditView({
                    template: TempProfileEdit
                });
                
                self.showSubContent('proflie');
                mainView.mainColumnView.setCenterColumnTitle("Edit Proflie");
                windowManager.showCenterView();
            });
            
        });
        
        
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function(sizeObj) {
            self.updateWindowSize();
        });
        
        Backbone.on(EVENT_START_PRIVATE_CHAT, function(modelUser) {
            self.showMainContent();
        });
        
        Backbone.on(EVENT_START_GROUP_CHAT, function(modelGroup) {
            self.showMainContent();
        });
        
        Backbone.on(EVENT_START_CHAT_BY_CHATDATA, function(chatData) {
            self.showMainContent();
        });

        Backbone.on(EVENT_ENTER_CHAT, function(chatData) {
            self.setCenterColumnTitle(self.chatView.getChatName());
        });
                
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
    
    showSubContent: function(type){
        
        $(U.sel("#main_content")).hide();
        $(U.sel("#sub_content")).show();
        
        if(type == 'proflie'){
            $(U.sel("#sub_content")).html(this.profileEditView.render().el);
            this.updateWindowSize();
        }
        
    },

    updateWindowSize: function(){
    
        var windowHeight = U.getHeight();
        var headerHeight = $(U.sel('#main_top')).height();
        var mainViewHeight = windowHeight - headerHeight;
        $(U.sel('#sub_content')).height(mainViewHeight);
        $(U.sel('#main_content')).height(mainViewHeight);
        
        if(!_.isUndefined(this.profileEditView))
            this.profileEditView.updateWindowSize(mainViewHeight);
            
        if(!_.isUndefined(this.chatView))
            this.chatView.updateWindowSize(mainViewHeight);
    },
    
    showMainContent: function(){
        
        $(U.sel("#main_content")).show();
        $(U.sel("#sub_content")).hide();
        
    },
    
    setCenterColumnTitle : function(title){
        $(U.sel('#chat_title')).text(title);
    }
    
});
