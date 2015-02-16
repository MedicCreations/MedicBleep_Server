var SPIKA_CreateRoomView = Backbone.View.extend({
    
    currentKeyword:'',
    selectedUserIdList:[],
    selectedGroupIdList:[],
    selectedRoomIdList:[],
    userModelsPool:[],
    groupModelsPool:[],
    roomModelsPool:[],
    profileImageFileId:null,
    profileThumbFileId:null,
    editingChatData:null,
    userIdsBeforeEdit:[],  
    groupIdsBeforeEdit:[],  
    roomIdsBeforeEdit:[],  
    chatData:null,
    waitingRequest:false,
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

        this.groupListView = new SpikaPagingListView({
            parentElmSelector : "#createroom_container .mambers_panel .group .selectlist ul",
            scrollerSelector : "#createroom_container .mambers_panel .group .selectlist",
            source :  this
        });
        

        this.roomListView = new SpikaPagingListView({
            parentElmSelector : "#createroom_container .mambers_panel .room .selectlist ul",
            scrollerSelector : "#createroom_container .mambers_panel .room .selectlist",
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
        this.selectedGroupIdList = [];
        this.selectedRoomIdList = [];
        this.userModelsPool = [];
        this.groupModelsPool = [];
        this.roomModelsPool = [];
        this.userIdsBeforeEdit = [];
        this.groupIdsBeforeEdit = [];
        this.roomIdsBeforeEdit = [];

        this.updateWindowSize();
        this.usersListView.init();
        this.usersListView.loadCurrentPage();

        this.groupListView.init();
        this.groupListView.loadCurrentPage();
        
        this.roomListView.init();
        this.roomListView.loadCurrentPage();

        apiClient.getCategories(function(data){
            
            var categoryResult = categoryFactory.createCollectionByAPIResponse(data);
            var categorySelectHtml = _.template($$('#template_categorylist_createroom_row').html(), {
                categories: categoryResult.models,
                LANG: LANG
            });
            
            $$("#createroom_container .category_select_box").html(categorySelectHtml);
            
            if(!_.isUndefined(self.chatData)){
                
                var categoryId = self.chatData.get('category_id');
                $$("#createroom_container .category_select_box").val(categoryId);
                
            }
            
        },function(data){
        
        
        
        });


        $$('#menu_container_selectuser input').keyup(function(evt) {
            
            if(this.waitingRequest)
                return;
                
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

        ///Groups ////////////////////////////////////////////////////////////////////////////
        $$('#createroom_container .group input').keyup(function(evt) {
            if(this.waitingRequest)
                return;
                
            self.groupListView.refresh();
        });

        $$('#createroom_container .group i').click(function() {
            
            self.tuggleGroupSelector();
        });

        ///Groups ////////////////////////////////////////////////////////////////////////////

        ///Rooms ////////////////////////////////////////////////////////////////////////////
        $$('#createroom_container .room input').keyup(function(evt) {

            if(this.waitingRequest)
                return;
                
            self.roomListView.refresh();
        });

        $$('#createroom_container .room i').click(function() {
            
            self.tuggleRoomSelector();
        });

        ///Rooms ////////////////////////////////////////////////////////////////////////////



        if(!_.isNull(this.editingChatData)){
            $$('#btn_create_room').text(LANG.save);
            $$('header').text(LANG.editroom);
        }
    },
    tuggleGroupSelector: function(){
    
        if($$('#createroom_container .group .selectedlist').is(":visible")){
            $$('#createroom_container .group .selectedlist').css('display','none');
            $$('#createroom_container .group .selectlist').css('display','block');
        } else {
            $$('#createroom_container .group .selectedlist').css('display','block');
            $$('#createroom_container .group .selectlist').css('display','none');
            
        }
          
    },
    tuggleRoomSelector: function(){
    
        if($$('#createroom_container .room .selectedlist').is(":visible")){
            $$('#createroom_container .room .selectedlist').css('display','none');
            $$('#createroom_container .room .selectlist').css('display','block');
        } else {
            $$('#createroom_container .room .selectedlist').css('display','block');
            $$('#createroom_container .room .selectlist').css('display','none');
            
        }
        
    },
    setChatData: function(chatData){
        
        var self = this;
        
        this.showAvatarLoading();
        this.selectedUserIdList = [];
        this.selectedGroupIdList = [];
        this.userModelsPool = [];
        this.groupModelsPool = [];
        this.userIdsBeforeEdit = [];

        this.editingChatData = chatData;
        
        $$(".passwordnotice").text(LANG.password_notice_edit);
        
        apiClient.getChatMembersAll(this.editingChatData.get('chat_id'),function(data){
            
            var usersData = {users:[]};
            var groupsData = {groups:[]};
            var roomsData = {rooms:[]};
                    
            //  separate to each arrays
            _.each(data.members_result,function(row){
                
                var type = row.type;
                
                if(type == 1){
                    usersData.users.push(row.user);
                }
                
                if(type == 2){
                    groupsData.groups.push(row.group);
                }
                
                if(type == 3){
                    roomsData.rooms.push(row.chat);
                }
                
            });
            
            // process users
            var chatMembers = userFactory.createCollectionByAPIResponse(usersData)
            _.each(chatMembers.models,function(userData){
                self.selectedUserIdList.push(userData.get('id'));
                self.userIdsBeforeEdit.push(userData.get('id'));
                self.userModelsPool[userData.get('id')] = userData;
            });
            
            // process groups
            var chatMemberGroups = groupFactory.createCollectionByAPIResponse(groupsData)
            _.each(chatMemberGroups.models,function(groupData){
                self.selectedGroupIdList.push(groupData.get('id'));
                self.groupIdsBeforeEdit.push(groupData.get('id'));
                self.groupModelsPool[groupData.get('id')] = groupData;
            });
            
            // process rooms
            var chatMemberRooms = roomFactory.createCollectionByAPIResponse(roomsData)
            _.each(chatMemberRooms.models,function(roomData){
                self.selectedRoomIdList.push(roomData.get('chat_id'));
                self.roomIdsBeforeEdit.push(roomData.get('chat_id'));
                self.roomModelsPool[roomData.get('chat_id')] = roomData;
            });
            
            $$('#createroom_container input[type="text"]').val(chatData.get('chat_name'));
            
            if(chatData.get('is_private') == 1)
                $$('#createroom_container input[name="isprivate"]').attr("checked","checked");
            
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

        
        $$('#createroom_container .group .selectlist li').each(function(){
            
            var groupId = $(this).attr('data-groupid');
            
            var index = _.indexOf(self.selectedGroupIdList,groupId);
            
            var selector = "#createroom_container .group .selectlist li[data-groupid='" + groupId + "']";
            
            if(index == -1){
                $(this).removeClass('selected');
                                
				// change plus icon to minus
				$$(selector).find('i').removeClass('fa-minus');
				$$(selector).find('i').addClass('fa-plus');
				

            }else{
                $(this).addClass('selected');   
                                
				// change plus icon to minus
				$$(selector).find('i').removeClass('fa-plus');
				$$(selector).find('i').addClass('fa-minus');
				
            }
            
        });
        

        $$('#createroom_container .room .selectlist li').each(function(){
            
            var roomId = $(this).attr('data-roomid');
            
            var index = _.indexOf(self.selectedRoomIdList,roomId);
            
            var selector = "#createroom_container .room .selectlist li[data-roomid='" + roomId + "']";
            
            if(index == -1){
                $(this).removeClass('selected');
                                
				// change plus icon to minus
				$$(selector).find('i').removeClass('fa-minus');
				$$(selector).find('i').addClass('fa-plus');
				

            }else{
                $(this).addClass('selected');   
                                
				// change plus icon to minus
				$$(selector).find('i').removeClass('fa-plus');
				$$(selector).find('i').addClass('fa-minus');
				
            }
            
        });
        

        // update selected user list
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
            
            $$('#createroom_container .user .members').html(memberListHTML);
            
            $$('#createroom_container .user .members li').click(function(){
                var userId = $(this).attr('data-userid');        
                self.tuggleUserId(userId);
            });
        }
		
		// update selected group list
        var listAllGroupsInSelection = this.groupListView.list.models;
        var listSelectedGroups = [];

        _.each(listAllGroupsInSelection,function(model){
           self.groupModelsPool[model.get('id')] = model;
        });
        
        _.each(this.groupModelsPool,function(model){
            
           _.each(self.selectedGroupIdList,function(groupId){
              
               if(groupId == model.get('id')){
                   listSelectedGroups.push(model);
               }
               
           });
            
        });
        
        var groupsListHtml = _.template($$('#template_grouplist_row').html(), {groups: listSelectedGroups});
        
        $$('#createroom_container .group .selectedlist ul').html(groupsListHtml);
        
        $$('#createroom_container .group .selectedlist li').each(function(){
            
            $(this).unbind().click(function(){
                var groupId = $(this).attr('data-groupid'); 
                self.tuggleGroupId(groupId);
            })
            
			$(this).find('i').removeClass('fa-plus');
			$(this).find('i').addClass('fa-times');
			
        });
 
 
 		// update selected room list
        var listAllRoomsInSelection = this.roomListView.list.models;
        var listSelectedRooms = [];

        _.each(listAllRoomsInSelection,function(model){
           self.roomModelsPool[model.get('chat_id')] = model;
        });
        
        _.each(this.roomModelsPool,function(model){
            
           _.each(self.selectedRoomIdList,function(roomId){
              
               if(roomId == model.get('chat_id')){
                   listSelectedRooms.push(model);
               }
               
           });
            
        });
        
        var roomListHtml = _.template($$('#template_roomlist_row').html(), {rooms: listSelectedRooms});
        
        $$('#createroom_container .room .selectedlist ul').html(roomListHtml);
        
        $$('#createroom_container .room .selectedlist li').each(function(){
            
            $(this).unbind().click(function(){
                var roomId = $(this).attr('data-roomid'); 
                self.tuggleRoomId(roomId);
            })
            
			$(this).find('i').removeClass('fa-plus');
			$(this).find('i').addClass('fa-times');
			
        });
           
        
        $$('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
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
        var roomName = $$('#createroom_container input[name="roomname"]').val();
        var password = $$('#createroom_container input[name="password"]').val();
        var passwordConfirm = $$('#createroom_container input[name="password_confirm"]').val();
        var categoryId = $$("#createroom_container .category_select_box").val();
        var isPrivate = $$('#createroom_container input[name="isprivate"]').prop("checked");
        
        if(_.isEmpty(roomName)){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.createroom_validation_error_noname);
            return;
        }
        
        if(!_.isEmpty(password)){
            
            var passwordValidationErrorMessage = U.validatePassword(password,passwordConfirm);
            
            if(!_.isEmpty(passwordValidationErrorMessage)){
	            SPIKA_AlertManager.show(LANG.general_errortitle,passwordValidationErrorMessage);
				return;
            }
            
        }
        
        
        if((this.selectedUserIdList.length + this.selectedGroupIdList.length + this.selectedRoomIdList.length) == 0){
            
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.createroom_validation_error_nomember);
            return;
        }
        
        if(!_.isNull(this.editingChatData)){
        
            // Update
            var userIdsToAdd = '';
            var userIdsToDelete = '';
            var groupIdsToAdd = '';
            var groupIdsToDelete = '';
            var roomIdsToAdd = '';
            var roomIdsToDelete = '';
            
            var oldPassword = this.editingChatData.get('password');
            
            // get users to add
            _.each(self.selectedUserIdList,function(userIdToAdd){
                
                var isExist = false;
                
                _.each(self.userIdsBeforeEdit,function(userIdBefore){
                    
                    if(userIdToAdd == userIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    userIdsToAdd += userIdToAdd + ",";
                
            });
            
            // get users to remove
            _.each(self.userIdsBeforeEdit,function(userIdToDelete){
                
                var isExist = false;
                
                _.each(self.selectedUserIdList,function(userIdBefore){
                    
                    if(userIdToDelete == userIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false && userIdToDelete != SPIKA_UserManager.getUser().get('id'))
                    userIdsToDelete += userIdToDelete + ",";

            });
            
            // get groups to add
            _.each(self.selectedGroupIdList,function(groupIdToAdd){
                
                var isExist = false;
                
                _.each(self.groupIdsBeforeEdit,function(groupIdBefore){
                    
                    if(groupIdToAdd == groupIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    groupIdsToAdd += groupIdToAdd + ",";
                
            });
            
            // get groups to remove
            _.each(self.groupIdsBeforeEdit,function(groupIdToDelete){
                
                var isExist = false;
                
                _.each(self.selectedGroupIdList,function(groupIdBefore){
                    
                    if(groupIdToDelete == groupIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    groupIdsToDelete += groupIdToDelete + ",";

            });
            
            
            // get rooms to add
            _.each(self.selectedRoomIdList,function(roomIdToAdd){
                
                var isExist = false;
                
                _.each(self.roomIdsBeforeEdit,function(roomIdBefore){
                    
                    if(roomIdToAdd == roomIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    roomIdsToAdd += roomIdToAdd + ",";
                
            });
            
            // get rooms to remove
            _.each(self.roomIdsBeforeEdit,function(roomIdToDelete){
                
                var isExist = false;
                
                _.each(self.selectedRoomIdList,function(roomIdBefore){
                    
                    if(roomIdToDelete == roomIdBefore)
                        isExist = true;
                    
                });
                
                if(isExist == false)
                    roomIdsToDelete += roomIdToDelete + ",";

            });
            
            groupIdsToDelete = groupIdsToDelete.replace(/,\s*$/, "");
            groupIdsToAdd = groupIdsToAdd.replace(/,\s*$/, "");
            userIdsToDelete = userIdsToDelete.replace(/,\s*$/, "");
            userIdsToAdd = userIdsToAdd.replace(/,\s*$/, "");
            roomIdsToAdd = roomIdsToAdd.replace(/,\s*$/, "");
            roomIdsToDelete = roomIdsToDelete.replace(/,\s*$/, "");

            // add users
            apiClient.addUsersToChat(
                self.editingChatData.get('chat_id'),
                userIdsToAdd,
                groupIdsToAdd,
                roomIdsToAdd,
                function(dataChat1){

                    if(_.isNull(dataChat1.chat)){
                        SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                        return;
                    }
                                        
                    // delete users
                    apiClient.deleteUsersFromChat(
                        dataChat1.chat.chat_id,
                        userIdsToDelete,
                        groupIdsToDelete,
                        roomIdsToDelete,
                        function(dataChat2){

                            if(_.isNull(dataChat2.chat)){
                                SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                                return;
                            }
                                                       
                            // update room info
                            apiClient.updateRoom(
                                dataChat2.chat.chat_id,
                                roomName,
                                password,
                                isPrivate,
                                categoryId,
                                self.profileImageFileId,
                                self.profileThumbFileId,
                                '',
                                '',
                                function(updateResult){
									
									if(!_.isEmpty(password)){
										
					                	// save password here so creater should not enter password again
										var cookieKey = COOKIE_ROOMPASSWORD_PREFIX + dataChat2.chat.chat_id;
										$.cookie(cookieKey, CryptoJS.MD5(password).toString(), { expires: COOKIE_EXPIRES });

									}

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
            var groupIds = '';
            var roomIds = '';
            
            _.each(this.selectedUserIdList,function(userId){
                
                userIds += userId + ",";
                
            });

            _.each(this.selectedGroupIdList,function(groupId){
                
                groupIds += groupId + ",";
                
            });
                        
            _.each(this.selectedRoomIdList,function(roomId){
                
                roomIds += roomId + ",";
                
            });
                        
            userIds += SPIKA_UserManager.getUser().get('id');
            
            apiClient.createNewRoom(roomName,password,isPrivate,categoryId,userIds,groupIds,roomIds,this.profileImageFileId,this.profileThumbFileId,function(data){
                
                if(!_.isNull(data.chat)){
                	
                	// save password here so creater should not enter password again
					var cookieKey = COOKIE_ROOMPASSWORD_PREFIX + data.chat.chat_id;
					$.cookie(cookieKey, data.chat.password, { expires: COOKIE_EXPIRES });

                    U.goPage('main'); 
                    
                    _.debounce(function() {
                       Backbone.trigger(EVENT_START_CHAT,data.chat.chat_id);
                    }, 1000)();
            
                }
    
            },function(data){
                
                var code = data.code;
                
                if(code == 1016){
                    SPIKA_AlertManager.show(LANG.general_errortitle,LANG.error_roomlimit);
                }else{
                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to create room");
                }
                    
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
    
    listviewRequest: function(instance,page,succeessListener,failedListener){
        
        this.waitingRequest = true;
        
        if(instance == this.usersListView){

            apiClient.searchUsers(page,this.currentKeyword,function(data){
                succeessListener(data);
            },function(data){
                failedListener(data);
            });
            
        }

        if(instance == this.groupListView){

            apiClient.searchGroups(page,$$('#createroom_container .group input').val(),'',function(data){
                succeessListener(data);
            },function(data){
                failedListener(data);
            });
            
        }
        
        if(instance == this.roomListView){

            apiClient.searchRooms(page,$$('#createroom_container .room input').val(),'',function(data){
                succeessListener(data);
            },function(data){
                failedListener(data);
            });
            
        }
        
        
    },
    listviewGetListFromResponse: function(instance,response){
        
        if(instance == this.usersListView)
            return userFactory.createCollectionByAPIResponse(response);
            
        if(instance == this.groupListView)
            return groupFactory.createCollectionByAPIResponse(response);
            
        if(instance == this.roomListView)
            return roomFactory.createCollectionByAPIResponse(response);
            
    },
    listviewRender: function(instance,data){
        
        if(instance == this.usersListView)
            return _.template($$('#template_userlist_row').html(), {users: data.models});
            
        if(instance == this.groupListView){
            return _.template($$('#template_grouplist_row').html(), {groups: data.models});
        }
            
        if(instance == this.roomListView){
            var html = _.template($$('#template_roomlist_row').html(), {rooms: data.models});
            return html;
        }
            
    },
    listViewAfterRender: function(instance){
	    
	    this.waitingRequest = false;
	    
	    if(instance == this.usersListView){
            this.prepareChatData();
	    }
  
        if(instance == this.groupListView){
             
        }

        $$('.encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                AvatarManager.process(this,fileId);
            }
            
        });  

        this.updateRowState();
        
    },
    listviewOnClick: function(instance,elm){
    
        if(instance == this.usersListView){
            var userId = $(elm).attr('data-userid');        
            this.tuggleUserId(userId);
        }

        if(instance == this.groupListView){

            var groupId = $(elm).attr('data-groupid');        
            this.tuggleGroupId(groupId);
            
            this.tuggleGroupSelector();
            
        }
        

        if(instance == this.roomListView){

            var roomId = $(elm).attr('data-roomid');        
            this.tuggleRoomId(roomId);
            
            this.tuggleRoomSelector();
            
        }
        
       
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
        
    },
    
    tuggleGroupId: function(groupId){
        
        var self = this;
        var index = _.indexOf(this.selectedGroupIdList,groupId);
        
        if(index == -1){
            this.selectedGroupIdList.push(groupId);
        }else{
            this.selectedGroupIdList.splice(index, 1);   
        }
        
        self.updateRowState();
        
    },
    tuggleRoomId: function(roomId){
        
        var self = this;
        var index = _.indexOf(this.selectedRoomIdList,roomId);
        
        if(index == -1){
            this.selectedRoomIdList.push(roomId);
        }else{
            this.selectedRoomIdList.splice(index, 1);   
        }
        
        self.updateRowState();
        
    }
    

    
});
