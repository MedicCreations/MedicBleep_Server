    var chatFactory = {
    
        createModelByAPIResponse : function(data){
                        
            var chat_id = 0;
            var chat_name = '';
                        
            if(!_.isUndefined(data.chat_id)){
                chat_id = data.chat_id;
            }
                       
            if(!_.isUndefined(data.id)){
                chat_id = data.id;
            }

            if(!_.isEmpty(data.chat_name)){
                chat_name = data.chat_name;
            }
            
            if(!_.isEmpty(data.name)){
                chat_name = data.name;
            }
            
            return new ModelChat({
                admin_id: data.admin_id,
                chat_id: chat_id,
                chat_name: chat_name,
                group_id: data.group_id,
                image: data.image,
                image_thumb: data.image_thumb,
                is_active: data.is_active,
                is_deleted: data.is_deleted,
                modified: data.modified,
                type: data.type,
                unread: data.unread
            });   
        },
        createCollectionByAPIResponse : function(data){
            
            var chatAry = [];
            
            if(_.isArray(data.all_chats.chats)){
                
                _.each(data.all_chats.chats,function(row){
                    
                    chatAry.push(chatFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                   
            var chatResult = new ChatResult(chatAry);  
            return chatResult;
            
        }
            
    };

    var ModelChat = Backbone.Model.extend({
        defaults: {
            admin_id: 0,
            chat_id: 0,
            chat_name: '',
            group_id: 0,
            image: '',
            image_thumb: '',
            is_active: 1,
            is_deleted: 0,
            modified: '',
            type: '',
            unread: ''
        },
        initialize: function(){
    
        }
    });
    
    var ChatResult = Backbone.Collection.extend({
        model: ModelChat,
        searchById: function(roomId){

            for( i in this.models){
                roomModel = this.models[i];
                
                if(roomModel.get('chat_id') == roomId)
                    return roomModel;
            }
            
            return null;
            
        }
    });