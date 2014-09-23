var SPIKA_RoomEditView = Backbone.View.extend({
    
    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        this.currentPage = 0;
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
        
        return this;
        
    },
    
    onload: function(){
        this.displayUsers = new UserResult([]); 
        this.searchUsers('');
    },
    
    updateWindowSize: function(mainViewHeight){
    
        $(U.sel('#room_edit_view')).height(mainViewHeight);
        var roomInfoViewHeight = $(U.sel('#room_info')).outerHeight();
        var memberSelectViewHeight = mainViewHeight - roomInfoViewHeight - 10; // 10 is for padding 
         
        U.l(memberSelectViewHeight);
        
        $(U.sel('#room_info_allusers')).height(memberSelectViewHeight);
        $(U.sel('#room_info_members')).height(memberSelectViewHeight);
        
        
    },
    
    searchUsers:function(keyword){

        var self = this;
        
        apiClient.searchUsers(self.currentPage,keyword,function(data){
            
            self.displayUsers.add(userFactory.createCollectionByAPIResponse(data).models);
            
            var template = _.template($(U.sel('#template_userlist_row_editroom')).html(), {users: self.displayUsers.models});
            
            $(U.sel("#room_info_members .user_select")).html(template);
            
        },function(data){
            
            $(U.sel("#user_list")).html("");

        });
        
    },  
    
});
