    var userFactory = {
    
        createModelByAPIResponse : function(data){
            
            var user_id = 0;
            
            if(!_.isUndefined(data.user_id)){
                user_id = data.user_id;
            }
            
            if(!_.isUndefined(data.id)){
                user_id = data.id;
            }
            
            return new ModelUser({ id:user_id,firstname: data.firstname, lastname: data.lastname, image: data.image, image_thumb: data.image_thumb,details: data.details});   
            
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
            image: "Not specified"
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