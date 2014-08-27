var DownloadDemo = {
    
    currentProgress:0,
    interval:500,
    currentState:0,
    init:function(){
	    
	    var self = this;
	    
		$('#btn-upload').click(function(){
			$('#panel-upload').modal('show');
			self.next();
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
            
            $('#panel-title').text('Encrypting');
            $('#panel-subtitle').text('Please wait.');
            $('#panel-close-button').css('display','none');
            
            this.currentProgress = 0;
            this.progress();
        }

        if(this.currentState == 2){
            
            $('#panel-title').text('Uploading file');
            $('#panel-subtitle').text('Uploading please wait.');
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