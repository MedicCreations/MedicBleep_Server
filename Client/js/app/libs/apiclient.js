function SpikaClient(apiEndPointUrl)
{
    this.apiEndPointUrl = apiEndPointUrl;
    this.currentUser = null;
    this.authorized = false;
    this.error = false;
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
    }else{
        listener(data);
    }
    
}

// error handling
SpikaClient.prototype.handleCriticalErrors = function(jqXHR,listener){
    
    if(this.error == true){
        return;
    }
    
    this.error = true;
    
    if(jqXHR.status == 403){
        alert('Your token is expired or you logged in from another device. Please login again.');
        Backbone.trigger(EVENT_FORCE_LOGOUT);
    }else{
        //alert('Something is wrong with server or internet connection. Plase ask your administrator for detail.');
        //Backbone.trigger(EVENT_FORCE_LOGOUT);
    }
    
}

// Login
SpikaClient.prototype.login = function(userName,password,succeessListener,failedListener)
{
    
    this.error = false;
    var self = this;
    
    password = CryptoJS.MD5(password).toString();
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/login',
        type: 'POST',
        data: 'json',
        data:{'username':userName,'password':password}
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

// get users
SpikaClient.prototype.searchUsers = function(page,search,succeessListener,failedListener)
{
    
    var self = this;
	
	var requestParams = {};
    
    requestParams.search = search;
	
	if (page > 0){
		requestParams.page = page;
		}
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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
SpikaClient.prototype.searchGroups = function(page,search,succeessListener,failedListener)
{
    
	var self = this;
	
	var requestParams = {};
    
    requestParams.search = search;
	
	if (page > 0){
		requestParams.page = page;
		}
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/groups/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/lobby/list?type=3',
        type: 'GET',
        data: 'json',
        headers: {"token":this.token}
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/chat/start',
        type: 'POST',
        data: 
            {
                user_id:userModel.get('id'),
                firstname:userModel.get('firstname'),
                lastname:userModel.get('lastname')
            },
        headers: {"token":this.token}
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/groups/chat/start',
        type: 'POST',
        data: 
            {
                group_id:groupModel.get('id'),
                groupname:groupModel.get('groupname')
            },
        headers: {"token":this.token}
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/send',
        type: 'POST',
        data: data,
        headers: {"token":this.token}
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
    
    var requestParams = {};
    
    requestParams.chat_id = chatId;
    
    if(lastMessageId > 0)
        requestParams.last_msg_id = lastMessageId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/paging',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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
    
    var requestParams = {};
    
    requestParams.chat_id = chatId;
    requestParams.first_msg_id = firstMessageId;
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/new',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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

    // login
    var formData = new FormData();
    formData.append('file', file);
    
    var request = $.ajax({
        url: this.apiEndPointUrl + '/file/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {"token":this.token},
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
        
        U.l(data);
        
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/list',
        type: 'GET',
        data: {chat_id:chat_id},
        headers: {"token":this.token}
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
    
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/member/add',
        type: 'POST',
        data: {chat_id:chatId,users_to_add:userId},
        headers: {"token":this.token}
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
    
    var requestParams = {};
    
    requestParams.user_id = userId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/user/profile',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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
    
    var requestParams = {};
    
    requestParams.root_id = rootMessageId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/message/child/list',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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
    
    requestParams.chat_id = chatId;
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/chat/data',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
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


SpikaClient.prototype.downloadFile = function(fileId,succeessListener,failedListener)
{
    
    var self = this;
    
    var requestParams = {
        file_id : fileId
    };
        
    var requestLogin = $.ajax({
        url: this.apiEndPointUrl + '/file/download',
        type: 'GET',
        data: requestParams,
        headers: {"token":this.token}
    });
    
    requestLogin.done(function( data ) {
        
        succeessListener(data);
        
    });
    
    requestLogin.fail(function( jqXHR, textStatus ) {
        self.handleCriticalErrors(jqXHR,failedListener);
    });

};



SpikaClient.prototype.test = function()
{
    alert('test');
};