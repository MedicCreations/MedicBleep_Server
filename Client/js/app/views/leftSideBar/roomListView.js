var SPIKA_RoomListView = Backbone.View.extend({
    
    currentKeyword : '',
    initialize: function(options) {
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });

        Backbone.on(EVENT_NEW_MESSAGE, function(chatId) {
        
            // if chat id is null the signal is for rehresshing lobby
            if(_.isNull(chatId))
                self.roomListView.refresh();

        });
        
        Backbone.on(EVENT_START_CHAT, function(chatId) {

            if(_.isNull(chatId))
                self.roomListView.refresh();
            
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
        this.roomListView.init();
        this.roomListView.loadCurrentPage();
        
        $$('#menu_container_room input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_room input').val();
            self.roomListView.refresh();
        });
        
    },
    
    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_room .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_room .menu_search')
        ])
    },
    
    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(page,succeessListener,failedListener){
        
        apiClient.searchRooms(page,this.currentKeyword,function(data){

            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(response){
        
        var collection = roomFactory.createCollectionByAPIResponse(response);
        
        _.each(collection.models,function(model){
            
            var unreadText = "";
            
            if(model.get('unread') > 0)
                unreadText = '(' + model.get('unread') + ')';
                
            model.set('unread_formatted',unreadText);
            
        });
        
        return collection;
    },
    listviewRender: function(data){
        return _.template($$('#template_roomlist_row').html(), {rooms: data.models});
    },
    listViewAfterRender: function(){
        
        $$('#menu_container_room .encrypted_image').each(function(){
        
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
    },
    
    
});