function SpikaClient(apiEndPointUrl,videoEncoderUrl)
{
    this.apiEndPointUrl = apiEndPointUrl;
    this.videoEncoderUrl = videoEncoderUrl;
    this.currentUser = null;
    this.authorized = false;
    this.error = false;
    this.UA = 'SpikaEnterprise Web v1.0';
};

// error handling
SpikaClient.prototype.handleLogicalErrors = function(data,listener){
    
    if(this.error == true){
        listener(data);
        return;
    }
    
    this.error = true;
    
    if(data.code == 1001 || data.code == 1000){ // invalid token, token expired
        alert('Your token is expired or you logged in from another device. Please login again.');
        Backbone.trigger(EVENT_FORCE_LOGOUT);
    }else if(data.code == 1017 ){ 
        alert('Your account reaches limit of disk space.');
        listener(data);
    }else{
        listener(data);
    }
    
}

// error handling
SpikaClient.prototype.handleCriticalErrors = function(jqXHR,listener){
    

    this.error = true;
    
    if(jqXHR.status == 403){
        alert('Your token is expired or you logged in from another device. Please login again.');
        Backbone.trigger(EVENT_FORCE_LOGOUT);
    }else{
        //alert('Something is wrong with server or internet connection. Plase ask your administrator for detail.');
        //Backbone.trigger(EVENT_FORCE_LOGOUT);
    }

    listener(jqXHR);
    
}

