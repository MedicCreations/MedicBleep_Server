var SPIKA_UserProfileView = Backbone.View.extend({
    
    userData : null,
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
        
        $$('#user_profile a').click(function(){
            
            apiClient.startPrivateChat(self.userData,function(data){
                
                if(!_.isUndefined(data.chat_id)){
                    
                    Backbone.trigger(EVENT_START_CHAT,data.chat_id);
                    
                }
            
            },function(data){
            
            
            
            });
            
        });
        
    },
    
    showUser : function(userId){

        var self = this;

        if(_.isEmpty(userId) || userId == 0)
            return;

        apiClient.getUserById(userId,function(data){
            
            self.userData = userFactory.createModelByAPIResponse(data.user);
            
            EncryptManager.decryptImage($$('#user_profile .profile_pic'),self.userData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
            
            var details = self.userData.get('details');
            var name = self.userData.get('firstname') + " " + self.userData.get('lastname');

            $$('#user_profile #userprofile_username').html(name);
            $$('#user_profile #userprofile_tel').html(U.getInfoFromDetail('phone_number',details));
            $$('#user_profile #userprofile_mobile').html(U.getInfoFromDetail('mobile_number',details));
            $$('#user_profile #userprofile_email').html(U.getInfoFromDetail('email',details));

            
        },function(data){
            
            self.showAlert(LANG.login_failed);
            
        });
        
    }
    
});