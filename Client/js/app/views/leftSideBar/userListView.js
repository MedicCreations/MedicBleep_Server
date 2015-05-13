var SPIKA_UserListView = Backbone.View.extend({
    
    currentKeyword : '',
    isLoaded: false,
    selectedUserId:0,
    initialize: function(options) {
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
        this.roomListView = new SpikaPagingListView({
            parentElmSelector : "#menu_container_user .menu_list",
            scrollerSelector : "#menu_container_user .scrollable",
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
        
        $$('#menu_container_user input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_user input').val();
            self.roomListView.refresh();
        });
        
    },
    
    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_user .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_user .menu_search')
        ])
    },
    
    onOpen: function(){
        if(!this.isLoaded){
            this.roomListView.init();
            this.roomListView.loadCurrentPage();
            this.isLoaded = true;
        }else{
            this.roomListView.refresh();        
        }
    },
    
    
    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(instance,page,succeessListener,failedListener){
        
        apiClient.searchUsers(page,this.currentKeyword,function(data){

            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(instance,response){

        var collection = userFactory.createCollectionByAPIResponse(response);
        
        for( i in collection.models){
            
            var userModel = collection.models[i];
            
            if(userModel.get('device') == DEVICE_WEB){
                userModel.set('device_name',LANG.device_type_prefix + ' Web ' + LANG.device_type_suffix);
            }
            
            if(userModel.get('device') == DEVICE_IOS){
                userModel.set('device_name',LANG.device_type_prefix + ' iOS ' + LANG.device_type_suffix);
            }
            
            if(userModel.get('device') == DEVICE_ANDROID){
                userModel.set('device_name',LANG.device_type_prefix + ' Android ' + LANG.device_type_suffix);
            }
            
            
        }
        
        return collection;
        
    },
    listviewRender: function(instance,data){
        return _.template($$('#template_userlist_row').html(), {users: data.models});
    },
    listViewAfterRender: function(instance){

        var self = this;
            
        $$('#menu_container_user .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                AvatarManager.process(this,fileId);
                    
            }
            
        });
        
        $$('#menu_container_user li').each(function(){
            
            var userId = $(this).attr('data-userid');
            
            if(userId == self.selectedUserId)
                $(this).addClass('selected'); 
            else
                $(this).removeClass('selected'); 
                 
        });
        
    },
    listviewOnClick: function(instance,elm){
        
        var userId = $(elm).attr('data-userid');
        this.selectedUserId = userId;
        
        $$('#menu_container_user li.selected').removeClass('selected');        
        $(elm).addClass('selected');

        apiClient.getUserById(userId,function(data){

            var modelUser = userFactory.createModelByAPIResponse(data.user);
			
			SPIKA_UserManager.saveUserDataToCache(userId,modelUser);
			
            apiClient.startPrivateChat(modelUser,function(data){
                
                if(!_.isUndefined(data.chat_id)){
                    
                    Backbone.trigger(EVENT_START_CHAT,data.chat_id);
                    
                }
            
            },function(data){
            
            
            
            });
        
        
        },function(data){
        
        
        
        });
        
    }
    
});