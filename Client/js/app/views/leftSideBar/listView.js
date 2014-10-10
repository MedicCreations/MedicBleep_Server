function SpikaPagingListView(options)
{
    this.parentElmSelector = options.parentElmSelector;
    this.scrollerSelector = options.scrollerSelector;
    this.source = options.source;
    this.currentPage = 0;
    this.list = new Backbone.Collection([]);
    this.reachedToEnd = false;
};

SpikaPagingListView.prototype.init = function(){

    var self = this;
    
	//handle paging
    $$(this.scrollerSelector).scroll(function() {
        
        if(self.reachedToEnd)
            return;
            
	    // load next page if reached to bottom
	    var bottomPos = $$(self.scrollerSelector).scrollTop() + $$(self.scrollerSelector).height();
	    var scrollPos = $$(self.scrollerSelector).prop("scrollHeight");

	    if(bottomPos == scrollPos){
			self.currentPage++;
			self.loadCurrentPage();
		}
		
	});
		
		
}

SpikaPagingListView.prototype.loadCurrentPage = function(){
    
    var self = this;
    
    this.source.listviewRequest(this.currentPage,function(data){
        
        var collectionFromResponse = self.source.listviewGetListFromResponse(data);
        
        self.list.add(collectionFromResponse.models);
        var html = self.source.listviewRender(self.list);
        $$(self.parentElmSelector).html(html);
        
        self.afterRender();
        
    },function(data){

        self.reachedToEnd = true;
    
    });
    
}

SpikaPagingListView.prototype.afterRender = function(){
    
    var self = this;
    
	var actualHeight = $$(this.scrollerSelector).height();
	var listHeight = $$(this.parentElmSelector).height();
	
	// load next page if list view is not filled
	if(listHeight < actualHeight){
    	this.currentPage++;
    	this.loadCurrentPage();
	}
    
    if(!_.isUndefined(this.source.listViewAfterRender))
        this.source.listViewAfterRender();
        
    $$(this.parentElmSelector + " li").unbind();
    
    $$(this.parentElmSelector + " li").click(function(){

        if(!_.isUndefined(self.source.listviewOnClick)){
            self.source.listviewOnClick(this);
        }
            
    });
    
    
}

SpikaPagingListView.prototype.refresh = function(){
    
    this.list = new Backbone.Collection([]);
    this.currentPage = 0;
    this.reachedToEnd = false;
    this.loadCurrentPage();

}


