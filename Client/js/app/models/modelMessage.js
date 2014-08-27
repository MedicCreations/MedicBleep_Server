    var messageFactory = {
    
        createModelByAPIResponse : function(data){

            return new ModelMessage(
                { 
                    id: data.id,
                    chat_id: data.chat_id,
                    created: data.created,
                    file_id: data.file_id,
                    firstname: data.firstname,
                    image: data.image,
                    image_thumb: data.image_thumb,
                    lastname: data.lastname,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    modified: data.modified,
                    text: data.text,
                    thumb_id: data.thumb_id,
                    type: data.type,
                    user_id: data.user_id,
                    parent_id: data.parent_id,
                    root_id: data.root_id,
                    child_list: data.child_list
                });   
        },
        createCollectionByAPIResponse : function(data){
            
            var messageAry = [];
            
            if(_.isArray(data.messages)){
                
                _.each(data.messages,function(row){
                    
                    messageAry.push(messageFactory.createModelByAPIResponse(row));
                     
                });
                
            }
            
            return new MessageResult(messageAry);
            
        }
            
    };

    var ModelMessage = Backbone.Model.extend({
        defaults: {
            id: 0,
            chat_id: 0,
            created: 0,
            file_id: 0,
            firstname: '',
            image: '',
            image_thumb: '',
            lastname: '',
            latitude: 0,
            longitude: 0,
            modified: 0,
            text: '',
            thumb_id: 0,
            type: 0,
            user_id: 0,
            parent_id: 0,
            root_id: 0,
            child_list:'',
            indent:0
        },
        initialize: function(){
            
            var formatedDate = U.formatDate(this.get('created'));
            this.set('created_formated',formatedDate);
            this.set('avatar_url',API_URL + "/file/download?file_id=" + this.get('image_thumb'));
        }
    });
    
    var MessageResult = Backbone.Collection.extend({
        model: ModelMessage,
        searchById: function(messageId){
            
            for( i in this.models){
                messageModel = this.models[i];
                
                if(messageModel.get('id') == messageId)
                    return messagseModel;
            }
            
            return null;
            
        },
        comparator : function(model) {
            return parseInt(model.get('id'));
        }
    });