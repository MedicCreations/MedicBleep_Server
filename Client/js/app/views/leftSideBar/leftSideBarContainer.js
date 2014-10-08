var SPIKA_LeftSideBar = Backbone.View.extend({
    
    roomListView: null,
    initialize: function(options) {
    
        this.template = options.template;


    },

    render: function() {
        
        var self = this;

        var template = _.template(this.template);
        $(this.el).html(template(LANG));

        // load all subcontent
        require([
            'app/views/leftSideBar/roomListView',
            'thirdparty/text!templates/leftSideBar/roomListView.tpl'
        ], function (LeftSideBar,RoomListViewTemplate) {
            
            self.roomListView = new SPIKA_RoomListView({
                template: RoomListViewTemplate
            });
            
            self.onload();
            
        });
        
        
        return this;
    },
    
    onload : function(){

        var self = this;
        
        $('#menu_container_room').html(self.roomListView.render().el);
        
        $$('#tab_menu li').click(function(){
            
            var clickedTab = this;
            
            $$('#tab_menu li').each(function(){
               var tabIndex = $(this).attr('tab');
               $(this).removeClass('selected'); 
               $$("#" + tabIndex).css('display','none');
            });
            
            $(clickedTab).addClass('selected');
            var clickedTabIndex = $(clickedTab).attr('tab');
            $$("#" + clickedTabIndex).css('display','block');
            
        });
        
    }
});