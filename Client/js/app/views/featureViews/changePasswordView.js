var SPIKA_ChangePasswordView = Backbone.View.extend({
    
    initialize: function(options) {
	
		var self = this;
		
        this.template = options.template;
		
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
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
		this.user = SPIKA_UserManager.getUser();

        EncryptManager.decryptImage($$('#profile_edit_view img'),this.user.get('image'),0,apiClient,function(){
            self.hideLoading();
        },function(){
            self.hideLoading();
        });
            
        this.updateWindowSize();
        
		this.showLoading();
		
        $$('.button_container .red').click(function(){
            U.goPage('main'); 
        });

		$$('#btn_save_profile').click(function(){

			var newPassword = $$('input[name="new_password"]').val();
			var confirmPassword = $$('input[name="confirm_password"]').val();
			
			var errorMessage = U.validatePassword(newPassword,confirmPassword);
			
			if(!_.isEmpty(errorMessage)){
				SPIKA_AlertManager.show(LANG.general_errortitle,errorMessage);
				return;
			}

			SPIKA_AlertManager.show(LANG.title_chane_password,LANG.change_password_confirm_text,function(){

				apiClient.updatePasword(newPassword,function(data){

					U.goPage('logout'); 
					
				},function(data){
					
				});
			});
        });
		
    },

	updateWindowSize: function(){

        U.setViewHeight($$("#profile_edit_view"),[

        ])
        
    },

	showLoading: function(){
        $$('#profile_edit_view .img_with_loader i').css('display','inline');
    },
    hideLoading: function(){
        $$('#profile_edit_view .img_with_loader i').css('display','none');
    },
});