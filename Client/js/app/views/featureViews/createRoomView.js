var SPIKA_CreateRoomView = Backbone.View.extend({
    
    currentKeyword:'',
    selectedUserIdList:[],
    userModelsPool:[],
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
        
    },
    showAvatarLoading: function(){
        $$('#createroom_container .img_with_loader i').css('display','inline');
    },
    hideAvatarLoading: function(){
        $$('#createroom_container .img_with_loader i').css('display','none');
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
        
        $$('#menu_container_selectuser .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
            }
            
        });    
        
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
