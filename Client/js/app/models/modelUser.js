    var userFactory = {
    
        createModelByAPIResponse : function(data){
            
            var user_id = 0;
            
            if(!_.isUndefined(data.user_id)){
                user_id = data.user_id;
            }
            
            if(!_.isUndefined(data.id)){
                user_id = data.id;
            }
            
            var modelUser = new ModelUser({ id:user_id,firstname: data.firstname, lastname: data.lastname, image: data.image, image_thumb: data.image_thumb,details: data.details,device: data.last_device_id, webOpened: data.web_opened,originalData:data}); 
            
            modelUser.set('device_ios',0);
            modelUser.set('device_android',0);
            modelUser.set('device_web',0);
            
            _.each(data.devices,function(device){
	        
	        	if(device.type == DEVICE_WEB && device.is_valid == 1){
		        	modelUser.set('device_web',1);
	        	}
	        
	        	if(device.type == DEVICE_IOS && device.is_valid == 1){
		        	modelUser.set('device_ios',1);
	        	}
	        
	        	if(device.type == DEVICE_ANDROID && device.is_valid == 1){
		        	modelUser.set('device_android',1);
	        	}
	        
            });
            
            return modelUser;
            
        },
        createCollectionByAPIResponse : function(data){
            
            var userAry = [];
            
            if(_.isArray(data.users)){
                
                _.each(data.users,function(row){
                    
                    userAry.push(userFactory.createModelByAPIResponse(row));
                     
                });
                
            }

            if(_.isArray(data.members)){
                
                _.each(data.members,function(row){
                    
                    userAry.push(userFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                        
            return new UserResult(userAry);
            
        }
            
    };
    
    var ModelUser = Backbone.Model.extend({
        defaults: {
            id: 0,
            firstname: "Not specified",
            lastname: "Not specified",
            image: "Not specified",
            originalData: ""
        },
        initialize: function(){
    
        }
    });
    
    var UserResult = Backbone.Collection.extend({
        model: ModelUser,
        searchById: function(userId){
            
            for( i in this.models){
                userModel = this.models[i];
                
                if(userModel.get('id') == userId)
                    return userModel;
            }
            
            return null;
            
        }
    });