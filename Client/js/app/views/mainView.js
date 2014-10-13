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
        
        $$('header .userprofile').click(function(){
            self.showContextMenu(); 
        });
        
        $$('header .userprofile').mouseover(function(){
            self.showContextMenu(); 
        });
        
        $$('#user_menu').mouseleave(function(){
            self.hideContextMenu(); 
        });
        
        this.updateUserInfo();
        
    },
    
    updateWindowSize:function(){
        
        var windowWidth = U.getWidth();
        var windowHeight = U.getHeight();
        
        this.currentWindowWidth = windowWidth;
        this.currentWindowHeight = windowHeight;
        
        Backbone.trigger(EVENT_WINDOW_SIZE_CHANGED);

    }, 
    
    setTitle:function(title){
        
        $$('header span#maintitle').text(title);
        document.title = title;
        
    },
    
    showContextMenu: function(){
        $$('#user_menu').css('display','block');        
    },
    
    hideContextMenu: function(){
        $$('#user_menu').css('display','none');
    },
    
    updateUserInfo: function(){
        
        apiClient.getUserById(SPIKA_UserManager.getUser().get('id'),function(data){
            
            var modelUser = userFactory.createModelByAPIResponse(data.user);
            SPIKA_UserManager.setUser(modelUser);
            
            var text = modelUser.get('firstname') + " " + modelUser.get('lastname');
            
            // add websocket icon
            if(SPIKA_notificationManger.websocketMode)
                text += ' <i class="fa fa-plug"></i>';
                
            $$('.userprofile span').html(text);
            
            EncryptManager.decryptImage($$('.userprofile img'),modelUser.get('image_thumb'),0,apiClient,function(){
                
            },function(){

            });
    
        },function(data){
            
            
            
        });
        
    }
    
    
    
});
