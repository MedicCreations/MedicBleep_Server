var SPIKA_LeftColumnView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        var self = this;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function(sizeObj) {
            self.updateWindowSize();
        });

        Backbone.on(EVENT_OPEN_LEFTMENU, function() {
            self.updateWindowSize();
        });
                
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;
        

        require(['app/views/leftcolumn/lobbyView','thirdparty/text!templates/leftcolumn/lobby.tpl',
                    'app/views/leftcolumn/searchUsersView','thirdparty/text!templates/leftcolumn/searchUsers.tpl',
                    'app/views/leftcolumn/searchGroupsView','thirdparty/text!templates/leftcolumn/searchGroups.tpl'
                ],function (LobbyViewTmp,TemplateLobby,
                                SearchUsersViewTmp,TemplateUsers,
                                SearchGroupsViewTmp,TemplateGroups) {
                    
            self.lobbyView = new SPIKA_LobbyView({
                template: TemplateLobby
            });

            self.searchUsersView = new SPIKA_SearchUsersView({
                template: TemplateUsers
            });
            
            self.searchGroupsView = new SPIKA_SearchGroupsView({
                template: TemplateGroups
            });
            
            self.onload();
            
        });

        return this;
        
    },
    
    onload: function(){

        var self = this;
        
        this.panelOpened = "";
        $(U.sel('.accordion > dd')).hide();
        $(U.sel('.accordion dt')).click(function() {
            var panelId = $(this).next().attr('id');
            self.openPanel(panelId);
        });
        
        $(U.sel("#left_column_first")).html(this.lobbyView.render().el);
        $(U.sel("#left_column_second")).html(this.searchUsersView.render().el);
        $(U.sel("#left_column_third")).html(this.searchGroupsView.render().el);

        this.updateWindowSize();
        this.openPanel('left_column_first');

        $(U.sel("#menu_proflie")).click(function(){
            Backbone.trigger(EVENT_OPEN_PROFLIE,null);
        });
                
        $(U.sel("#menu_signout")).click(function(){
            location.href ="#logout";
        });
        
    },
    openPanel: function(panelId){
        
		var self = this;

        this.updateWindowSize();
        $(U.sel('.accordion > dd')).slideUp(function(){
			
			if (panelId == "left_column_second"){
				_.debounce(function() {
        
					var listHeight = $(U.sel('#user_list')).prop("scrollHeight");
					var usersHeight = $(U.sel('#left_column_second')).height();
					
					if (listHeight < usersHeight){
						//load new page
						var searchText = $(U.sel("#tb_search_user")).val();
						self.searchUsersView.currentPage++;
						self.searchUsersView.searchUsers(searchText);
					}
					
					}, 100)();
				};
			
			if (panelId == "left_column_third"){
				_.debounce(function() {
        
					var listHeight = $(U.sel('#group_list')).prop("scrollHeight");
					var groupsHeight = $(U.sel('#left_column_third')).height();
					
					if (listHeight < groupsHeight){
						//load new page

						var searchText = $(U.sel("#tb_search_group")).val();
						self.searchGroupsView.currentPage++;
						self.searchGroupsView.searchGroups(searchText);
					}
					
					}, 100)();
				};
				
			}
		);
        $(U.sel('.accordion i')).removeClass('fa-rotate-90');
        
        if(panelId != this.panelOpened){
			self.searchUsersView.openedPanel = panelId;
			self.searchGroupsView.openedPanel = panelId;
            this.panelOpened = panelId;
            $(U.sel("#" + panelId)).slideDown();
            $(U.sel("#" + panelId)).prev().find( "i" ).addClass('fa-rotate-90');
        }else{
            this.panelOpened ='';
        }
    },
    updateWindowSize: function(){
        
        var width = U.getWidth();
        var height = U.getHeight();
        
        var headerHeight = $(U.sel('#left_column .slide_menu')).innerHeight();
        $(U.sel('#left_column .accordion')).height(height - headerHeight);

        var menuHeightSum = 0;
        $(U.sel('#left_column .accordion dt')).each(function(){
            menuHeightSum += $(this).innerHeight();
        });
        
        var accordionHeight = $(U.sel('#left_column .accordion')).height();
        var innerPaddingSum = 0;

        $(U.sel('#left_column .accordion dd')).height(accordionHeight - menuHeightSum - innerPaddingSum);
        
    }
            
});
