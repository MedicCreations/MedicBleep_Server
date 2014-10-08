var SPIKA_MainView = Backbone.View.extend({
    
    currentWindowWidth: 0,
    currentWindowHeight: 0,
    leftSideBar: null,
    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        
        var template = _.template(this.template);
        $(this.el).html(template(LANG));
        
        var self = this;
        
        // load sidebar
        require([
            'app/views/leftSideBar/leftSideBarContainer',
            'thirdparty/text!templates/leftSideBar/leftSiderBarContainer.tpl'
        ], function (LeftSideBar,LeftSideBarTemplate) {
            
            self.leftSideBar = new SPIKA_LeftSideBar({
                template: LeftSideBarTemplate
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
        $('#left_sidebar').html(self.leftSideBar.render().el);

    },
    
    updateWindowSize:function(){
        
        var windowWidth = U.getWidth();
        var windowHeight = U.getHeight();
        
        this.currentWindowWidth = windowWidth;
        this.currentWindowHeight = windowHeight;
        
        Backbone.trigger(EVENT_WINDOW_SIZE_CHANGED);

    }
    
    
});
