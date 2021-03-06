var SPIKA_LobbyListView = Backbone.View.extend({
    
    isLoaded : false,
    ignoreAutoSelect:false,
    refreshFromMemory:false,
    chatList:[],
    currentChatId:0,
    lastSelectedChatId:0,
    initialize: function(options) {
        
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_LEAVE_CHAT, function() {
             self.listView.refresh();
        });
        
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
                
        Backbone.on(EVENT_ENTER_CHAT, function(chatId) {
            
            self.currentChatId = chatId;
            
            if(_.isNull(chatId) && self.ignoreAutoSelect == false){
                self.listView.refresh();
            }else{
                //self.refreshFromMemory = true;
                self.listView.refresh();
            }
            
            self.ignoreAutoSelect = false;

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
        }else{
            this.listView.refresh();        
        }
    },

    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(instance,page,succeessListener,failedListener){
        
        if(this.refreshFromMemory){

            _.debounce(function() {
                succeessListener(null);
            }, 100)();
            
        }else{

            apiClient.lobby(function(data){
                
                succeessListener(data);
                
            },function(data){
                
                failedListener(data);
    
            });
        
        }
        
    },
    listviewGetListFromResponse: function(instance,response){
        
        var self = this;
        
        if(this.refreshFromMemory){
            
            var allUnreadCount = 0;
            
            _.each(this.chatList.models,function(model){
                if(self.currentChatId == model.get('chat_id'))
                    model.set('unread',0);
            });
            
            mainView.updateUnreadCount(allUnreadCount);
            
        }else{
    
            this.chatList = chatFactory.createCollectionByAPIResponse(response)
            
            var allUnreadCount = 0;
            
            DataCacheManager.updateChatModelCacheByCollection(this.chatList);

            mainView.updateUnreadCount(allUnreadCount);
            
        }

   
        _.each(this.chatList.models,function(model){
           	           	
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
        
        return this.chatList;

    },
    listviewRender: function(instance,data){
        return _.template($$('#template_chatlist_row').html(), {chats: data.models});
    },
    listViewAfterRender: function(instance){
        
        var self = this;
        
        $$('#menu_container_lobby .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                //EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                AvatarManager.process(this,fileId);
                
            }
            
        });
                
        $$('#menu_container_lobby .menu_list li').each(function(){
            
            var chatIdElm = $(this).attr('chatid');
            
            if(self.refreshFromMemory == false){
            
                if(!_.isNull(mainView.chatView.chatData)){
                    if(chatIdElm == self.lastSelectedChatId)
                        $(this).addClass('selected');        
                }
                
            }else{
                
                if(chatIdElm == self.lastSelectedChatId){
                    $(this).addClass('selected');                   
                }
                
            }

                
        });
            
        this.refreshFromMemory = false;
        
    },
    listviewOnClick: function(instance,elm){
        this.ignoreAutoSelect = true;

        var chatId = $(elm).attr('chatid');
        this.lastSelectedChatId = chatId;
        
        Backbone.trigger(EVENT_START_CHAT,chatId);

        $$('#menu_container_lobby li.selected').removeClass('selected');        
        $(elm).addClass('selected');
        

    }
    
});
