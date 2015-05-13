self.addEventListener('message', function(e) {
    
    var command = e.data.command;
    
    if(command == undefined){
		
		// for backward compatibility
	    var rootUrl = e.data.rootUrl;
	    var hexText = e.data.hexData;
	    var aesPassword = e.data.password;
	    
	    importScripts(rootUrl + '/js/thirdparty/rncryptor/rncryptor.js');
	
	    importScripts(rootUrl + '/js/thirdparty/sjcl/sjcl.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/aes.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/bitArray.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/bn.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/cbc.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/ccm.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/codecBase32.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/codecBase64.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/codecBytes.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/codecHex.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/codecString.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/convenience.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/ecc.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/gcm.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/hmac.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/ocb2.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/pbkdf2.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/sha1.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/sha256.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/sha512.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/srp.js');
	    importScripts(rootUrl + '/js/thirdparty/sjcl/random.js');
	
	    var decryptedBin = RNCryptor.Decrypt(aesPassword,
	        sjcl.codec.hex.toBits(hexText)
	    );
	
	    self.postMessage(decryptedBin);
    
    }

	if(command == 'init'){

	    self.rootUrl = e.data.rootUrl;
	    self.apiUrl = e.data.apiUrl;
	    self.userToken = e.data.userToken;
	    self.aesPassword = e.data.password;
	    
	    // we cant use jquery because it uses window global var
	    importScripts(self.rootUrl + '/js/thirdparty/superagent.js');	
	    importScripts(self.rootUrl + '/js/thirdparty/rncryptor/rncryptor.js');	
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/sjcl.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/aes.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/bitArray.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/bn.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/cbc.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/ccm.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/codecBase32.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/codecBase64.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/codecBytes.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/codecHex.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/codecString.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/convenience.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/ecc.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/gcm.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/hmac.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/ocb2.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/pbkdf2.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/sha1.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/sha256.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/sha512.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/srp.js');
	    importScripts(self.rootUrl + '/js/thirdparty/sjcl/random.js');
		
		self.request = require('superagent');
		
	}

	if(command == 'test'){
		console.log(self.aesPassword);
	}

	if(command == 'process'){
		
		var self2 = self;
		
		request
			.get(self.apiUrl + '/file/download')
			.query({file_id: e.data.fileId})
			.set('token', self.userToken)
			.end(function(resp){

				var hexText = resp.text;

				var decryptedBin = null;
				
				try{
				    decryptedBin = RNCryptor.Decrypt(self2.aesPassword,
				        sjcl.codec.hex.toBits(hexText)
				    );
				}catch(ex){
				}

				self2.postMessage(decryptedBin);
				
		});
  

	}

}, false);