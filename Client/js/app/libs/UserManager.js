SPIKA_UserManager = {
    
    loginedUser: null,
    setUser: function(userModel){
        this.loginedUser = userModel;
    },
    getUser: function(){
        return this.loginedUser;
    },
    isAuthorised: function(){
        return !_.isNull(this.loginedUser);
    }
    
}