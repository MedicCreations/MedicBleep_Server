var SPIKA_OrganizationSelectView = Backbone.View.extend({

    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
	    
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();

        return this;

    },
    
    onload : function(){

        var self = this;

        var template = _.template($$('#template_selectbox').html(), {organizations: SPIKA_UserManager.preloginData.organizations}); 
        $$('#organization_selectbox_holder').html(template);

        $$('#select_org_btn').click(function(){
        
            var organizationId = $$('#organization_select').val();
            
            var username = SPIKA_UserManager.preloginData.username;
            var password = SPIKA_UserManager.preloginData.password;
            
	        apiClient.login(username,password,organizationId,function(data){
	            
	            SPIKA_VideoCallManager.init(data.user_id);
	            
	            apiClient.getUserById(data.user_id,function(data){
	                
	                SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
	                SPIKA_notificationManger.attachUser(data.user.id);
	                AvatarManager.init();
	                
	                U.goPage("main");
	                
	            },function(data){
	                
	                self.showAlert(LANG.login_failed);
	                
	            });
	
	            
	        },function(data){
	            
	            U.goPage("logout");
	            
	        });

        });
        
        $$('#cancel_btn').click(function(){
            
            U.goPage("logout");
            
        });
        
    }
    
});
