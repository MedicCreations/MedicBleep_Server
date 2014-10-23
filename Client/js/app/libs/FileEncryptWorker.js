self.addEventListener('message', function(e) {
    
    var rootUrl = e.data.rootUrl;
    var base64data = e.data.fileBase64Data;
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
    
    sjcl.random.setDefaultParanoia(Math.random() * 1000,true);
        
    var originalBytes = sjcl.codec.base64.toBits(base64data);
    var encryptedBin = RNCryptor.Encrypt(aesPassword,originalBytes);
    var encryptedHex = sjcl.codec.hex.fromBits(encryptedBin);
    
    self.postMessage(encryptedHex);
  
}, false);