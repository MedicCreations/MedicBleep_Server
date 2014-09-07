
var windowManager = {

    maxWidthForDesktopLayout:THREE_COLMODE_WIDTH,
    defaultSideColumnWidth:250,
    defaultTransitionDuration:200,
    window:null,
    displayType:0, // 0:desktop 1:mobile
    currentWindow:1, // 0:left 1;center 2:right
    init: function(){
        
        var self = this;
        
        if(WINDOW_MODE){
            $(window).resize(function() {
                self.updateWindowSize();
            });
        }

        
        this.updateWindowSize();
        
        $(U.sel('#navigation_open_left')).click(function(){
            self.openLeftMenu(true);
        });
        $(U.sel('#navigation_open_right')).click(function(){
            self.openRightMenu(true);
        });
        
        $(U.sel('#navigation_close_right')).click(function(){
            self.openMainFromRight(true);
        });
        
        $(U.sel('#navigation_close_left')).click(function(){
            self.openMainFromLeft(true);
        });
        
        Backbone.on(EVENT_START_PRIVATE_CHAT, function(modelUser) {
            self.showCenterView();
        });
        
        Backbone.on(EVENT_START_GROUP_CHAT, function(modelUser) {
            self.showCenterView();
        });
        
        Backbone.on(EVENT_START_CHAT_BY_CHATDATA, function(modelHistory) {
            self.showCenterView();
        });
        
        SPIKA_notificationManger.init();
        
    },
    showCenterView:function(){
        if(this.displayType == 1 && this.currentWindow == 0)
            this.openMainFromLeft(true);
            
        if(this.displayType == 1 && this.currentWindow == 2)
            this.openMainFromRight(true);
                
    },
    updateWindowSize:function(){
        
        var windowWidth = U.getWidth();
        var windowHeight = U.getHeight();
        
        this.currentWindowWidth = windowWidth;
        this.currentWindowHeight = windowHeight;
        
        Backbone.trigger(EVENT_WINDOW_SIZE_CHANGED,{width:windowWidth,height:windowHeight});


        $(".chat").css('width',windowWidth);
        $(".chat").css('height',windowHeight);
        
        if(!this.detectMob()){
            
            // desktop 
            this.displayType = 0;
            
            $(U.sel("#left_column" )).css('width',this.defaultSideColumnWidth);
            $(U.sel("#right_column" )).css('width',this.defaultSideColumnWidth);
            $(U.sel("#main_column" )).css('width',windowWidth-this.defaultSideColumnWidth * 2);

            $(U.sel("#left_column" )).css('left',0);
            $(U.sel("#main_column" )).css('left',this.defaultSideColumnWidth);
            $(U.sel("#right_column" )).css('left',windowWidth - this.defaultSideColumnWidth);

            $( U.sel("#left_column" )).css('display','block');
            $( U.sel("#right_column" )).css('display','block');
            $( U.sel("#main_column" )).css('display','block');
            
            $( U.sel("#navigation_open_left" )).css('display','none');
            $( U.sel("#navigation_close_left" )).css('display','none');
            $( U.sel("#navigation_open_right" )).css('display','none');
            $( U.sel("#navigation_close_right" )).css('display','none');
            

        }else{
            
            // mobile
            this.displayType = 1;
            
            $( U.sel("#main_column" )).css('width',windowWidth);
            $( U.sel("#left_column" )).css('width',windowWidth);
            $( U.sel("#right_column" )).css('width',windowWidth);

            $( U.sel("#left_column" )).css('left',0);
            $( U.sel("#main_column" )).css('left',0);
            $( U.sel("#right_column" )).css('left',0);
            
            $( U.sel("#left_column" )).css('display','none');
            $( U.sel("#right_column" )).css('display','none');
            $( U.sel("#main_column" )).css('display','block');
            
            $( U.sel("#navigation_open_left" )).css('display','block');
            $( U.sel("#navigation_close_left" )).css('display','inline');
            $( U.sel("#navigation_open_right" )).css('display','block');
            $( U.sel("#navigation_close_right" )).css('display','inline');
            
        }
        
        $( U.sel("#left_column" )).css('height',windowHeight);
        $( U.sel("#right_column" )).css('height',windowHeight);
        $( U.sel("#main_column" )).css('height',windowHeight);

    },
    openLeftMenu:function(animate){
        
        var duration = this.defaultTransitionDuration;
        if(animate == false)
            duration = 0;
            
        $(U.sel("#left_column")).css('display','block');
        $(U.sel("#left_column")).css('left', -1 * this.currentWindowWidth);
        
        $( U.sel("#left_column" )).animate({
            left: 0
        }, duration, function() {

        });

        $( U.sel("#main_column" )).animate({
            left: this.currentWindowWidth
        }, duration, function() {
            $(U.sel("#main_column")).css('display','none');
        });

        this.currentWindow = 0;
        
        Backbone.trigger(EVENT_OPEN_LEFTMENU);
        
    },
    openRightMenu:function(animate){

        var duration = this.defaultTransitionDuration;
        if(animate == false)
            duration = 0;


        $(U.sel("#right_column")).css('display','block');
        $(U.sel("#right_column")).css('left', this.currentWindowWidth);
        
        $( U.sel("#right_column" )).animate({
            left: 0
        }, duration, function() {

        });

        $(U.sel( "#main_column" )).animate({
            left: -1 * this.currentWindowWidth
        }, duration, function() {
            $(U.sel("#main_column")).css('display','none');
        });
        
        this.currentWindow = 2;

    },
    openMainFromRight:function(animate){

        var duration = this.defaultTransitionDuration;
        if(animate == false)
            duration = 0;

        $(U.sel("#main_column")).css('left', -1 * this.currentWindowWidth);
        $(U.sel("#main_column")).css('display','block');

        $( U.sel("#right_column" )).animate({
            left: this.currentWindowWidth
        }, duration, function() {
            $(U.sel("#right_column")).css('display','none');
        });

        $( U.sel("#main_column" )).animate({
            left: 0
        }, duration, function() {

        });
        
        this.currentWindow = 1;

    },
    
    openMainFromLeft:function(animate){

        var duration = this.defaultTransitionDuration;
        if(animate == false)
            duration = 0;

        $(U.sel("#main_column")).css('left', this.currentWindowWidth);
        $(U.sel("#main_column")).css('display','block');

        $( U.sel("#left_column" )).animate({
            left: -1 * this.currentWindowWidth
        }, duration, function() {
            $(U.sel("#left_column")).css('display','none');
        });

        $( U.sel("#main_column" )).animate({
            left: 0
        }, duration, function() {

        });
        
        this.currentWindow = 1;

    },
    detectMob:function(){
        if(U.getWidth() <= this.maxWidthForDesktopLayout) {
            return true;
        } else {
            return false;
        }
    }
};

