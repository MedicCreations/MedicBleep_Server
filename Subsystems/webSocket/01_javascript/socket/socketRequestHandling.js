const COMMAND = "command";
const SET_USER = "setUser";
const REMOVE_USER = "removeUser";
const SEND_MESSAGE = "sendMessage";
const KEEP_SESSION_ALIVE = "keepSessionAlive";

module.exports={
	
	onMessage: function(_message){

		var encodingType = _message.type;
		var message = JSON.parse(_message.utf8Data);
		console.log(_message);
		if(message.command.localeCompare(SET_USER) === 0){
			console.log("set user");
		}else if(message.command.localeCompare(REMOVE_USER) === 0){
			console.log("remove User");
		}else if(message.command.localeCompare(SEND_MESSAGE) === 0){
			console.log("send message");
		}else if(message.command.localeCompare(KEEP_SESSION_ALIVE) === 0){
			console.log("keep session alive " + message.sessionID);
		}
			
	},
	onClose:function(reasonCode, description){
		console.log("disconnect");
		console.log((new Date()) + ' Peer ' + this.remoteAddress + ' disconnected. With code: ' + reasonCode + '. Description: ' + description);
	},
	generateClientID:function(){
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 40;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}

		return randomstring;
	}
		
};