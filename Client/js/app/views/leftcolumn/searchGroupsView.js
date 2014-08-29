var SPIKA_SearchGroupsView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
        this.displayGroups = null;
        var self = this;
    },
    
    events: {
        
        
        
    },
    
    render: function() {
        
        $(this.el).html(this.template);
        
        var self = this;
        
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
        
    },
    
    onload: function(){
        
		var self = this;
        
        $(U.sel("#tb_search_group")).keyup(function(evt) {
            var currentText = $(U.sel("#tb_search_group")).val();
            self.searchGroups(currentText);
        });

        this.searchGroups("");
    },
    
	searchGroups:function(keyword){
        
        var self = this;

        apiClient.searchGroups(keyword,function(data){

            self.displayGroups = groupFactory.createCollectionByAPIResponse(data);
            
            var template = _.template($(U.sel('#template_grouplist_row')).html(), {groups: self.displayGroups.models});
            $(U.sel("#group_list")).html(template);
            
            $(U.sel('#group_list li')).click(function(){
               Backbone.trigger(EVENT_START_GROUP_CHAT,self.displayGroups.searchById($(this).attr('data-groupid')));
               return false;
            });
            
            
        },function(data){
            
            $(U.sel("#group_list")).html("");

        });
        
    }
     
});
