var SPIKA_ProgressView = Backbone.View.extend({
    
    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        
        var template = _.template(this.template);
        $(this.el).html(template(LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    onload : function(){

        var self = this;
            
    }
    
});

var SPIKA_ProgressManager = {
    
    isShowing : false,
    template : '<div id="progress_view" style="display:none"> <div id="progress_box"><h3></h3><p></p><div class="meter"><span style="width: 25%"></span></div></div> </div>',
    
    show : function(text){
        
        if(this.isShowing == true)
            return;
            
        this.isShowing = true;
        var self = this;
        
        var theView = new SPIKA_ProgressView({
            template: this.template
        });
            
        $(HOLDER).append(theView.render().el);
        
        $$('#alert_content').text(text);
          
        $$('#progress_view').fadeIn();
        
    },
    hide : function(callback){
        
        var self = this;
        
        $$('#progress_view').fadeOut(function(){
            
            $$('#progress_view').remove();
            self.isShowing = false;
             
        });
            
    },
    setTitle : function(text){
        
        $$('#progress_view h3 ').text(text);
    },
    setText : function(text){
        
        $$('#progress_view p ').text(text);
    },
    setProgress : function(progress){
        
        $$('#progress_view span').css('width',progress + "%");
    }
}


