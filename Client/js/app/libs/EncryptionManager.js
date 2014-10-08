EncryptManager = {
    
    localchacheSaveImage:function(fileId,data){

        if(typeof(Storage) == "undefined") {
            return null;
        } 
        
        localStorage[fileId] = data;
        
    },
    localchacheGetImage:function(fileId){

        if(typeof(Storage) == "undefined") {
            return null;
        } 
        
        return localStorage[fileId];
        
    },    
    encryptText : function(text){
        
        if( text.length == 0)
            return '';
        
        try{
            var encryptedBin = RNCryptor.Encrypt(AES_PASSWORD,
                sjcl.codec.utf8String.toBits(text)
            );
            
            var encryptedHex = sjcl.codec.hex.fromBits(encryptedBin);
            
            return encryptedHex;
        } catch(ex){
            
        }
        
        return '';
            
    },
    decryptText : function(text){
        
        try{
            var plaintext = RNCryptor.Decrypt(AES_PASSWORD,
                sjcl.codec.hex.toBits(text)
            );
            
            decryptedText = U.convertHexToString(sjcl.codec.hex.fromBits(plaintext));
            
            return decryptedText;
        } catch(ex){
            
        }
        
        return '';
    },
    encryptFile : function(file,done){
        
        var reader = new FileReader();
        
        reader.onload = function(readerEvt) {
            
            var base64data = reader.result.split(',')[1];
            var encryptedBin = RNCryptor.Encrypt(AES_PASSWORD,sjcl.codec.base64.toBits(base64data));
            var encryptedHex = sjcl.codec.hex.fromBits(encryptedBin);
             
            var file = new Blob([encryptedHex], {type: "text/plain"}); 
                     
            done(file);
            
        };
    
        reader.readAsDataURL(file);
            
    },

    decryptImage : function(imgElement,fileId,width,apiClient,successListner,failedListner){
        
        var self = this;
        
        var chacedFile = self.localchacheGetImage(fileId);
        
        if(!_.isUndefined(chacedFile) && !_.isNull(chacedFile)){

            $(imgElement).attr('src','data:image/jpeg;base64,' + chacedFile);
            
            if(width > 0)
                $(imgElement).attr('width',width);
            
            if(_.isFunction(successListner))
                successListner();
                    
            return;
        }
        
        // download file first  
        apiClient.downloadFile(fileId,function(data){
            
            var hexText = data;

            if( hexText.length == 0)
                return '';
            
            try{
                var decryptedBin = RNCryptor.Decrypt(AES_PASSWORD,
                    sjcl.codec.hex.toBits(hexText)
                );
    
                $(imgElement).attr('src','data:image/jpeg;base64,' + sjcl.codec.base64.fromBits(decryptedBin));
                
                if(width > 0)
                    $(imgElement).attr('width',width);
                
                self.localchacheSaveImage(fileId,sjcl.codec.base64.fromBits(decryptedBin));
                
                if(_.isFunction(successListner))
                    successListner();
                
            } catch(ex){
                U.l(ex);
                
                if(_.isFunction(failedListner))
                    failedListner();


            }

                
            $(imgElement).attr('state','loaded');
            
        },function(data){
            console.log('fail');
            console.log(data);
        
        });
        
    },
    
    downloadFile:function(fileId,fileName,encryptedFileName){
        
        $('#downloadlink_' + fileId + " img").attr('src','img/btn_decrypting.png');
        
        var decryptedFileName = '';
        
        if(!_.isUndefined(encryptedFileName)){
        
            try{
            
                var plaintext = RNCryptor.Decrypt(AES_PASSWORD,
                    sjcl.codec.hex.toBits(encryptedFileName)
                );
                
                decryptedFileName = U.convertHexToString(sjcl.codec.hex.fromBits(plaintext));
                
                fileName = decryptedFileName;
                
            } catch(ex){

            }
            
        }
            
        // download file first  
        apiClient.downloadFile(fileId,function(data){
            
            var hexText = data;

            if( hexText.length == 0)
                return '';
            
            try{
                
                var decryptedBin = RNCryptor.Decrypt(AES_PASSWORD,
                    sjcl.codec.hex.toBits(hexText)
                );
                
                var base64encoded = sjcl.codec.base64.fromBits(decryptedBin);
                
                $('#downloadlink_' + fileId + " img").attr('src','img/btn_download.png');
                
                var byteCharacters = atob(base64encoded);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {type: "application/octet-stream"});
                saveAs(blob, fileName);

                
                    
            } catch(ex){
                U.l(ex);
            }

            
        },function(data){
            console.log('fail');
            console.log(data);
        
        });
        
    }
}
