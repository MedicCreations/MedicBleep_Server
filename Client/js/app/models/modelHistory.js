    var historyFactory = {
    
        createModelByAPIResponse : function(data){   
            return new ModelHistory({ chat_id:data.chat_id,chat_name: data.chat_name, image: data.image, image_thumb:  data.image_thumb,unread: data.unread, group_id: data.group_id});   
        },
        createCollectionByAPIResponse : function(data){
            
            var historyAry = [];
            
            if(_.isArray(data.all_chats.chats)){
                
                _.each(data.all_chats.chats,function(row){

                    historyAry.push(historyFactory.createModelByAPIResponse(row));
                    
                });
                
            }
                   
            return new CollectionHistory(historyAry);
            
        }
            
    };
    
    var ModelHistory = Backbone.Model.extend({
        defaults: {
            chat_id: 0,
            chat_name: "",
            image: "",
            image_thumb: "",
            unread: 0,
            group_id: 0
        },
        initialize: function(){
            var unreadText = "";
            
            if(this.get('unread') > 0)
                unreadText = "(" + this.get('unread') + ")";
                
            this.set('unread_text',unreadText);
            
        }
    });
    
    var CollectionHistory = Backbone.Collection.extend({
        model: ModelHistory,
        searchById: function(chatId){
            
            for( i in this.models){
                chatModel = this.models[i];
                
                if(chatModel.get('chat_id') == chatId)
                    return chatModel;
                    
            }
            
            return null;
            
        }
    });