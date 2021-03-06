var fileUploadHandler = {
    
    processFile : function(file,succeessListener,failedListener,progressListener){
        
        var fileName = file.name;
        var fileType = file.type;
        
        var typeFilterImage = /jpeg|png/;
        var typeFilterVideo = /mp4|webm/;
        var typeFilterAudio = /wav|mp3/;
        
        if(fileType.match(typeFilterImage)){
        
            // resize bit image
            //U.resize(file,BIG_PIC_SIZE,BIG_PIC_SIZE,100,"image/jpeg",function(blobBigImage){
                
                var blobBigImage = file;
                
                // resize thumbnail
                U.resize(file,THUMB_PIC_SIZE,THUMB_PIC_SIZE,100,"image/jpeg",function(blobSmallImage){
                    
                    progressListener(20,"Encrypting File...",file.name);
                        
                    // encrypt 
                    EncryptManager.encryptFile(blobBigImage,function(encryptedHexBig){
                        
                       progressListener(30,"Encrypting File...",file.name);
                        
                        // encrypt 
                        EncryptManager.encryptFile(blobSmallImage,function(encryptedHexThumb){
                            
                            // upload big image
                            apiClient.fileUpload(encryptedHexBig,function(data){
                                
                                
                                if(!_.isNull(data.file_id)){
                                    
                                    var bigFileId = data.file_id;
                                    
                                    // upload thumbnail
                                    apiClient.fileUpload(encryptedHexThumb,function(data){
                                        
                                        if(!_.isNull(data.file_id)){
                                            
                                            var smallFileId = data.file_id;
                                            
                                            // upload done
                                            succeessListener({text:fileName,fileId:bigFileId,thumbId:smallFileId,type:MESSAGE_TYPE_IMAGE})
        
                                        }
                                        
                                    },function(data){
                                        
                                        alert('failed to upload file');
                                        failedListener();
                                        
                                    },function(progress){
                                        
                                        progressListener(50 + progress*0.5,"Uploading...",file.name);
                                        
                                    }); // apiClient.fileUpload(blobSmallImage,function(data){
            
                                }
                                
                            },function(data){
                                
                                alert('failed to upload file');
                                failedListener();
                                
                            },function(progress){
                                
                                progressListener(progress * 0.8);
                                  
                            }); // apiClient.fileUpload(blobBigImage,function(data){

                        }); //EncryptManager.encryptFile(blobBigImage,function(encryptedHex){
                        
                    }); //EncryptManager.encryptFile(blobBigImage,function(encryptedHex){
                    
                }); // U.resize(file,THUMB_PIC_SIZE,THUMB_PIC_SIZE,100,"image/jpeg",function(blobSmallImage){
                  
            //}); // U.resize(file,BIG_PIC_SIZE,BIG_PIC_SIZE,100,"image/jpeg",function(blobBigImage){
            
        } // if(fileType.match(typeFilterImage)){
        
        else if(fileType.match(typeFilterVideo)){
            
            progressListener(10,"Encrypting File...",file.name);
            
            EncryptManager.encryptFile(file,function(encryptedFile){
            
                apiClient.fileUpload(encryptedFile,function(data){
                    
                    if(!_.isNull(data.file_id)){
                        
                        var fileId = data.file_id;
                        
                        if(!_.isNull(data.file_id)){
    
                            // upload done
                            succeessListener({text:fileName,fileId:fileId,type:MESSAGE_TYPE_VIDEO})
            
                        }
            
                    }
                    
                },function(){
    
                        alert('failed to upload');
                        failedListener();
                        
                },function(progress){
                                    
                    progressListener(progress,"Uploading...",file.name);       
                });
                
            });

        } //  if(fileType.match(typeFilterVideo)){
        
        
        
        else if(fileType.match(typeFilterAudio)){

            progressListener(10,"Encrypting File...",file.name);
            
            EncryptManager.encryptFile(file,function(encryptedFile){
            
                apiClient.fileUpload(encryptedFile,function(data){
                    
                    if(!_.isNull(data.file_id)){
                        
                        var fileId = data.file_id;
                        
                        if(!_.isNull(data.file_id)){
                            
                            // upload done
                            succeessListener({text:fileName,fileId:fileId,type:MESSAGE_TYPE_VOICE})
            
                        }
            
                    }
                    
                },function(){

                    alert('failed to upload');
                    failedListener();
                    
                },function(progress){
                                    
                    progressListener(progress,"Uploading...",file.name);          
                });
                
            });

        } //  if(fileType.match(typeFilterVideo)){

        
        else {
            
            progressListener(10,"Encrypting File...",file.name);
            
            EncryptManager.encryptFile(file,function(encryptedFile){
            
                apiClient.fileUpload(encryptedFile,function(data){

                    if(!_.isNull(data.file_id)){
                        
                        var fileId = data.file_id;
                        
                        if(!_.isNull(data.file_id)){
                            
                            // upload done
                            succeessListener({text:fileName,fileId:fileId,type:MESSAGE_TYPE_FILE})
            
                        }
            
                    }
                    
                },function(){
                    
                    alert('failed to upload');
                    failedListener();
                    
                },function(progress){
                                    
                    progressListener(progress,"Uploading...",file.name);   
                           
                });           
            });
        }
        
    },
    
    profliePictureUpload : function(file,succeessListener,failedListener){

        // resize bit image
/*
        U.resize(file,PROFLIE_PIC_SIZE,PROFLIE_PIC_SIZE,100,"image/png",function(blobBigImage){
        
            // resize thumbnail
            U.resize(file,THUMB_PIC_SIZE,THUMB_PIC_SIZE,100,"image/png",function(blobSmallImage){
                
                // encrypt 
                EncryptManager.encryptFile(blobBigImage,function(encryptedHexBig){
                    
                    // encrypt 
                    EncryptManager.encryptFile(blobSmallImage,function(encryptedHexThumb){
                        
                        // upload big image
                        apiClient.fileUpload(encryptedHexBig,function(data){
                            
                            if(!_.isNull(data.file_id)){
                                
                                var bigFileId = data.file_id;
*/
                                
                                // upload thumbnail
                                apiClient.fileUpload(file,function(data){
                                    
                                    if(!_.isNull(data.file_id)){
                                        
                                        var smallFileId = data.file_id;
                                        
                                        // upload done
                                        succeessListener({fileId:smallFileId,thumbId:smallFileId})
    
                                    }
                                    
                                },function(data){
                                    
                                    alert('failed to upload file');
                                    failedListener();
                                    
                                },function(progress){
                                    

                                    
                                }); // apiClient.fileUpload(blobSmallImage,function(data){
        
/*                            }
                            
                        },function(data){
                            
                            alert('failed to upload file');
                            failedListener();
                            
                        },function(progress){
                            
                              
                        }); // apiClient.fileUpload(blobBigImage,function(data){


                    }); //EncryptManager.encryptFile(blobBigImage,function(encryptedHex){
                    
                }); //EncryptManager.encryptFile(blobBigImage,function(encryptedHex){
                
            }); // U.resize(file,THUMB_PIC_SIZE,THUMB_PIC_SIZE,100,"image/jpeg",function(blobSmallImage){
              
        }); // U.resize(file,BIG_PIC_SIZE,BIG_PIC_SIZE,100,"image/jpeg",function(blobBigImage){
*/
            
    }
    
}