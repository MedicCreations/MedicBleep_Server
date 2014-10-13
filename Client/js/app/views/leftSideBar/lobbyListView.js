var SPIKA_LobbyListView = Backbone.View.extend({
    
    isLoaded : false,
    initialize: function(options) {
        
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
              
        Backbone.on(EVENT_NEW_MESSAGE, function(chatId) {
            
            if(!_.isNull(mainView.chatView)
                && !_.isNull(mainView.chatView.chatData)
                && !_.isUndefined(mainView.chatView.chatData.get('chat_id'))
                && mainView.chatView.chatData.get('chat_id') == chatId){
                
                return;
                
            }
            
            self.listView.refresh();
        });


        Backbone.on(EVENT_REFRESH_ROOMLIST, function(chatId) {
            self.listView.refresh();
        });
                
        Backbone.on(EVENT_START_CHAT, function(chatId) {
            if(_.isNull(chatId))
                self.listView.refresh();
        });
          
        this.listView = new SpikaPagingListView({
            parentElmSelector : "#menu_container_lobby .menu_list",
            scrollerSelector : "#menu_container_lobby .scrollable",
            source :  this
        });
        
        this.listView.enablePaging = false;

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
    },

    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_lobby .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom')
        ])
    },

    onOpen: function(){
        if(!this.isLoaded){
            this.listView.init();
            this.listView.loadCurrentPage();
            this.isLoaded = true;
        }
        this.listView.refresh();
    },

    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(page,succeessListener,failedListener){

        apiClient.lobby(function(data){

            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(response){
        var collection = chatFactory.createCollectionByAPIResponse(response)
        
        var allUnreadCount = 0;
        
        _.each(collection.models,function(model){
            
            var unreadText = "";
            
            if(model.get('unread') == 1){
                unreadText = model.get('unread') + " " + LANG.unread_messages_singlar;   
            } else if(model.get('unread') > 1){
                unreadText = model.get('unread') + " " + LANG.unread_messages_plural;                
            }
                
            model.set('unread_formatted',unreadText);
            
            allUnreadCount += parseInt(model.get('unread'));
        });

        if(allUnreadCount > 0){
            
            $$('#tab_btn_inbox i').addClass('textred');
                
        } else {

            $$('#tab_btn_inbox i').removeClass('textred');
            
        }
        
        return collection;

    },
    listviewRender: function(data){
        return _.template($$('#template_chatlist_row').html(), {chats: data.models});
    },
    listViewAfterRender: function(){

        $$('#menu_container_lobby .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                    
            }
            
        });
        

    },
    listviewOnClick: function(elm){
        var chatId = $(elm).attr('chatid');
        Backbone.trigger(EVENT_START_CHAT,chatId);
    }
    
});
