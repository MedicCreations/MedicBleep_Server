self.addEventListener('message', function(e) {
    
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
  
}, false);