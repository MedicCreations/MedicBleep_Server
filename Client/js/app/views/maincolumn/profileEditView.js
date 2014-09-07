var SPIKA_ProflieEditView = Backbone.View.extend({
    
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
        
        this.user = SPIKA_UserManager.getUser();
        var self = this;
        
        this.updateInfo();
        
        $(U.sel('#btn_saveprofile')).click(function(){
           
           if(self.validate()){
               self.save();
           }

            
        });
        
        $(U.sel('#profile_edit_avatarimage')).click(function(){
            $(U.sel("#btn_dummy_file_upload_profile")).click();
        });
        
        $(U.sel("#btn_dummy_file_upload_profile")).change(function (evt){
            
            var files = evt.target.files; // FileList object
            
            var file = files[0];
            
            var fileType = file.type;
            
            if(!fileType.match(/png/)){
                alert('Please select only png');
                return;
            }
                
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
                        
                    },function(data){
                        
                        
                        
                    });
                
                    
                },function(data){
                    
                    
                    
                });
                 
            },function(){
                
                
                
            });
            
        });


        
    },
    
    updateWindowSize: function(mainViewHeight){
        $(U.sel('#profile_edit_view')).height(mainViewHeight);
    },
    
    validate: function(){
        
        var firstname = $(U.sel('input[name="firstname"]')).val();
        var lastname = $(U.sel('input[name="lastname"]')).val();
        
        if(_.isEmpty(firstname)){
            alert('Please enter first name');
            return false;
        }
        if(_.isEmpty(lastname)){
            alert('Please enter last name');
            return false;
        }
             
        return true;
           
    },
    save: function(){
        
        var self = this;
        
        var firstname = $(U.sel('input[name="firstname"]')).val();
        var lastname = $(U.sel('input[name="lastname"]')).val();
        
        //detail data
        var telnum = $(U.sel('input[name="tel_num"]')).val();
        var email = $(U.sel('input[name="email"]')).val();
        var mobileNum = $(U.sel('input[name="moblile_num"]')).val();
        
        var detailDataObj = {
            tel_num:telnum,
            email:email,
            mobile_num:mobileNum
        };
        
        var values = {
            firstname:firstname,
            lastname:lastname,
            details:JSON.stringify(detailDataObj)   
        };
        
        apiClient.saveProflie(this.user.get('id'),values,function(data){
            
            alert('Proflie updated.');
            
            apiClient.getUserById(self.user.get('id'),function(data){
                
                if(!_.isUndefined(data.user) && !_.isNull(data.user))
                    SPIKA_UserManager.setUser(userFactory.createModelByAPIResponse(data.user));
                
                this.user = SPIKA_UserManager.getUser();
                
            },function(data){
                
                
                
            });
        
            
        },function(data){
            
            
            
        });
        
        
    },
    showInfoFromDetail : function(param,formName){
        
        var details = this.user.get('details');
        
        if(_.isUndefined(details))
            return false;
            
        if(_.isNull(details))
            return false;
            
        if(_.isEmpty(details))
            return false;        

        if(_.isUndefined(details[param]))
            return false;
            
        if(_.isNull(details[param]))
            return false;
            
        if(_.isEmpty(details[param]))
            return false;          

        $(U.sel('input[name="' + formName + '"]')).val(details[param]);
        
    },
    
    showLoading: function(){
        $(U.sel('#profile_edit_avatarimage i')).css('display','block');
    },

    
    hideLoading: function(){
        $(U.sel('#profile_edit_avatarimage i')).css('display','none');
    },    
    
    updateInfo: function(){
        
        var self = this;
        
        this.showLoading();
        
        // show current values
        $(U.sel('input[name="firstname"]')).val(this.user.get('firstname'));
        $(U.sel('input[name="lastname"]')).val(this.user.get('lastname'));
        
        this.showInfoFromDetail('tel_num','tel_num');
        this.showInfoFromDetail('email','email');
        this.showInfoFromDetail('mobile_num','moblile_num');
        
        EncryptManager.decryptImage($(U.sel('#profile_edit_avatarimage img')),this.user.get('image'),0,apiClient,function(){
            self.hideLoading();
        });
        
    }
});
