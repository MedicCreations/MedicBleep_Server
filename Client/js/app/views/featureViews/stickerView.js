var SPIKA_StickerView = Backbone.View.extend({
    
    isShowing: false,
    initialize: function(options) {
        
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_CLICK_ANYWHARE, function() {
            self.hide();
        });

        Backbone.on(EVENT_WINDOW_SIZE_CHANGED, function() {
            self.updateWindowSize();
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
        self.updateWindowSize();
        
    },
    
    show : function(){
        
        var self = this;
        
        $$('#sticker_selecter').show();

        _.debounce(function() {
            self.isShowing = true;
        }, 500)();
        
        $$('#sticker_selecter .sticker_holder').unbind().click(function(){
            
            var imageUrl = $(this).attr();
            
        });
          
    },
    
    hide : function(){
        
        if(this.isShowing){
            $$('#sticker_selecter').hide();
            this.isShowing = false;
        }

    },
    
    updateWindowSize: function(){
        
        $$('#sticker_selecter').width($$('#main_container article').width());
        
    }
    
});