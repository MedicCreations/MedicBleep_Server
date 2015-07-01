AvatarManager = {
	processingQueue:[],
	queueProcessing:false,
	processingOrder:null,
	useCache:true,
	init:function(){
		
		var self = this;
		
		this.decryptWorker = new Worker(WEB_ROOT + '/js/app/libs/FileDecryptWorker.js?bust='+(new Date()).getTime());
		this.decryptWorker.postMessage({
				command:'init',
				rootUrl:WEB_ROOT,
				password:AES_PASSWORD,
				apiUrl:API_URL,
				userToken:apiClient.token
		});
				
        this.decryptWorker.addEventListener('message', function(e) {
            
            self.orderProcessed(e.data);
            
        }, false);
                    
	},
	process:function(imgElement,fileId){
		
		$(imgElement).attr('state','loaded');
		
		if(fileId === 'default_user_image'){
			$(imgElement).attr("src", 'https://medicbleep.com/spika/Client/img/default_user.png');            
    	}else if(fileId === 'default_group_image'){
	    	$(imgElement).attr("src", 'https://medicbleep.com/spika/Client/img/default_group.png');            
    	}else if(fileId === ''){
	    	$(imgElement).attr("src", 'https://medicbleep.com/spika/Client/img/default_user.png');            
    	}else{
			$(imgElement).attr("src", 'https://medicbleep.com/spika/Server/wwwroot/v1/file/download?file_id=' + fileId);	            
        }
		
		return;
		
        if(fileId.search('default') != -1){
            return;
        }
        
        var cachedElm = this.localchacheGetImage(fileId);
		
        if(!_.isUndefined(cachedElm) && !_.isNull(cachedElm) && this.useCache){

            $(imgElement).replaceWith($(cachedElm).clone());
            $(imgElement).attr('width',THUMB_PIC_SIZE_INVIEW);

			return;
			
        }
        
        var cachedData = localStorage.getItem(fileId);
        
        if(!_.isNull(cachedData) && this.useCache){

	        $(imgElement).attr('src','data:image/jpeg;base64,' + cachedData);
	        this.localchacheSaveImage(fileId,imgElement);
	        
	        return;
        }
        
		var processOrder = {
			elm:imgElement,
			fileId:fileId
		};
		

		this.addToProcessQueue(processOrder);
		
	},
	addToProcessQueue:function(order){
		
		this.processingQueue.push(order);
		
		if(this.queueProcessing == false){
			this.processQueue();
		}
		
	},
	processQueue:function(){
		
		if(this.processingQueue.length == 0){
			this.queueProcessing = false;
			return;
		}
		
		this.queueProcessing = true;
		this.processingOrder = this.processingQueue.shift();

        var cachedElm = this.localchacheGetImage(this.processingOrder.fileId);
		
        if(!_.isUndefined(cachedElm) && !_.isNull(cachedElm) && this.useCache){

            $(this.processingOrder.elm).replaceWith($(cachedElm).clone());
            $(this.processingOrder.elm).attr('width',THUMB_PIC_SIZE_INVIEW);

			this.processQueue();
			
        }else{

	        var cachedData = localStorage.getItem(this.processingOrder.fileId);
	        
	        if(!_.isNull(cachedData) && this.useCache){
	
		        $(this.processingOrder.elm).attr('src','data:image/jpeg;base64,' + cachedData);
		        this.localchacheSaveImage(this.processingOrder.fileId,this.processingOrder.elm);
		        
		        this.processQueue();
		        
	        }else{

				this.decryptWorker.postMessage({
					command:'process',
					fileId:this.processingOrder.fileId
				});
			
	        }
        
        }
        
	},
	orderProcessed:function(decryptedBin){
		
		var self = this;
		
		if(decryptedBin != null){
			
			var base64Data = sjcl.codec.base64.fromBits(decryptedBin);
			
			try{

				U.resizeFromBase64(base64Data,THUMB_PIC_SIZE_INVIEW,THUMB_PIC_SIZE_INVIEW,80,"image/jpeg",function(resizedBase64Data){
					
					$(self.processingOrder.elm).attr('src','data:image/jpeg;base64,' + resizedBase64Data);
					
					try{
    					localStorage.setItem(self.processingOrder.fileId, resizedBase64Data);					
					}catch(ex){
					    // do something here
					}
					self.localchacheSaveImage(self.processingOrder.fileId,self.processingOrder.elm);
					
					self.processQueue();
					
				});
				
			}catch(ex){

				self.processQueue();
				
			}

		}else{
			this.processQueue();
		}
        
        
	},
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
        
    }
	
};