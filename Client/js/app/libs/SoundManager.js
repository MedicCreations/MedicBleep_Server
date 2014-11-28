var SPIKA_soundManager = {
    
    flgStopCalling:false,
    flgStopRinging:false,
    init : function(){
	    
        var self = this;
        
        this.audioNewMessage = new Audio('sound/newmessage.mp3');
        
        this.callingSound = new Audio('sound/call.mp3');

		this.callingSound.addEventListener('ended', function() {
			
			if(self.flgStopCalling){
				return;
			}
			
		    this.currentTime = 0;
		    this.play();
		    
		}, false);

        this.ringingSound = new Audio('sound/ring.mp3');

		this.ringingSound.addEventListener('ended', function() {
			
			if(self.flgStopRinging){
				return;
			}
			
		    this.currentTime = 0;
		    this.play();
		    
		}, false);


    },
    playNewMessage : function(){
        this.audioNewMessage.play();
    },
    playCalling : function(){
	    this.flgStopCalling = false;
        this.callingSound.play();
    },
    stopCalling : function(){
        this.flgStopCalling = true;
    },
    playRinging : function(){
	    this.flgStopRinging = false;
        this.ringingSound.play();
    },
    stopRinging : function(){
        this.flgStopRinging = true;
    } 

    
}