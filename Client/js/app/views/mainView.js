var SPIKA_MainView = Backbone.View.extend({
    
    currentWindowWidth: 0,
    currentWindowHeight: 0,
    leftSideBar: null,
    chatView: null,
    infoView: null,
    initialize: function(options) {
    
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_OPEN_CHATPROFLIE, function(chatId) {
            
            if(_.isEmpty(chatId) || chatId == 0)
                return;
            
            self.infoView.showChatProfile(chatId);

            
        });
        
        Backbone.on(EVENT_OPEN_PROFLIE, function(userId) {
            
            if(_.isEmpty(userId) || userId == 0)
                return;
            
            self.infoView.showUserProfile(userId);

            
        });

        Backbone.on(EVENT_CLICK_ANYWHARE, function() {
            self.hideContextMenu(); 
            self.infoView.hide();
        });
        

        Backbone.on(EVENT_FORCE_LOGOUT, function() {
            U.goPage("logout");
        });
        
        this.sendKeepAlive();
    },
    
    sendKeepAlive: function(){
        
        if(SPIKA_UserManager.isAuthorised() == false){
            U.l('user not logined');
            return;
        }
        
        var self = this;

        apiClient.sendKeepAlive(function(data){

            _.debounce(function() {
                
                self.sendKeepAlive();
                
            }, 10000)();
            
        },function(data){
            
            _.debounce(function() {
                
                self.sendKeepAlive();
                
            }, 10000)();

        });

    },
    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        // load sidebar
        require([
            'app/views/infoView/infoView',
            'thirdparty/text!templates/infoView/infoView.tpl',
            'app/views/leftSideBar/leftSideBarContainer',
            'thirdparty/text!templates/leftSideBar/leftSiderBarContainer.tpl',
            'app/views/mainView/chatView',
            'thirdparty/text!templates/mainView/chatView.tpl'
        ], function (
            InfoView,InfoViewTemplate,
            LeftSideBar,LeftSideBarTemplate,
            ChatView,ChatViewTemplate
            ) {
            
            self.infoView = new SPIKA_InfoView({
                template: InfoViewTemplate
            });

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
        $$('').append(self.infoView.render().el);
        
        $$('header .userprofile').click(function(){
            self.showContextMenu(); 
        });
        
        $$('header .userprofile').mouseover(function(){
            self.showContextMenu(); 
        });
        
        $$('#user_menu').mouseleave(function(){
            self.hideContextMenu(); 
        });
        
        $$('').click(function(){
            Backbone.trigger(EVENT_CLICK_ANYWHARE); 
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
    
    setRoomTitle:function(title,chatId){
        
        $$('header span#maintitle').html(title + ' <i chatid="' + chatId + '" class="fa fa-info-circle"></i>');
        document.title = title;

        
        $$('header #maintitle i').click(function(){
            
            var chatId = $(this).attr('chatid');
            
            Backbone.trigger(EVENT_OPEN_CHATPROFLIE,chatId);
                
        });
        
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

