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
            var originalBytes = sjcl.codec.base64.toBits(base64data);
            
            var length = originalBytes.length; // 1 elm is 4 bytes
            var blockSize = 32 * 1024 * 20000; // 32KB / 4B
            
            var startIndex = 0;
            var encryptedHex1 = '';

            while(startIndex < length){
                
                var bytes = [];
                var stopIndex = startIndex + blockSize;
                
                if(stopIndex > length)
                    stopIndex = length;
                
                U.l(stopIndex + ":" + length);
                
                for(i = startIndex ; i < stopIndex ; i++){
                    
                    bytes.push(originalBytes[i])
                    
                }
                
                var encryptedBin = RNCryptor.Encrypt(AES_PASSWORD,bytes);
                var blockEncryptedHex = sjcl.codec.hex.fromBits(encryptedBin);
                
                startIndex += blockSize;
                encryptedHex1 += blockEncryptedHex;
            }
            

            var encryptedBin = RNCryptor.Encrypt(AES_PASSWORD,originalBytes);
            var encryptedHex2 = sjcl.codec.hex.fromBits(encryptedBin);

            U.l(encryptedHex1.substr(0, 50));
            U.l(encryptedHex2.substr(0, 50));
            
            
            var file = new Blob([encryptedHex1], {type: "text/plain"}); 
                     
            done(file);
            
        };
    
        reader.readAsDataURL(file);
            
    },


    decryptMedia : function(videoElm,fileId,type,apiClient,successListner,failedListner,useCache){
        
        if(_.isUndefined(useCache))
            useCache = true;
        
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
        
        if($(videoElm).attr('state') != 'loading')
            return;
            
        var self = this;
        
        $(videoElm).attr('state','loaded');
    
        // download file first  
        apiClient.downloadFile(fileId,function(data){
            
            var hexText = data;

            if( hexText.length == 0){
                return '';
            }
            
            U.l('3');
            
            try{
                var decryptedBin = RNCryptor.Decrypt(AES_PASSWORD,
                    sjcl.codec.hex.toBits(hexText)
                );
    
                $(videoElm).children().attr('src','data:' + type + ';base64,' + sjcl.codec.base64.fromBits(decryptedBin));
                
                $(videoElm).load();
                
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
    
    decryptImage : function(imgElement,fileId,width,apiClient,successListner,failedListner,useCache){
        
        if(_.isUndefined(useCache))
            useCache = true;
        
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

        if(!_.isUndefined(cachedElm) && !_.isNull(cachedElm) && useCache == true){
            
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
                
                if(useCache == true)
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
