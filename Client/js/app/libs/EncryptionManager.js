//http://stackoverflow.com/questions/26329807/fast-multiple-copy-of-img-dom

EncryptManager = {
    
    invalidFileIdList:[],
    memoryCache:[],
    localchacheSaveImage:function(fileId,imgElement){
    
        var imageSelector = '#cached_image img[fileid=\'' + fileId +'\']';

        if(_.isUndefined($$(imageSelector).get(0))){
            $(imgElement).clone().prependTo('#cached_image');
        }
        
    },
    localchacheGetImage:function(fileId){
        
        var imageSelector = '#cached_image img[fileid=\'' + fileId +'\']';
        
        if(_.isUndefined($$(imageSelector).get(0)))
            return null;

        return $$(imageSelector).get(0);
        
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
        
        if(_.indexOf(this.invalidFileIdList,fileId) != -1){

            if(_.isFunction(failedListner))
                failedListner();
                    
            return;
        }
            
        if(_.isEmpty(fileId)){

            if(_.isFunction(failedListner))
                failedListner();
                    
            return;
        }
            
        
        if(fileId.search('default') != -1){

            if(_.isFunction(failedListner))
                failedListner();
                    
            return;
        }
            
            
        var self = this;
        
        $(imgElement).attr('state','loaded');
        
        var cachedElm = self.localchacheGetImage(fileId);

        if(!_.isUndefined(cachedElm) && !_.isNull(cachedElm)){
            
            $(imgElement).replaceWith($(cachedElm).clone());
            
            if(width > 0)
                $(imgElement).attr('width',width);
            
            if(_.isFunction(successListner))
                successListner();
                    
            return;
        }
        

        // download file first  
        apiClient.downloadFile(fileId,function(data){
            
            var hexText = data;

            if( hexText.length == 0){
                return '';
            }
            
            try{
                var decryptedBin = RNCryptor.Decrypt(AES_PASSWORD,
                    sjcl.codec.hex.toBits(hexText)
                );
    
                $(imgElement).attr('src','data:image/jpeg;base64,' + sjcl.codec.base64.fromBits(decryptedBin));
                //$(imgElement).attr('src',decryptedBin);
                
                if(width > 0)
                    $(imgElement).attr('width',width);
                
                self.localchacheSaveImage(fileId,imgElement);
                
                if(_.isFunction(successListner))
                    successListner();
                
            } catch(ex){
                
                if(_.isFunction(failedListner))
                    failedListner();
                    
            }
            
        },function(data){
            self.invalidFileIdList.push(fileId);
        });
        
    },
    
    downloadFile:function(fileId,fileName,encryptedFileName){
        
        var self = this;

        if(_.indexOf(this.invalidFileIdList,fileId) != -1)
            return;
            
        if(_.isEmpty(fileId))
            return;
            
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
                
                var byteCharacters = atob(base64encoded);
                var byteNumbers = new Array(byteCharacters.length);
                for (var i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                var blob = new Blob([byteArray], {type: "application/octet-stream"});
                saveAs(blob, fileName);

                
                    
            } catch(ex){
                self.invalidFileIdList.push(fileId);
            }

            
        },function(data){
            self.invalidFileIdList.push(fileId);
        });
        
    }
}
