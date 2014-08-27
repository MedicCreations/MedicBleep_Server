var SPIKA_soundManager = {
    
    init : function(){
        var self = this;
        this.audioNewMessage = new Audio('sound/newmessage.mp3');
    },
    playNewMessage : function(){
        this.audioNewMessage.play();
    }
      
}