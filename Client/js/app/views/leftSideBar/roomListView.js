var SPIKA_RoomListView = Backbone.View.extend({
    
    roomListView: null,
    initialize: function(options) {
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
    },

    render: function() {
        
        var template = _.template(this.template);
        $(this.el).html(template(LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();


        return this;
    },
    
    onload : function(){

        var self = this;
        
        self.updateWindowSize();
        
    },
    
    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_room .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_room .menu_search')
        ])
    }
    
    
});