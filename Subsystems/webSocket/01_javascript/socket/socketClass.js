var socketRequestHandling = require('./socketRequestHandling');

module.exports = {
	user: function (_identifier, _userId, _connection) {
	
		this.identifier = _identifier;
	    this.userId = _userId;
	    this.sessionID = socketRequestHandling.generateClientID();
	    this.connection = _connection;
	    
	    this.connection.on('close', socketRequestHandling.onClose);
	    this.connection.on('message', socketRequestHandling.onMessage);
	    
	}
};