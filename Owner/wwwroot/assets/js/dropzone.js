var DropZone = {
    
    elementId : '#cfsdropzone',
    height : 50,
    init:function(){
        
        var self = this;
        
        $(window).resize(function() {
            self.updateWindowSize();
        });
        
        this.updateWindowSize();
        
    },
    updateWindowSize:function(){
        
        var width = $(window).width();
        var height = $(window).height();
        var left = $('#left-sidebar').width();
        
        $(this.elementId).css('left',left);
        $(this.elementId).css('width',width - left);
        $(this.elementId).css('height',this.height);
        
        if(width < 770){
            $(this.elementId).css('display','none');
        }else{
            $(this.elementId).css('display','block');
        }
    }
    
}