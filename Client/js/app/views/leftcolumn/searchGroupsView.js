var SPIKA_SearchGroupsView = Backbone.View.extend({

    initialize: function(options) {
        
        _.bindAll(this, "render");
        this.template = options.template;
		this.displayGroups = new GroupResult([]);
		this.currentPage = 0;
		this.openedPanel = "";
		
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
			self.currentPage = 0;
			self.displayUsers = new UserResult([]); 
            var currentText = $(U.sel("#tb_search_group")).val();
            self.searchGroups(currentText);
        });

        this.searchGroups("");
		
		//handle paging
        $(U.sel('#left_column_third')).scroll(function() {
		
			 if($(U.sel('#left_column_third')).scrollTop() + $(U.sel('#left_column_third')).height() == $(U.sel('#left_column_third')).prop("scrollHeight")) {
				
				var searchText = $(U.sel("#tb_search_group")).val();
				self.currentPage++;
				self.searchGroups(searchText);
				
			}
			
		});
    },
    
	searchGroups:function(keyword){
        
        var self = this;

        apiClient.searchGroups(self.currentPage,keyword,function(data){

            self.displayGroups.add(groupFactory.createCollectionByAPIResponse(data).models);
			
			console.log(groupFactory.createCollectionByAPIResponse(data).models);
            
            var template = _.template($(U.sel('#template_grouplist_row')).html(), {groups: self.displayGroups.models});
            $(U.sel("#group_list")).html(template);
            
			if (self.openedPanel == "left_column_third"){
			
				var listHeight = $(U.sel('#group_list')).prop("scrollHeight");
				var groupsHeight = $(U.sel('#left_column_third')).height();
				
				if (listHeight < groupsHeight && groupFactory.createCollectionByAPIResponse(data).models.length > 0){
					//load new page
					var searchText = $(U.sel("#tb_search_group")).val();
					self.currentPage++;
					self.searchGroups(searchText);
				}
			
			}
			
			
            $(U.sel('#group_list li')).click(function(){
               Backbone.trigger(EVENT_START_GROUP_CHAT,self.displayGroups.searchById($(this).attr('data-groupid')));
               return false;
            });
            
            
        },function(data){
            
            $(U.sel("#group_list")).html("");

        });
        
    }
     
});