var SPIKA_MainView = Backbone.View.extend({
    
    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;

        require(['app/views/rightcolumn/rightColumnView','thirdparty/text!templates/rightcolumn/rightColumn.tpl',
                    'app/views/leftcolumn/leftColumnView','thirdparty/text!templates/leftcolumn/leftColumn.tpl',
                    'app/views/maincolumn/mainColumnView','thirdparty/text!templates/maincolumn/mainColumn.tpl',
                    
                ],function (RightColumnViewTmp,TemplateRight,
                            LeftColumnViewTmp,TemplateLeft,
                            MainColumnView,TemplateMain) {
                    
            self.leftColumnView = new SPIKA_LeftColumnView({
                template: TemplateLeft
            });

            self.rightColumnView = new SPIKA_RightColumnView({
                template: TemplateRight
            });
            
            self.mainColumnView = new SPIKA_MainColumnView({
                template: TemplateMain
            });
            
            self.onload();

        });
        
        return this;
        
    },
    
    onload: function(){
        
        var self = this;
        
        $(U.sel("#content")).css('opacity',0);
        $(U.sel("#left_column")).html(this.leftColumnView.render().el);
        $(U.sel("#right_column")).html(this.rightColumnView.render().el);
        $(U.sel("#main_column")).html(self.mainColumnView.render().el);
        
        // chat view should loaded last for event handling

        
        windowManager.init();

        if(windowManager.displayType == 1){
            windowManager.openLeftMenu(false);
        }
        
        $( U.sel("#content" )).animate({
            opacity:1.0
        }, 500, function() {
            
        });

    }
        
});

