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
    },
    openPanel: function(panelId){
        
        this.updateWindowSize();
        $(U.sel('.accordion > dd')).slideUp();
        $(U.sel('.accordion i')).removeClass('fa-rotate-90');
        
        if(panelId != this.panelOpened){
            this.panelOpened = panelId;
            $(U.sel("#" + panelId)).slideDown();
            $(U.sel("#" + panelId)).prev().find( "i" ).addClass('fa-rotate-90');
        }else{
            this.panelOpened ='';
        }
            
		console.log('height ul ' + $(U.sel('#user_list')).prop("scrollHeight"));
		console.log('height stupac' + $(U.sel('#left_column_second')).prop("scrollHeight"));
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
