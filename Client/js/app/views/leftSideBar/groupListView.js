var SPIKA_GroupListView = Backbone.View.extend({
    
    currentKeyword : '',
    initialize: function(options) {
        var self = this;
        this.template = options.template;

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
        });
        
        this.roomListView = new SpikaPagingListView({
            parentElmSelector : "#menu_container_group .menu_list",
            scrollerSelector : "#menu_container_group .scrollable",
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
        
        $$('#menu_container_group input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_group input').val();
            self.roomListView.refresh();
        });
        
    },
    
    updateWindowSize: function(){
        U.setViewHeight($$("#menu_container_group .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_group .menu_search')
        ])
    },
    
    ////////////////////////////////////////////////////////////////////////////////
    // listview functions
    ////////////////////////////////////////////////////////////////////////////////
    
    listviewRequest: function(page,succeessListener,failedListener){
        
        apiClient.searchGroups(page,this.currentKeyword,function(data){

            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(response){
        return groupFactory.createCollectionByAPIResponse(response)
    },
    listviewRender: function(data){
        return _.template($$('#template_grouplist_row').html(), {groups: data.models});
    },
    listViewAfterRender: function(){
        
        $$('#menu_container_group .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                    
            }
            
        });
        
    },
    listviewOnClick: function(elm){
        
        var groupId = $(elm).attr('data-groupid');
        
        U.l(groupId);
        
        apiClient.getGroupById(groupId,function(data){
            
            U.l(data);
            
            var modelGroup = groupFactory.createModelByAPIResponse(data.group);
            
            U.l(modelGroup);
            
            apiClient.startPrivateChat(modelGroup,function(data){
                
                if(!_.isUndefined(data.chat_id)){
                    
                    Backbone.trigger(EVENT_START_CHAT,data.chat_id);
                    
                }
            
            },function(data){
            
            
            
            });
        
        
        },function(data){
        
        
        
        });
        
    }

    
});