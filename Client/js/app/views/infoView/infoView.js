var SPIKA_InfoView = Backbone.View.extend({
    
    selector : '#user_profile',
    userProfileView: null,
    roomProfileView: null,
    showing:false,
    opened:false,
    initialize: function(options) {
    
        var self = this;
        
        this.template = options.template;
        
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
    },

    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        require([
            'app/views/infoView/roomProfileView',
            'thirdparty/text!templates/infoView/roomProfileView.tpl',
            'app/views/infoView/userProfileView',
            'thirdparty/text!templates/infoView/userProfileView.tpl'
        ], function (RoomProfileView,RoomProfileViewTemplate,
                        UserProfileView,UserProfileViewTemplate) {
            
            self.userProfileView = new SPIKA_UserProfileView({
                template: UserProfileViewTemplate
            });

            self.roomProfileView = new SPIKA_RoomProfileView({
                template: RoomProfileViewTemplate
            });

            self.onload();
            
        });
              
        return this;
    },
    
    onload : function(){

        var self = this;
        this.updateWindowSize();
        
    },

    
    updateWindowSize: function(){
        U.setViewHeight($$(this.selector),[
        ])
    },
    
    hide: function(){
        
        if(this.showing)
            return;
        
        this.opened = false;
        
        var width = $$(this.selector).width();
        
        $$(this.selector).animate({
            right: -1 * width
        }, 500, function() {
            $(this.selector).css('display','none');
        });
          
    },
    showChatProfile : function(chatId){
        
        var self = this;
        
        this.showing = true;
        this.opened = true;
    
        var width = $$(this.selector).width();

        $$(this.selector).css('right',-1 * width);
        $$(this.selector).css('display','block');
        
        $$(this.selector).animate({
            right: 0
        }, 500, function() {
            self.showing = false;
            
            $$(self.selector).html(self.roomProfileView.render().el);
            self.roomProfileView.showRoom(chatId);
        });

        
        
    },
    showUserProfile : function(userId){
        
        var self = this;
        
        this.showing = true;
        this.opened = true;

        var width = $$(this.selector).width();

        $$(this.selector).css('right',-1 * width);
        $$(this.selector).css('display','block');
        
        $$(this.selector).animate({
            right: 0
        }, 500, function() {
            self.showing = false;

            $$(self.selector).html(self.userProfileView.render().el);
            self.userProfileView.showUser(userId);

        });
                
    } 
});