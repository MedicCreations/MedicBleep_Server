var SPIKA_CreateRoomView = Backbone.View.extend({
    
    currentKeyword:'',
    selectedUserIdList:[],
    userModelsPool:[],
    profileImageFileId:null,
    profileThumbFileId:null,    
    initialize: function(options) {
        var self = this;
        this.template = options.template;
        
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
        this.usersListView = new SpikaPagingListView({
            parentElmSelector : "#menu_container_selectuser .menu_list",
            scrollerSelector : "#menu_container_selectuser .scrollable",
            source :  this
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

        this.updateWindowSize();
        this.usersListView.init();
        this.usersListView.loadCurrentPage();

        $$('#menu_container_selectuser input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_selectuser input').val();
            self.usersListView.refresh();
        });
        
        $$('#nav_bottom_createroom').click(function(){
            U.goPage('main'); 
        });
         
        $$('.button_container .red').click(function(){
            U.goPage('main'); 
        });

        $$('#btn_create_room').click(function(){
            self.save();
        });

        $$('#createroom_container .room_profile_image').click(function(){
            $$("#btn_dummy_file_upload_profile").click();
        });
        
        $$("#btn_dummy_file_upload_profile").change(function (evt){
            
            var files = evt.target.files; // FileList object
            
            var file = files[0];
            
            var fileType = file.type;

            self.showAvatarLoading();
            
            fileUploadHandler.profliePictureUpload(file,function(data){
                
                self.hideAvatarLoading();
                
                if(_.isUndefined(data.fileId) ||
                    _.isUndefined(data.thumbId)){
                    
                    self.hideAvatarLoading();
                    return;
                }
                
                self.profileImageFileId = data.fileId;
                self.profileThumbFileId = data.thumbId;
                
                EncryptManager.decryptImage($$('#createroom_container .room_profile_image'),data.thumbId,0,apiClient,function(){
                    self.hideAvatarLoading();
                },function(){
                    self.hideAvatarLoading();
                });
                
                self.uploadedFileData = data;
                
            },function(){
                
                self.hideAvatarLoading();
                
            });
        
        
        });


    },
    
    updateWindowSize: function(){

        U.setViewHeight($$("#menu_container_selectuser .scrollable"),[
            $$('header'),$$('#nav_bottom_createroom'),$$('#nav_bottom_createroom .menu_search')
        ])
        
        U.setViewHeight($$("#createroom_container"),[
            
        ])
        
    },
    
    updateRowState: function(){
        
        var self = this;
        
        $$('#menu_container_selectuser li').each(function(){
            
            var userId = $(this).attr('data-userid');
            
            var index = _.indexOf(self.selectedUserIdList,userId);
            
            if(index == -1){
                $(this).removeClass('selected');
            }else{
                $(this).addClass('selected');   
            }
            
        });
        
        // redraw selected members area
        var listAllUsersInSelection = this.usersListView.list.models;
        var listSelectedUsers = [];

        _.each(listAllUsersInSelection,function(modelUser){
           self.userModelsPool[modelUser.get('id')] = modelUser;
        });
        
        _.each(this.userModelsPool,function(modelUser){
           
           _.each(self.selectedUserIdList,function(userId){
              
               if(userId == modelUser.get('id')){
                   listSelectedUsers.push(modelUser);
               }
               
           });
            
        });
        
        var memberListHTML = _.template($$('#template_memberlist_row').html(), {users: listSelectedUsers});
        
        $$('#createroom_container .members').html(memberListHTML);
        
        $$('#createroom_container .members li').click(function(){
            var userId = $(this).attr('data-userid');        
            self.tuggleUserId(userId);
        });

        $$('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
            }
            
        });    
        
    },
    showAvatarLoading: function(){
        $$('#createroom_container .img_with_loader i').css('display','inline');
    },
    hideAvatarLoading: function(){
        $$('#createroom_container .img_with_loader i').css('display','none');
    },
    save: function(){
        
        // validation
        var roomName = $$("#createroom_container input").val();
        
        if(_.isEmpty(roomName)){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.createroom_validation_error_noname);
            return;
        }
        
        if(this.selectedUserIdList.length == 0){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.createroom_validation_error_nomember);
            return;
        }
        
        var userIds = '';
        
        _.each(this.selectedUserIdList,function(userId){
            
            userIds += userId + ",";
            
        });
        
        userIds += SPIKA_UserManager.getUser().get('id');
        
        apiClient.createNewRoom(roomName,userIds,this.profileImageFileId,this.profileThumbFileId,function(data){
            
            if(!_.isNull(data.chat)){
            
                U.goPage('main'); 
                
                _.debounce(function() {
                   Backbone.trigger(EVENT_START_CHAT,data.chat.chat_id);
                }, 1000)();
        
            }

        },function(data){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to create room");

        });
    },
    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(page,succeessListener,failedListener){
        
        apiClient.searchUsers(page,this.currentKeyword,function(data){
            succeessListener(data);
        },function(data){
            failedListener(data);
        });
        
    },
    listviewGetListFromResponse: function(response){
        return userFactory.createCollectionByAPIResponse(response)
    },
    listviewRender: function(data){
        return _.template($$('#template_userlist_row').html(), {users: data.models});
    },
    listViewAfterRender: function(){
        
        this.updateRowState();
        
    },
    listviewOnClick: function(elm){
        var userId = $(elm).attr('data-userid');        
        this.tuggleUserId(userId);
    },
    tuggleUserId: function(userId){

        var self = this;
        var index = _.indexOf(self.selectedUserIdList,userId);
        
        if(index == -1){
            self.selectedUserIdList.push(userId);
        }else{
            self.selectedUserIdList.splice(index, 1);   
        }
        
        self.updateRowState();
    }
    
    
});
