var SPIKA_SearchUsersView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        this.displayUsers = new UserResult([]);
		this.currentPage = 0;
        this.chatTyepe = CHATTYPE_PRIVATE;
        
        var self = this;
        
        Backbone.on(EVENT_ENTER_CHAT, function(modelChat) {
            
            self.chatMembers = null;
            
            if(modelChat.get('group_id') == 0){
                
                // search chat members then refresh user list to drap "add to chat button"
                apiClient.getChatMembers(modelChat.get('chat_id'),function(data){
                    
                    self.chatMembers = userFactory.createCollectionByAPIResponse(data);
                    self.searchUsers("");
                    
                },function(data){
                    
                    self.chatMembers = null;
                    self.searchUsers("");
                });
                
                self.chatTyepe = CHATTYPE_PRIVATE;
            }else{
                self.chatMembers = null;
                self.chatTyepe = CHATTYPE_GROUP;
                self.searchUsers("");
            }
                        
            
            
        });
        
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

        var self = this;
        
        $(U.sel("#tb_search_user")).keyup(function(evt) {
			self.currentPage = 0;
			self.displayUsers = new UserResult([]); 
            var currentText = $(U.sel("#tb_search_user")).val();
			
            self.searchUsers(currentText);
        });
        
        this.searchUsers("");
		
		 //handle paging
        $(U.sel('#left_column_second')).scroll(function() {
		
			 if($(U.sel('#left_column_second')).scrollTop() + $(U.sel('#left_column_second')).height() == $(U.sel('#left_column_second')).prop("scrollHeight")) {
				
				var searchText = $(U.sel("#tb_search_user")).val();
				self.currentPage++;
				self.searchUsers(searchText);
				
			}
			
		});

    },
    searchUsers:function(keyword){

        var self = this;
        
        apiClient.searchUsers(self.currentPage,keyword,function(data){
            
            self.displayUsers.add(userFactory.createCollectionByAPIResponse(data).models);
            
            var template = _.template($(U.sel('#template_userlist_row')).html(), {users: self.displayUsers.models});
            
            $(U.sel("#user_list")).html(template);
            
            $(U.sel('#user_list li')).click(function(){
               Backbone.trigger(EVENT_START_PRIVATE_CHAT,self.displayUsers.searchById($(this).attr('data-userid')));
               return false;
            });
			
			console.log('height ' + $(U.sel('#left_column_second')).prop("scrollHeight"));
			console.log('height ul ' + $(U.sel('#user_list')).height());
            
            if(self.chatTyepe == CHATTYPE_PRIVATE && self.chatMembers != null){
                
                // delete add button because already chat member
                
                self.displayUsers.each(function(userFromSearch){
                    
                    var isExistsInChat = false;
                    
                    var selector = U.sel('#searchuserlist' + userFromSearch.get('id') + " .addtochatbtn");
                    $(selector).removeClass( "fa-plus" );
                            
                    self.chatMembers.each(function(userFromChat){
                        
                        if(userFromSearch.get('id') == userFromChat.get('id')){
                            
                            isExistsInChat = true;
                            
                            
                        }
                        
                    });
                    
                    if(!isExistsInChat){
                        $(selector).addClass( "fa-plus" );
                    }                    
                });
            
                $(U.sel('#user_list li .fa-plus')).click(function(){
                    var userId = $(this).attr('data-userid');
                    
                    // add user to chat
                    Backbone.trigger(EVENT_ADDUSER_TO_CHAT,userId);
                    
                    return false;
                });
            
            } else {
                // group chat
                $(U.sel('.addtochatbtn')).css('display','none');
            }

            
        },function(data){
            
            $(U.sel("#user_list")).html("");

        });
        
    },         
});
