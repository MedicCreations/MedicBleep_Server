var SPIKA_UserProfileView = Backbone.View.extend({


    currentUserData:null,
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

        _.debounce(function() {
            self.onload();
        }, 100)();
        
        return this;
        
    },
    
    onload: function(){

        if (this.currentUserData != null){
            $(U.sel('#userprofile_image')).attr('src',"img/default_user.png");
            $(U.sel('#userprofile_image')).attr('state',"loading");
            $(U.sel('#userprofile_title')).html(this.currentUserData.get('firstname') + " " + this.currentUserData.get('lastname'));
        
            EncryptManager.decryptImage($(U.sel('#userprofile_image')),this.currentUserData.get('image_thumb'),0,apiClient);
        }        
        
    }
    
    // setUserProfile: function(modelUser){
        
    //     this.currentUserData = modelUser;

    //     $(U.sel('#userprofile_image')).attr('src',"img/default_group.png");
    //     $(U.sel('#userprofile_image')).attr('state',"loading");
    //     $(U.sel('#userprofile_title')).html(modelUser.get('firstname'));
        
    //     EncryptManager.decryptImage($(U.sel('#userprofile_image')),modelUser.get('image'),0,apiClient);
        
    // }   
    
});

