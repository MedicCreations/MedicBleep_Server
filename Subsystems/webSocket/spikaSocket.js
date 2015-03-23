/*
	Objects
*/
const express = require('express');
var app = express();

var WebSocketServer = require('websocket').server;
var http = require('http');


var server = http.createServer(function(request,response){}).listen(8080,function(){
	console.log(new Date() + ' Server is listening on port 8080');
});

var ws = new WebSocketServer({
	httpServer:server
});

/*
	FILE INCLUDES
*/
app.use(express.static(__dirname,'css'));
app.use(express.static(__dirname,'js'));
app.get('/');

var socketClass = require('./01_javascript/socket/socketClass');
var socketHandling = require('./01_javascript/socket/serverSocketHandling');

/*********************************/

/*
	SOCKET HANDLING
*/

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  
  if(origin.localeCompare("https://www.spikaent.com") === 0){
	  return true;
  }
  
  return false;
}

var count = 0;
var clients = {};

ws.on('request',function(req){
	
/*
  requestedProtocols: [],
  requestedExtensions: [],
  cookies: [] 
*/
	
 	console.log(req.origin);

	var connection = req.accept('',req.origin);
	
	if(req.httpRequest.headers.origin.localeCompare("http://spikaent.com/server") === 0){
		console.log(req.origin);
		console.log("creating connection");
		
// 		var connect = function/s
		
		console.log("connection created");
		var user = new socketClass.user('', '', connection);
		console.log("adding connection");
		socketHandling.addClient(user, user.sessionID);				
	}else{
		
	}
	
// 	if(!originIsAllowed(req.origin)){
// 		req.reject();
// 		console.log(new Date() + 'Connection from origin ' + req.origin + ' rejected!');
// 	}else{
// 		console.log(new Date() + 'Connection from origin ' + req.origin + ' accepted!');
	

// 		var connection = req.accept('',req.origin);
/*
		console.log("***********************************************************************");
		console.log(req.httpRequest.headers);		
		console.log("***********************************************************************");
*/
		
// 		var user = new socketClass.user('', '', connection);
		
// 		console.log("user" + user);
		
// 		socketHandling.addClient(user, user.sessionID);
		
// 		connection.sendUTF(JSON.stringify({socketSessionID : user.sessionID}));
// 	}	

});

