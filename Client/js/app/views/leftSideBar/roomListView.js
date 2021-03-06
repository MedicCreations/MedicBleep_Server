var SPIKA_RoomListView = Backbone.View.extend({
    
    currentKeyword : '',
    currentCategoryId: '',
    isLoaded : false,
    initialize: function(options) {
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_LEAVE_CHAT, function() {
             self.roomListView.refresh();
        });
        
        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
        this.roomListView = new SpikaPagingListView({
            parentElmSelector : "#menu_container_room .menu_list",
            scrollerSelector : "#menu_container_room .scrollable",
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
        
        $$('#menu_container_room input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_room input').val();
            self.roomListView.refresh();
        });

        
        apiClient.getCategories(function(data){
            
            var categoryResult = categoryFactory.createCollectionByAPIResponse(data);
            var categorySelectHtml = _.template($$('#template_categorylist_row').html(), {
                categories: categoryResult.models,
                LANG: LANG
            });
            
            $$("#menu_container_room .menu_search select").html(categorySelectHtml);
            $$("#menu_container_room .menu_search select").chosen({disable_search_threshold: 10});
            $$("#menu_container_room .menu_search select").chosen().change(function(){
                
                var selectedCategoryId = $(this).val();
                
                if(selectedCategoryId != 0)
                    self.currentCategoryId = selectedCategoryId;
                else
                    self.currentCategoryId = '';
                
                 self.roomListView.refresh();
                 
            });
            
        
        },function(data){
        
        
        
        });
        
    },
    
    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_room .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_room .menu_search')
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
        
        apiClient.searchRooms(page,this.currentKeyword,this.currentCategoryId,function(data){
            
            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(instance,response){
        
        var collection = roomFactory.createCollectionByAPIResponse(response);
        
        
        return collection;
    },
    listviewRender: function(instance,data){
        return _.template($$('#template_roomlist_row').html(), {rooms: data.models});
    },
    listViewAfterRender: function(instance){
        
        $$('#menu_container_room .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                //EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                AvatarManager.process(this,fileId);
            }
            
        });

        $$('#menu_container_room li').each(function(){
            
            var chatIdElm = $(this).attr('chatid');

            if(!_.isNull(mainView.chatView.chatData)){
                if(chatIdElm == mainView.chatView.chatData.get('chat_id'))
                    $(this).addClass('selected');        
            }
                
        });
        
    },
    listviewOnClick: function(instance,elm){
        var chatId = $(elm).attr('chatid');
        Backbone.trigger(EVENT_START_CHAT,chatId);

        $$('#menu_container_room li.selected').removeClass('selected');        
        $(elm).addClass('selected');


    },
    
    
});