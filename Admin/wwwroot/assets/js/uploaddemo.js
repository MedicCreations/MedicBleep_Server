var UploadDemo = {
    
    currentProgress:0,
    interval:500,
    currentState:0,
    init:function(){
	    
	    var self = this;
	    
		$('.downloadlink').click(function(){
		    $('#panel-upload').modal('show');
            self.next();
            return false;
		});

    },
    
    progress:function(){
        
        var self = this;
        this.currentProgress += 10;
        
        $('#panel-progressbar').css('width',this.currentProgress + '%');	
        
        if(this.currentProgress > 100){
            
            this.next();
            
        }else{
             	
    		setTimeout(function(){
    		    
    		    self.progress();
    		    
    		}, this.interval);	
		
        }
        
    },
    
    next:function(){
        
        this.currentState++;
        
        if(this.currentState == 1){
            
            $('#panel-title').text('Downloading');
            $('#panel-subtitle').text('Please wait.');
            $('#panel-close-button').css('display','none');
            
            this.currentProgress = 0;
            this.progress();
        }

        if(this.currentState == 2){
            
            $('#panel-title').text('Decrypting');
            $('#panel-subtitle').text('Please wait.');
            $('#panel-close-button').css('display','none');
            
            this.currentProgress = 0;
            this.progress();
        }        
        
        if(this.currentState == 3){
            
            $('#panel-title').text('Done !');
            $('#panel-subtitle').text('');
            $('#panel-close-button').css('display','block');
            
        }     
        
        
    }
}