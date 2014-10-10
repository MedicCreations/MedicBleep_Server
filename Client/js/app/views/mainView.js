var SPIKA_MainView = Backbone.View.extend({
    
    currentWindowWidth: 0,
    currentWindowHeight: 0,
    leftSideBar: null,
    chatView: null,
    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        // load sidebar
        require([
            'app/views/leftSideBar/leftSideBarContainer',
            'thirdparty/text!templates/leftSideBar/leftSiderBarContainer.tpl',
            'app/views/mainView/chatView',
            'thirdparty/text!templates/mainView/chatView.tpl'
        ], function (
            LeftSideBar,LeftSideBarTemplate,
            ChatView,ChatViewTemplate
            ) {
            
            self.leftSideBar = new SPIKA_LeftSideBar({
                template: LeftSideBarTemplate
            });
            
            self.chatView = new SPIKA_ChatView({
                template: ChatViewTemplate
            });
            
            self.onload();
            
        });
        
        $(window).resize(function() {
            self.updateWindowSize();
        });
        return this;
    },
    
    onload : function(){

        var self = this;
        $$('#left_sidebar').html(self.leftSideBar.render().el);
        $$('#main_container').html(self.chatView.render().el);

    },
    
    updateWindowSize:function(){
        
        var windowWidth = U.getWidth();
        var windowHeight = U.getHeight();
        
        this.currentWindowWidth = windowWidth;
        this.currentWindowHeight = windowHeight;
        
        Backbone.trigger(EVENT_WINDOW_SIZE_CHANGED);

    }, 
    
    setTitle:function(title){
        
        $$('header').text(title);
        document.title = title;
        
    }
    
    
});
