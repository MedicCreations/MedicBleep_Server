SPIKA_UserManager = {
    
    loginedUser: null,
    userDataCache: {},
    preloginData: {},
    setUser: function(userModel){
        this.loginedUser = userModel;
    },
    getUser: function(){
        return this.loginedUser;
    },
    isAuthorised: function(){
        return !_.isNull(this.loginedUser);
    },
    getUserDataFromCache:function(userId){
	    return this.userDataCache[userId];
    },
    saveUserDataToCache:function(userId,data){
	    this.userDataCache[userId] = data;
    }
    
}