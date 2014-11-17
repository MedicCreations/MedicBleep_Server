var SPIKA_CreateRoomView = Backbone.View.extend({
    
    currentKeyword:'',
    selectedUserIdList:[],
    userModelsPool:[],
    profileImageFileId:null,
    profileThumbFileId:null,
    editingChatData:null,
    userIdsBeforeEdit:[],  
    chatData:null,
    initialize: function(options) {
        var self = this;
        this.template = options.template;
        this.chatData = options.chatData;
        
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

        this.selectedUserIdList = [];
        this.userModelsPool = [];
        this.userIdsBeforeEdit = [];


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
        
        if(!_.isNull(this.editingChatData)){
            $$('#btn_create_room').text(LANG.save);
            $$('header').text(LANG.editroom);
        }
    },
    
    setChatData: function(chatData){
        
        var self = this;
        
        this.showAvatarLoading();
        this.selectedUserIdList = [];
        this.userModelsPool = [];
        this.userIdsBeforeEdit = [];

        this.editingChatData = chatData;
        
        apiClient.getChatMembers(this.editingChatData.get('chat_id'),function(data){

            var chatMembers = userFactory.createCollectionByAPIResponse(data)

            _.each(chatMembers.models,function(userData){
                
                self.selectedUserIdList.push(userData.get('id'));
                self.userIdsBeforeEdit.push(userData.get('id'));
                self.userModelsPool[userData.get('id')] = userData;
                
            });
            
            $$('#createroom_container input[type="text"]').val(chatData.get('chat_name'));
            
            var roomName = $$("#createroom_container input").val();

            EncryptManager.decryptImage($$('#createroom_container .room_profile_image'),chatData.get('image_thumb'),0,apiClient,function(){
                self.hideAvatarLoading();
            },function(){
                self.hideAvatarLoading();
            });
            
            self.updateRowState();
            
        },function(data){
            
            
            
        });
        
    },
    
    updateWindowSize: function(){

        U.setViewHeight($$("#menu_container_selectuser .scrollable"),[
            $$('header'),$$('#nav_bottom_createroom'),$$('#nav_bottom_createroom .menu_search')
        ])
        
        U.setViewHeight($$("#createroom_container"),[
            
        ])
        
    },
    
    updateRowState: function(updateSelectedUsers){
    
        
        if(_.isUndefined(updateSelectedUsers))
            updateSelectedUsers = true;
            
        var self = this;
        
        $$('#menu_container_selectuser li').each(function(){
            
            var userId = $(this).attr('data-userid');
            
            var index = _.indexOf(self.selectedUserIdList,userId);
            
            U.l(self.selectedUserIdList);
            U.l(userId);
            
            if(index == -1){
                $(this).removeClass('selected');
                                
				// change plus icon to minus
				$("#menu_container_selectuser li[data-userid='" + userId + "']").find('i').removeClass('fa-minus');
				$("#menu_container_selectuser li[data-userid='" + userId + "']").find('i').addClass('fa-plus');
				

            }else{
                $(this).addClass('selected');   
                                
				// change plus icon to minus
				$("#menu_container_selectuser li[data-userid='" + userId + "']").find('i').removeClass('fa-plus');
				$("#menu_container_selectuser li[data-userid='" + userId + "']").find('i').addClass('fa-minus');
				
            }
            
        });
        
        if(updateSelectedUsers == true){
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
        }

        $$('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                //EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                AvatarManager.process(this,fileId);
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
        
        var self = this;
        
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
        
        if(!_.isNull(this.editingChatData)){
        
            // Update
            var userIdsToAdd = '';
            var userIdsToDelete = '';
            
            _.each(self.selectedUserIdList,function(userIdToAdd){
                
                var isExist = false;
                
                _.each(self.userIdsBeforeEdit,function(userIdBefore){
                    
                    if(userIdToAdd == userIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    userIdsToAdd += userIdToAdd + ",";
                
            });
            
            _.each(self.userIdsBeforeEdit,function(userIdToDelete){
                
                var isExist = false;
                
                _.each(self.selectedUserIdList,function(userIdBefore){
                    
                    if(userIdToDelete == userIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false && userIdToDelete != SPIKA_UserManager.getUser().get('id'))
                    userIdsToDelete += userIdToDelete + ",";

            });

            // add users
            apiClient.addUsersToChat(
                self.editingChatData.get('chat_id'),
                userIdsToAdd,
                function(dataChat1){

                    if(_.isNull(dataChat1.chat)){
                        SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                        return;
                    }
                                        
                    // delete users
                    apiClient.deleteUsersFromChat(
                        dataChat1.chat.chat_id,
                        userIdsToDelete,
                        function(dataChat2){

                            if(_.isNull(dataChat2.chat)){
                                SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                                return;
                            }
                                                       
                            // update room info
                            apiClient.updateRoom(
                                dataChat2.chat.chat_id,
                                roomName,
                                self.profileImageFileId,
                                self.profileThumbFileId,
                                '',
                                '',
                                function(updateResult){
                                    
                                    U.goPage('main'); 
                                    
                                    _.debounce(function() {
                                        Backbone.trigger(EVENT_START_CHAT,dataChat2.chat.chat_id);
                                    }, 1000)();
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });

                        },function(data){
                        
                            SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
            
                    });
                    
    
                },function(data){
                
                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
    
            });

            
            return;
            
        } else {
            
            // Create
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

            
        }
    },
    prepareChatData:function(){
        
        if(_.isEmpty(this.chatData)){
            $$('header').text(LANG.title_new_room);
        }else{
            this.setChatData(this.chatData);
            $$('header').text(LANG.title_edit_room);
        }
        
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
        
        this.prepareChatData();
        
    },
    listviewOnClick: function(elm){
        var userId = $(elm).attr('data-userid');        
        this.tuggleUserId(userId);
    },
    tuggleUserId: function(userId){
        
        var self = this;
        var index = _.indexOf(this.selectedUserIdList,userId);
        
        if(index == -1){
            this.selectedUserIdList.push(userId);
        }else{
            this.selectedUserIdList.splice(index, 1);   
        }
        
        self.updateRowState();
    }
    
    
});
