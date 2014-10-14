var SPIKA_EditProflieView = Backbone.View.extend({
    
    user:null,
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
        
        this.user = SPIKA_UserManager.getUser();
        var self = this;
        
        this.updateWindowSize();
        this.updateInfo();
        
        $$('.button_container .red').click(function(){
            U.goPage('main'); 
        });
        
        $$('.button_container #btn_save_profile').click(function(){
            self.save();
        });
        
        $$('#profile_edit_view img').click(function(){
            $$("#btn_dummy_file_upload_profile").click();
        });
        
        $$("#btn_dummy_file_upload_profile").change(function (evt){
            
            var files = evt.target.files; // FileList object
            
            var file = files[0];
            
            var fileType = file.type;

            self.showLoading();
            
            fileUploadHandler.profliePictureUpload(file,function(data){
                
                if(_.isUndefined(data.fileId) ||
                    _.isUndefined(data.thumbId)){
                    
                    self.hideLoading();
                    return;
                }
                
                apiClient.saveProfliePicture(self.user.get('id'),data.fileId,data.thumbId,function(data){
                    
                    self.hideLoading();
                    
                    apiClient.getUserById(self.user.get('id'),function(data){
                        
                        if(!_.isUndefined(data.user) && !_.isNull(data.user))
                            SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                        
                        self.user = SPIKA_UserManager.getUser();
                        
                        self.updateInfo();
                        
                        mainView.updateUserInfo();
                        
                    },function(data){
                        
                        
                        
                    });
                
                    
                },function(data){
                    
                    
                    
                });
                 
            },function(){
                
                
                
            });
            
        });


    },

    updateWindowSize: function(){

        U.setViewHeight($$("#profile_edit_view"),[

        ])
        
    },

    showInfoFromDetail : function(param,formName){
        
        var details = this.user.get('details');
        
        if(_.isUndefined(details))
            return false;
            
        if(_.isNull(details))
            return false;
            
        if(_.isEmpty(details))
            return false;               
        
        _.each(details,function(value){
                      
            if(!_.isUndefined(value[param])){
                U.l(value[param]);
                $$('input[name="' + formName + '"]').val(value[param]);
            }
        });

    },    


    updateInfo: function(){

        var self = this;
        this.showLoading();
        
        // show current values
        $$('input[name="firstname"]').val(this.user.get('firstname'));
        $$('input[name="lastname"]').val(this.user.get('lastname'));
        
        this.showInfoFromDetail('phone_number','tel_num');
        this.showInfoFromDetail('email','email');
        this.showInfoFromDetail('mobile_number','moblile_num');
        
        EncryptManager.decryptImage($$('#profile_edit_view img'),this.user.get('image'),0,apiClient,function(){
            self.hideLoading();
        },function(){
            self.hideLoading();
        });
        
    },
    showLoading: function(){
        $$('#profile_edit_view .img_with_loader i').css('display','inline');
    },
    hideLoading: function(){
        $$('#profile_edit_view .img_with_loader i').css('display','none');
    },
    save: function(){
        
        var self = this;
        
        var firstname = $$('input[name="firstname"]').val();
        var lastname = $$('input[name="lastname"]').val();

        if(_.isEmpty(firstname) || _.isEmpty(lastname)){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.editprofile_validation_error_noname);
            return;
        }
        
        //detail data
        var telnum = $$('input[name="tel_num"]').val();
        var email = $$('input[name="email"]').val();
        var mobileNum = $$('input[name="moblile_num"]').val();
        
        var detailDataObj = [
            {phone_number:telnum,'public':'1'},
            {mobile_number:mobileNum,'public':'1'},
            {email:email,'public':'1'}
        ];
        
        var values = {
            firstname:firstname,
            lastname:lastname,
            details:JSON.stringify(detailDataObj)   
        };
        
        apiClient.saveProflie(this.user.get('id'),values,function(data){
            
            apiClient.getUserById(self.user.get('id'),function(data){
                
                if(!_.isUndefined(data.user) && !_.isNull(data.user))
                    SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                
                this.user = SPIKA_UserManager.getUser();
                U.goPage('main');
                
            },function(data){
                
                
                
            });
        
            
        },function(data){
            
            
            
        });
        
        
    }
    
});