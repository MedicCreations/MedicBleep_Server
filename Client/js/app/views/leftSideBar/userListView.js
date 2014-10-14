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

        var self = this;
            
        $$('#menu_container_user .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                    
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
    listviewOnClick: function(elm){
        
        var userId = $(elm).attr('data-userid');
        this.selectedUserId = userId;
        
        $$('#menu_container_user li.selected').removeClass('selected');        
        $(elm).addClass('selected');
        
        apiClient.getUserById(userId,function(data){

            var modelUser = userFactory.createModelByAPIResponse(data.user);
        
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