    var roomFactory = {
    
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
            
            return new ModelRoom({
                admin_id: data.admin_id,
                chat_id: chat_id,
                category_id: data.category_id,
                chat_name: chat_name,
                group_id: data.group_id,
                group_ids: data.group_ids,
                image: data.image,
                image_thumb: data.image_thumb,
                is_active: data.is_active,
                is_deleted: data.is_deleted,
                modified: data.modified,
                type: data.type,
                unread: data.unread,
                password: data.password,
                is_private: data.is_private
            });   
        },
        createCollectionByAPIResponse : function(data){
            
            var roomAry = [];
            
            if(_.isArray(data.rooms)){
                
                _.each(data.rooms,function(row){
                    
                    roomAry.push(roomFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                   
            var roomResult = new RoomResult(roomAry);  
            return roomResult;
            
        }
            
    };

    var ModelRoom = Backbone.Model.extend({
        defaults: {
            admin_id: 0,
            chat_id: 0,
            category_id: 0,
            chat_name: '',
            group_id: 0,
            group_ids: '',
            image: '',
            image_thumb: '',
            is_active: 1,
            is_deleted: 0,
            modified: '',
            type: '',
            unread: '',
            password: '',
            is_private: 0,
        },
        initialize: function(){
    
        }
    });
    
    var RoomResult = Backbone.Collection.extend({
        model: ModelRoom,
        searchById: function(roomId){

            for( i in this.models){
                roomModel = this.models[i];
                
                if(roomModel.get('chat_id') == roomId)
                    return roomModel;
            }
            
            return null;
            
        }
    });