// Login
SpikaClient.prototype.prelogin = function(userName,password,succeessListener,failedListener)
{
    
    this.error = false;
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
        
    password = CryptoJS.MD5(password).toString();
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/prelogin',
        type: 'POST',
        data: 'json',
        data:{'username':userName,'password':password},
        headers: {"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000 && data.token != ''){
            
            succeessListener(data);
            
        } else if(data.code == 1003){ // invalid login
        
            failedListener(data);
            
        }else {
        
            self.handleLogicalErrors(data,failedListener);
            
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// Login
SpikaClient.prototype.login = function(userName,password,organizationId,succeessListener,failedListener)
{
    
    this.error = false;
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    password = CryptoJS.MD5(password).toString();
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/login',
        type: 'POST',
        data: 'json',
        data:{
            'username':userName,
            'password':password,
            'organization_id':organizationId
        },
        headers: {"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000 && data.token != ''){
            
            this.currentUser = userFactory.createModelByAPIResponse(data);
            
            self.token = data.token;
            
            self.authorized = true;
            
            succeessListener(data);
            
        } else if(data.code == 1003){ // invalid login
        
            failedListener(data);
            
        }else {
        
            self.handleLogicalErrors(data,failedListener);
            
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.logout = function(succeessListener,failedListener)
{
    
    this.error = false;
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/logout',
        type: 'POST',
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        this.currentUser = null;
        self.token = '';
        self.authorized = false;
        succeessListener(data);
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        this.currentUser = null;
        self.token = '';
        self.authorized = false;
        succeessListener(textStatus);
    });

};

// get users
SpikaClient.prototype.searchUsers = function(page,search,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();	
	var requestParams = {};
    
    requestParams.search = search;
	
	if (page > 0){
		requestParams.page = page;
		}
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// get groups
SpikaClient.prototype.searchGroups = function(page,search,categoryId,succeessListener,failedListener)
{
    
	var self = this;
	
	var requestParams = {};
    var countryCode = SPIKA_LocationManager.getCountry();   
    
    requestParams.search = search;
    requestParams.category_id = categoryId;
	
	if (page > 0){
		requestParams.page = page;
		}
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/groups/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
           self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// get rooms
SpikaClient.prototype.searchRooms = function(page,search,categoryId,succeessListener,failedListener)
{
    
    var self = this;
	
	var requestParams = {};
    var countryCode = SPIKA_LocationManager.getCountry();
    
    requestParams.search = search;
    requestParams.category_id = categoryId;
	
	if (page > 0){
		requestParams.page = page;
    }
    

    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/room/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// lobby
SpikaClient.prototype.lobby = function(succeessListener,failedListener)
{
    
    var self = this;
    
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/lobby/list?type=3',
        type: 'GET',
        data: 'json',
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code": countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// start chat
SpikaClient.prototype.startPrivateChat = function(userModel,succeessListener,failedListener)
{
    
    var self = this;
    
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/chat/start',
        type: 'POST',
        data: 
            {
                user_id:userModel.get('id'),
                firstname:userModel.get('firstname'),
                lastname:userModel.get('lastname')
            },
        headers: {
	        	"token":this.token,
	        	"api-agent":this.UA,
	        	"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// start chat
SpikaClient.prototype.startGroupChat = function(groupModel,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/groups/chat/start',
        type: 'POST',
        data: 
            {
                group_id:groupModel.get('id'),
                groupname:groupModel.get('groupname')
            },
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// send message
SpikaClient.prototype.sendMessage = function(data,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/send',
        type: 'POST',
        data: data,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// get messages
SpikaClient.prototype.getMessages = function(chatId,lastMessageId,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestParams = {};
    
    requestParams.chat_id = chatId;
    
    if(lastMessageId > 0)
        requestParams.last_msg_id = lastMessageId;
        
    requestParams.country_code = SPIKA_LocationManager.getCountry();
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/paging',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// get new messages
SpikaClient.prototype.getNewMessages = function(chatId,firstMessageId,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestParams = {};
    
    requestParams.chat_id = chatId;
    requestParams.first_msg_id = firstMessageId;
    requestParams.country_code = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/new',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};



SpikaClient.prototype.fileUpload = function(file,succeessListener,failedListener,progressListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();
	
    // login
    var formData = new FormData();
    formData.append('file', file);
    
    var request = $.ajax({
        url: this.apiEndPointUrl + '/file/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode},
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress',function(ev) {
                    if (ev.lengthComputable) {
                        var percentUploaded = Math.floor(ev.loaded * 100 / ev.total);
                        progressListener(percentUploaded);
                    } else {

                    }
               }, false);
            }
            return myXhr;
        }
    });
    
    request.done(function( data ) {
                
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    request.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

}


// get chat users
SpikaClient.prototype.getChatMembers = function(chat_id,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();    
	
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/list',
        type: 'GET',
        data: {chat_id:chat_id},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.addUserToChat = function(chatId,userId,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();   
	
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/add',
        type: 'POST',
        data: {chat_id:chatId,users_to_add:userId},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


SpikaClient.prototype.getUserById = function(userId,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestParams = {};
    
    requestParams.user_id = userId;
    requestParams.get_detail_values = 1;
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/profile',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.getGroupById = function(groupId,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();    
	
    var requestParams = {};
    
    requestParams.group_id = groupId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/groups/profile',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


SpikaClient.prototype.getThreadMessages = function(rootMessageId,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();    
	
    var requestParams = {};
    
    requestParams.root_id = rootMessageId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/child/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.getChatById = function(chatId,succeessListener,failedListener)
{
    
    var self = this;
    
    var requestParams = {};
	var countryCode = SPIKA_LocationManager.getCountry();    
	
    requestParams.chat_id = chatId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/data',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


SpikaClient.prototype.downloadFile = function(fileId,succeessListener,failedListener,progressListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();
	    
    var requestParams = {
        file_id : fileId
    };
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/file/download',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode},
        xhr: function() {

            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;

                }
           }, false);
    
           xhr.addEventListener("progress", function(evt) {
               if (evt.lengthComputable) {
                   var percentComplete = evt.loaded / evt.total;

               }
           }, false);
    
           return xhr;
        }
    });
    

    requestLogin.done(function( data ) {
        
        if(data.search('code') != -1){
            
            data = JSON.parse(data);
            
            if(data.code == 1010){
                failedListener(data);
                return;
            }
            
        }
        succeessListener(data);
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.saveProflie = function(userId,values,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();    
	
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/updateProflie',
        type: 'POST',
        data: values,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.saveProfliePicture = function(userId,fileId,thumbId,succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();   
	
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/update',
        type: 'POST',
        data: {image:fileId,image_thumb:thumbId},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.createNewRoom = function(roomName,password,isPrivate,categoryId,userList,groupIds,roomIds,fileId,thumbId,succeessListener,failedListener)
{

    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();
	
    var passwordHashed = "";
    
    if(!_.isEmpty(password)){
	    passwordHashed = CryptoJS.MD5(password).toString();
    }
    
    if(isPrivate)
        isPrivate = 1;
    else
        isPrivate = 0;
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/room/create',
        type: 'POST',
        data: {name:roomName,
                is_private:isPrivate,
	        	category_id:categoryId,
	        	user_ids:userList,
	        	group_all_ids:groupIds,
	        	group_ids:groupIds,
	        	room_all_ids:roomIds,
	        	room_ids:roomIds,
	        	image:fileId,
	        	image_thumb:thumbId,
	        	password: passwordHashed},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.updateRoom = function(chatId,roomName,password,isPrivate,categoryId,fileId,thumbId,isDelete,isActive,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    var data = {};
    
    data.chat_id = chatId;

    if(isPrivate)
        isPrivate = 1;
    else
        isPrivate = 0;
        
    if(!_.isEmpty(roomName))
        data.name = roomName;
        
    if(!_.isEmpty(password))
        data.password = CryptoJS.MD5(password).toString();

    if(!_.isEmpty(fileId))
        data.image = fileId;
        
    if(!_.isEmpty(thumbId))
        data.image_thumb = thumbId;
        
    if(!_.isEmpty(isDelete))
        data.is_deleted = isDelete;
        
    if(!_.isEmpty(isActive))
        data.is_active = isActive;
        
    if(!_.isEmpty(roomName))
        data.name = roomName;
        
    if(!_.isEmpty(categoryId))
        data.category_id = categoryId;

    data.is_private = isPrivate;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/update',
        type: 'POST',
        data: data,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.addUsersToChat = function(chatId,usersToAdd,groupsToAdd,roomsToAdd,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    var data = {};
    
    data.chat_id = chatId;
    data.user_ids = usersToAdd;
    data.group_all_ids = groupsToAdd;
    data.room_all_ids = roomsToAdd;

    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/add',
        type: 'POST',
        data: data,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.deleteUsersFromChat = function(chatId,usersToDelete,groupsToDelete,roomsToDelete,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    var data = {};
    
    data.chat_id = chatId;
    data.user_ids = usersToDelete;
    data.group_ids = groupsToDelete;
    data.room_ids = roomsToDelete;

    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/remove',
        type: 'POST',
        data: data,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


// get users
SpikaClient.prototype.sendKeepAlive = function(succeessListener,failedListener)
{
    
    var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/webkeepalive',
        type: 'GET',
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            // ignore error its not important when failed this
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        failedListener(textStatus);
    });

};


SpikaClient.prototype.deleteMessage = function(messageId,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/delete',
        type: 'POST',
        data: {message_id:messageId},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};



SpikaClient.prototype.mixAudioVideo = function(fileVideo,fileAudio,succeessListener,failedListener,progressListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    // browser compatibility
    if (bowser.chrome || bowser.android) {
        fileVideo.name = 'video.webm';
    }else if(bowser.firefox) {
        fileVideo.name = 'video.mp4';
    }else {
        fileVideo.name = 'video.webm';
    }
    
    fileAudio.name = 'audio.wav';
            
    var formData = new FormData();
    formData.append('audioFile', fileAudio,fileAudio.name);
    formData.append('videoFile', fileVideo,fileVideo.name);
    
    var request = $.ajax({
        url: this.videoEncoderUrl + '/audio_video_mixser.php',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode},
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress',function(ev) {
                    if (ev.lengthComputable) {
                        var percentUploaded = Math.floor(ev.loaded * 100 / ev.total);
                        progressListener(percentUploaded);
                    } else {

                    }
               }, false);
            }
            return myXhr;
        }
    });
    
    request.done(function( data ) {
        
        data = JSON.parse(data);
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    request.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

}

// get groups
SpikaClient.prototype.getCategories = function(succeessListener,failedListener)
{
    
	var self = this;
	var countryCode = SPIKA_LocationManager.getCountry();
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/category/list',
        type: 'GET',
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
           self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.updatePasword = function(newPasword,succeessListener,failedListener)
{
    
	var hashedPassword = CryptoJS.MD5(newPasword).toString();
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/password/update',
        type: 'POST',
        data: {new_password:hashedPassword},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.sendTempPassword = function(username,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/password/forgot',
        type: 'POST',
        data: {username:username},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


SpikaClient.prototype.resetPassword = function(tempPass,newPass,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/password/change',
        type: 'POST',
        data: {
            temp_password:CryptoJS.MD5(tempPass).toString(),
            new_password:CryptoJS.MD5(newPass).toString()                
        },
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

SpikaClient.prototype.getStickers = function(succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/stickers',
        type: 'GET',
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


// get chat users
SpikaClient.prototype.getChatMembersAll = function(chat_id,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/member/list',
        type: 'GET',
        data: {chat_id:chat_id,type:4},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};


// get chat note
SpikaClient.prototype.getChatNote = function(chat_id,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/note',
        type: 'GET',
        data: {chat_id:chat_id},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};

// save chat note
SpikaClient.prototype.saveChatNote = function(chat_id,notes,succeessListener,failedListener)
{
    
    var self = this;
    var countryCode = SPIKA_LocationManager.getCountry();
    
    U.l(chat_id);
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/note',
        type: 'POST',
        data: {chat_id:chat_id,notes:notes},
        headers: {"token":this.token,"api-agent":this.UA,"Country-Code":countryCode}
    });
    
    requestLogin.done(function( data ) {
        
        if(data.code == 2000){
            succeessListener(data);
        } else {
            self.handleLogicalErrors(data,failedListener);
        }
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};




SpikaClient.prototype.test = function()
{
    alert('test');
};