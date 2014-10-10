var SPIKA_AlertView = Backbone.View.extend({
    
    initialize: function(options) {
        this.template = options.template;
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
            
    }
    
});

var SPIKA_AlertManager = {

    template : '<div id="dialog_view" style="display:none"> <div id="alert_box"> <div id="alert_title"> <a href=""> <i class="fa fa-times fa-2x"></i> </a> </div> <div id="alert_content"> </div> <div id="alert_bottom"> <a href="javascript:void(0)" id="alert_bottom_cancel"> Cancel </a> <a href="javascript:void(0)" id="alert_bottom_ok"> OK </a> </div> </div> </div>',
    
    show : function(title,text,onOK,onCancel){
        
        var self = this;
        
        var theView = new SPIKA_AlertView({
            template: this.template
        });
            
        $(HOLDER).append(theView.render().el);
        
        $$('#alert_title').text(title);
        $$('#alert_content').text(text);
        
        $$('#alert_bottom_cancel').unbind();
        $$('#alert_bottom_ok').unbind();
        
        if(_.isUndefined(onOK)){
            
            $$('#alert_bottom_cancel').hide();
            //$$('#alert_bottom_ok').hide();
            
        }else{
            $$('#alert_bottom_cancel').show();
            $$('#alert_bottom_ok').show();

        }

        $$('#alert_bottom_cancel').click(function(){
            self.hide(onCancel);
        });
        
        $$('#alert_bottom_ok').click(function(){
             self.hide(onOK);
        });
                    
        $$('#dialog_view').fadeIn();
        
    },
    hide : function(callback){
    
        $$('#dialog_view').fadeOut(function(){
            
            $$('#dialog_view').remove();
            
            if(!_.isUndefined(callback))
                callback();
        });
            
    }
}


