
var SPIKA_imagePreviewView =  Backbone.View.extend({
    
    message:null,
    isOpened:false,
    initialize: function(options) {
	    
	    var self = this;
	    
	    this.template = options.template;
	    
		$('img').bind('contextmenu', function(e) {
			return false;
		});
	    
    },
    
    render:function(){
	    $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
	    
	    var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
        
        this.onload();
        
        return this;
    },
    
    onload : function(){

        var self = this;
        
		$$('#image_preview_view').css('display','none');
        $$('#image_preview_view .encrypted_preview_image').css('display','none');
        self.hide();
        
        $$('#image_preview_view .alertLeftButton').click(function(){
	       self.hide(); 
        });
        
        $$('#image_preview_view .alertRightButton').click(function(){
			EncryptManager.downloadFile(self.message.get('file_id'),EncryptManager.decryptText(self.message.get('text')));
			self.hide(); 
        });
        
    },
    
    show:function(_message){

		var self = this;
		
		self.message = _message;
		self.isOpened = true;
		
	    $$('#image_preview_view').css('display','block');
	    $$('#image_preview_view .previewLoading').css('display','block');
	    
        EncryptManager.decryptImage($$('#image_preview_view .encrypted_preview_image'), 
        								self.message.attributes.file_id,
        								0,
        								apiClient,
        								function(){
	        								
	        								self.resizeImage(50);
	        								
	        								$$('#image_preview_view .previewLoading').css('display','none');
	        								$$('#image_preview_view .encrypted_preview_image').fadeIn('slow',function(){
		   	
	   										});
        								},
        								function(){
	        								
        								},
        								true,
        								true);

    },
    
    hide:function(){
	    
	    self.isOpened = false;
	    
	   	$$('#image_preview_view').fadeOut('slow',function(){
		   	
	   	});
	   	$$('#image_preview_view .encrypted_preview_image').fadeOut('slow',function(){
	   		$$('#image_preview_view .encrypted_preview_image').attr('src','');
			$$('#image_preview_view .encrypted_preview_image').css('width','auto');
			$$('#image_preview_view .encrypted_preview_image').css('height','auto');
	   	});
    },
    
    resizeImage:function(imagePadding){

		var dWidth = 0;
		var dHeight = 0;
		
	    var windowWidth = window.innerWidth;
	    var windowHeight = window.innerHeight;
		
		var imageWidth = $$('#image_preview_view .encrypted_preview_image').width();
		var imageHeight = $$('#image_preview_view .encrypted_preview_image').height();
		
		dWidth = windowWidth - imageWidth - imagePadding;
		dHeight = windowHeight - imageHeight - imagePadding;
		
		
		if(dHeight >= 0 && dWidth >= 0){
			$$('#image_preview_view .encrypted_preview_image').css('width','auto');
			$$('#image_preview_view .encrypted_preview_image').css('height','auto');			
		}else if(dHeight <= 0 && dWidth >= 0){
			imageHeight += dHeight;
			$$('#image_preview_view .encrypted_preview_image').css('width','auto');
			$$('#image_preview_view .encrypted_preview_image').css('height',imageHeight);			
		}else if(dWidth <= 0 && dHeight >= 0){
			imageWidth += dWidth;
			$$('#image_preview_view .encrypted_preview_image').css('width',imageWidth);
			$$('#image_preview_view .encrypted_preview_image').css('height','auto');
		}else{
			imageHeight += dHeight;
			$$('#image_preview_view .encrypted_preview_image').css('width','auto');
			$$('#image_preview_view .encrypted_preview_image').css('height',imageHeight);
		}
	    
    }
    
});