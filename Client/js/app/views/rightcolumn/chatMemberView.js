var SPIKA_ChatMemberView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;

        var self = this;
        
        
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;

        require(['app/views/rightcolumn/userProfileView','thirdparty/text!templates/rightcolumn/userProfile.tpl'
                ],function (
                    UserProfileViewTmp, TemplateUserProfileView) {

            self.userProfileView = new SPIKA_UserProfileView({
                template: TemplateUserProfileView
            });
            
        });
        
        _.debounce(function() {
            self.onload();
        }, 100)();
        
        return this;
        
    },
    
    onload: function(){
        
        
    },
    
    startNewChat: function(modelChat){
        
        this.currentChatData = modelChat;
        
        var self = this;
        
        apiClient.getChatMembers(modelChat.get('chat_id'),function(data){
            
            self.chatMembers = userFactory.createCollectionByAPIResponse(data);
            
            var template = _.template($(U.sel('#template_memberlist_row')).html(), {users: self.chatMembers.models});
            $(U.sel("#chatmember_holder")).html(template);
            
			$(U.sel('#chatmember_holder li')).click(function(){
				
				 var user_id = $(this).attr('data-userid');

				$(U.sel('.tab_holder li')).removeClass('active');
				$(U.sel('#right_col_holder1')).css('display','none');
				$(U.sel('#right_col_holder2')).css('display','none');

				$(U.sel('#user_profile_holder')).css('display','block');

				apiClient.getUserById(user_id, function(data){

					self.user = userFactory.createModelByAPIResponse(data.user);

					self.userProfileView.currentUserData = self.user;

					$(U.sel("#user_profile_holder")).html(self.userProfileView.render().el);


				}, function(data){
					$(U.sel("#user_profile_holder")).html("");
				});
				
			
			});
			
            
        },function(data){
            
            $(U.sel("#chatmember_holder")).html("");

        });
        
        
    }   
    
});
