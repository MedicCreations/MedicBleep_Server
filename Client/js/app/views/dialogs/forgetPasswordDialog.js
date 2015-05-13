var SPIKA_ForgetPasswordView = Backbone.View.extend({
    
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

var SPIKA_ForgetPasswordManager = {

    template : '<div id="dialog_view" style="display:none"> <div id="alert_box"> <div id="alert_title"> <a href=""> <i class="fa fa-times fa-2x"></i> </a> </div> <div id="alert_content"> </div> <div id="alert_form"><input type="text" id="forget_password_dialog_first"/> <br /> <input type="text"  id="forget_password_dialog_second"/> </div><div id="alert_bottom"> <a href="javascript:void(0)" id="alert_bottom_cancel"> {cancel} </a> <a href="javascript:void(0)" id="alert_bottom_ok"> {ok} </a> </div> </div> </div>',
    
    showDialogForUsername : function(title,text,onOK,onCancel){
        
        var self = this;
        
        var theView = new SPIKA_AlertView({
            template: U.simpleLocalizationFilter(this.template,LANG)
        });
            
        $(HOLDER).append(theView.render().el);
        
        $$('#alert_title').text(title);
        $$('#alert_content').text(text);
        $$('#forget_password_dialog_first').attr("placeholder",LANG.forget_password_firststep_placehosler);
        $$('#forget_password_dialog_second').css('display','none');
        
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
	        
	        var firstTextBoxVal = $$('#forget_password_dialog_first').val();
	        var secondTextBoxVal = $$('#dforget_password_dialog_second').val();
	        
            self.hide(function(){
	            onOK(firstTextBoxVal);
            });
            
        });
                    
        $$('#dialog_view').fadeIn();
        
    },
    showDialogForNewPassword : function(title,text,onOK,onCancel){
        
        var self = this;
        
        var theView = new SPIKA_AlertView({
            template: U.simpleLocalizationFilter(this.template,LANG)
        });
            
        $(HOLDER).append(theView.render().el);
        
        $$('#alert_title').text(title);
        $$('#alert_content').text(text);
        $$('#forget_password_dialog_first').attr("placeholder",LANG.forget_password_secondstep_placehosler1);
        $$('#forget_password_dialog_second').attr("placeholder",LANG.forget_password_secondstep_placehosler2);
        
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
	        
	        var firstTextBoxVal = $$('#forget_password_dialog_first').val();
	        var secondTextBoxVal = $$('#forget_password_dialog_second').val();
	        
            self.hide(function(){
	            onOK(firstTextBoxVal,secondTextBoxVal);
            });
            
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


