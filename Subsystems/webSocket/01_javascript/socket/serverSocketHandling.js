var clientsArray = [];

module.exports = clientsArray;

module.exports = {
	
	addClient: function (_client, _sessionID){

		//adding socket to clients ßarray
		clientsArray[_sessionID] = _client;		
		
	},
	removeClient: function (socketId){
		
		//removing sockets from clients array
		for(var i = 0; i < clientsArray.length; i++){
			var client = clientsArray[i];
			
			if(client.id == socketId){
				clientsArray.splice(i, 1);
				console.log("Removed user with id " + socketId);
				break;
			}	
		}
		
	},
	getClient: function(clientIndex){
		
		if(clientIndex < clientsArray.length){
			var client = clientsArray[clientIndex];
			return client;
		}else{
			console.log("Index out of bounds for client");
		}
		
	},
	numberOfClients: function(){
		//number of current clients available
		console.log(clientsArray.length);
	}
};