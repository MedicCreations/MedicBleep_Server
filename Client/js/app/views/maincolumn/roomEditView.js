var SPIKA_RoomEditView = Backbone.View.extend({
    
    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        this.currentPage = 0;
        this.displayUsers = new UserResult([]);
        this.memberUsers = new UserResult([]);
        this.currentKeyword = '';
        this.lastParentViewHeight = 0;
        this.uploadedFileData = {};
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
        this.displayUsers = new UserResult([]); 
        this.searchUsers(this.currentKeyword);
        
        //handle paging
        var scrollDivSel = U.sel('#room_info_allusers .user_select');
        var self = this;
        
        $(U.sel("#tb_search_user_room")).keyup(function(evt) {
			self.currentPage = 0;
			self.displayUsers = new UserResult([]); 
            self.currentKeyword = $(U.sel("#tb_search_user_room")).val();
            self.searchUsers(self.currentKeyword);
        });
        
        
        $(scrollDivSel).scroll(function() {
        
            if($(scrollDivSel).scrollTop() + $(scrollDivSel).height() == $(scrollDivSel).prop("scrollHeight")) {
                self.currentPage++;
                self.searchUsers(self.currentKeyword);
            }
        
        });

        $(U.sel('#room_edit_avatarimage img')).click(function(){
            $(U.sel("#btn_dummy_file_upload_room_info")).click();
        });

        $(U.sel('#btn_saveroominfo')).click(function(){
            self.saveInfo();
        });
        
        $(U.sel("#btn_dummy_file_upload_room_info")).change(function (evt){
            
            var files = evt.target.files; // FileList object
            
            var file = files[0];
            
            var fileType = file.type;
            
            if(!fileType.match(/png/)){
                alert('Please upload only png');
                return;
            }
                
            self.showAvatarLoading();
            
            fileUploadHandler.profliePictureUpload(file,function(data){
                
                self.hideAvatarLoading();
                
                if(_.isUndefined(data.fileId) ||
                    _.isUndefined(data.thumbId)){
                    
                    self.hideAvatarLoading();
                    return;
                }
        
                EncryptManager.decryptImage($(U.sel('#room_edit_avatarimage img')),data.thumbId,0,apiClient,function(){
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
    
    updateWindowSize: function(mainViewHeight){
        
        this.lastParentViewHeight = mainViewHeight;
        
        $(U.sel('#room_edit_view')).height(mainViewHeight);
        var roomInfoViewHeight = $(U.sel('#room_info')).outerHeight();
        var roomInfoMembersViewHeight = $(U.sel('#room_info_member')).outerHeight();
        var memberSelectViewHeight = mainViewHeight - roomInfoViewHeight - roomInfoMembersViewHeight - 30 - 15 - 20; // padding / p / textbox
        $(U.sel('#room_info_allusers .user_select')).height(memberSelectViewHeight);        
        
    },
    
    searchUsers:function(keyword){

        var self = this;
        
        apiClient.searchUsers(self.currentPage,keyword,function(data){
            
            self.displayUsers.add(userFactory.createCollectionByAPIResponse(data).models);
            
            self.renderUsersData();
            
            // check to load more
			var listHeight = $(U.sel('#room_info_allusers .user_select')).prop("scrollHeight");
			var parentHeight = $(U.sel('#room_info_allusers .user_select')).height();
			
			if (listHeight <= parentHeight && userFactory.createCollectionByAPIResponse(data).models.length > 0){
			    
				//load new page
				self.currentPage++;
				self.searchUsers(self.currentKeyword);
				
			}

            
        },function(data){
            
            $(U.sel("#user_list")).html("");

        });
        
    },  
    renderUsersData:function(){
           
        var self = this;         
        var template = _.template($(U.sel('#template_userlist_row_editroom')).html(), {users: this.displayUsers.models});
        $(U.sel("#room_info_allusers .user_select")).html(template);
        
        $(U.sel("#room_info_allusers .user_select li")).each(function(){
            
            var rowUserId = $(this).attr('data-userid');
            var theLineElm = this;
            
            self.memberUsers.each(function(selectedUser){
                if(rowUserId == selectedUser.get('id')){
                    $(theLineElm).css('font-weight','bold');
                }
            });
            
        });
    
        var template = _.template($(U.sel('#template_memberlist_editroom')).html(), {users: this.memberUsers.models});
        $(U.sel("#room_info_member .user_member")).html(template);
        this.updateWindowSize(this.lastParentViewHeight);
        
        $(U.sel('#room_info_allusers .user_select li')).click(function(){
            var userId = $(this).attr('data-userid');
            var isExist = self.addToMember(userId);
            
            if(isExist){
                self.removeFromMember(userId);
            }
        });
 
        $(U.sel('#room_info_member .user_member div')).click(function(){
            var userId = $(this).attr('data-userid');
            self.removeFromMember(userId);
        });

            
    },
    addToMember:function(userId){

        var isExist = false;
        
        this.memberUsers.each(function(selectedUser){
            if(userId == selectedUser.get('id')){
                isExist = true;
            }
        });
        
        if(isExist == false){
            this.memberUsers.add(this.displayUsers.searchById(userId));
            this.renderUsersData();
        }
        
        return isExist;
        
    },
    removeFromMember:function(userId){
        var removeUser = this.memberUsers.searchById(userId);
        this.memberUsers.remove(removeUser);
        this.renderUsersData();
    },
    showAvatarLoading:function(){
        $(U.sel("#room_edit_avatarimage i")).show();
    },
    hideAvatarLoading:function(){
        $(U.sel("#room_edit_avatarimage i")).hide();
    },
    saveInfo:function(){
        
        var roomName = $(U.sel("#room_info_detail input")).val();
        
        if(_.isEmpty(roomName)){
            alert('Please enter room name');
            return;
        }
        
        var userIds = '';
        
        this.memberUsers.each(function(selectedUser){
            userIds += selectedUser.get('id') + ",";
        });
        
        if(_.isEmpty(userIds)){
            alert('Please select at least on user');
            return;
        }
        
        userIds += SPIKA_UserManager.getUser().get('id');
        
        var fileId = '';
        var thumbId = '';
        
        if(!_.isEmpty(this.uploadedFileData)){
            fileId = this.uploadedFileData.fileId;
            thumbId = this.uploadedFileData.thumbId;
        }
        
        
        apiClient.createNewRoom(roomName,userIds,fileId,thumbId,function(data){
            
            if(!_.isNull(data.chat)){
                Backbone.trigger(EVENT_START_CHAT_BY_CHATDATA,chatFactory.createModelByAPIResponse2(data.chat));
            }
            
        },function(data){
            
            alert('Failed to create new room');

        });
        
    }
});
