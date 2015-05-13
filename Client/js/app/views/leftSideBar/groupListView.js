var SPIKA_GroupListView = Backbone.View.extend({
    
    currentKeyword : '',
    isLoaded: false,
    selectedGroupId:0,
    currentCategoryId : '',
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
        
        $$('#menu_container_group input').keyup(function(evt) {
            self.currentKeyword = $$('#menu_container_group input').val();
            self.roomListView.refresh();
        });

        apiClient.getCategories(function(data){
            
            var categoryResult = categoryFactory.createCollectionByAPIResponse(data);
            var categorySelectHtml = _.template($$('#template_categorylist_row').html(), {
                categories: categoryResult.models,
                LANG: LANG
            });
            
            $$("#menu_container_group .menu_search select").html(categorySelectHtml);
            $$("#menu_container_group .menu_search select").chosen({disable_search_threshold: 10});
            $$("#menu_container_group .menu_search select").chosen().change(function(){
                
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
        U.setViewHeight($$("#menu_container_group .scrollable"),[
            $$('header'),$$('#tab_menu'),$$('#nav_bottom'),$$('#menu_container_group .menu_search')
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
        
        apiClient.searchGroups(page,this.currentKeyword,this.currentCategoryId,function(data){

            succeessListener(data);
            
        },function(data){
            
            failedListener(data);

        });
        
    },
    listviewGetListFromResponse: function(instance,response){
        return groupFactory.createCollectionByAPIResponse(response)
    },
    listviewRender: function(instance,data){
        return _.template($$('#template_grouplist_row').html(), {groups: data.models});
    },
    listViewAfterRender: function(instance){
        
        var self = this;
        
        $$('#menu_container_group .encrypted_image').each(function(){
        
            var state = $(this).attr('state');
            var fileId = $(this).attr('fileid');
            
            if(state == 'loading'){
                
                //EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                AvatarManager.process(this,fileId);
                 
            }
            
        });
        
        $$('#menu_container_group li').each(function(){
            
            var groupId = $(this).attr('data-groupid');
            
            
            if(groupId == self.selectedGroupId)
                $(this).addClass('selected'); 
            else
                $(this).removeClass('selected'); 
                 
        });
        
    },
    listviewOnClick: function(instance,elm){
        
        var groupId = $(elm).attr('data-groupid');
        this.selectedGroupId = groupId;
        
        $$('#menu_container_group li.selected').removeClass('selected');        
        $(elm).addClass('selected');
        
        apiClient.getGroupById(groupId,function(data){
            
            var modelGroup = groupFactory.createModelByAPIResponse(data.group);
            
            apiClient.startGroupChat(modelGroup,function(data){
  
                
                if(!_.isUndefined(data.chat_id)){
                    
                    Backbone.trigger(EVENT_START_CHAT,data.chat_id);
                    
                }
            
            },function(data){
            
            
            
            });
        
        
        },function(data){
        
        
        
        });
        
    }

    
});