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

        apiClient.getUserById(self.user.get('id'),function(data){
            
            var listParameters = profileParameterFactory.createCollectionByAPIResponse(data);
            var formHtml = _.template($$('#template_proflie_form').html(), {parapeters: listParameters.models});
            
            $$('#proflie_forms').html(formHtml);

            self.user = userFactory.createModelByAPIResponse(data.user);

            if(!_.isUndefined(data.user.details)){
                self.updateInfo();
                $$('.button_container #btn_save_profile').css('display','inline-block');
            }
            
        },function(data){
            
            
            
        });
            
        this.updateWindowSize();
        
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
        
        if(U.getInfoFromDetail(param,details))
            $$('input[name="' + formName + '"]').val(U.getInfoFromDetail(param,details));
    },    


    updateInfo: function(){

        var self = this;
        this.showLoading();
        
        // show current values
        $$('input[name="firstname"]').val(this.user.get('firstname'));
        $$('input[name="lastname"]').val(this.user.get('lastname'));
        
        var details = this.user.get('details');
        
        _.each(details,function(paramData){
            
            var keyName = _.keys(paramData)[0];
            
            if(!_.isEmpty(keyName)){
                var value = paramData[keyName];
                $$('input[name="' + keyName + '"]').val(value);
            }

        });
        
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

        var detailDataObj = [];
        
        $$('#proflie_forms input').each(function(){
           
           var key = $(this).attr('name'); 
           var val = $(this).val();
           
           var tmp = {};
           tmp[key] = val;
           tmp.public = 1;
           detailDataObj.push(tmp);
           
        });
                
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