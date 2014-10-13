var SPIKA_LeftSideBar = Backbone.View.extend({
    
    lobbyListView: null,
    roomListView: null,
    userListView: null,
    groupListView: null,
    initialize: function(options) {
    
        this.template = options.template;


    },

    render: function() {
        
        var self = this;

        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));

        // load all subcontent
        require([
            'app/views/leftSideBar/lobbyListView',
            'thirdparty/text!templates/leftSideBar/lobbyListView.tpl',
            'app/views/leftSideBar/roomListView',
            'thirdparty/text!templates/leftSideBar/roomListView.tpl',
            'app/views/leftSideBar/userListView',
            'thirdparty/text!templates/leftSideBar/userListView.tpl',
            'app/views/leftSideBar/groupListView',
            'thirdparty/text!templates/leftSideBar/groupListView.tpl',
            'app/views/leftSideBar/listView'
        ], function (lobbyListView,LobbyListViewTemplate,
                        roomListView,RoomListViewTemplate,
                        userListView,UserListViewTemplate,
                        groupListView,GroupListViewTemplate) {
            
            self.lobbyListView = new SPIKA_LobbyListView({
                template: LobbyListViewTemplate
            });
            
            self.roomListView = new SPIKA_RoomListView({
                template: RoomListViewTemplate
            });
            
            self.userListView = new SPIKA_UserListView({
                template: UserListViewTemplate
            });
            
            self.groupListView = new SPIKA_GroupListView({
                template: GroupListViewTemplate
            });
            
            self.onload();
            
        });
        
        
        return this;
    },
    
    onload : function(){

        var self = this;
        
        $$('#menu_container_lobby').html(self.lobbyListView.render().el);
        $$('#menu_container_room').html(self.roomListView.render().el);
        $$('#menu_container_user').html(self.userListView.render().el);
        $$('#menu_container_group').html(self.groupListView.render().el);

        $$('#menu_container_lobby').css('display','block');
        $$('#menu_container_room').css('display','none');
        $$('#menu_container_user').css('display','none');
        $$('#menu_container_group').css('display','none');

        
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
            
            if(clickedTabIndex.search('lobby') != -1)
                self.lobbyListView.onOpen();

            if(clickedTabIndex.search('room') != -1)
                self.roomListView.onOpen();
                
            if(clickedTabIndex.search('user') != -1)
                self.userListView.onOpen();
                
            if(clickedTabIndex.search('group') != -1)
                self.groupListView.onOpen();
                
        });
        
        $$('#nav_bottom').click(function(){
        
            U.goPage('createroom'); 
            
        });
        
        this.lobbyListView.onOpen();
        
    }
});