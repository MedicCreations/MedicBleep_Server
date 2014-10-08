    var chatFactory = {
    
        createModelByAPIResponse : function(data){   
            return new ModelHistory({ chat_id:data.chat_id,chat_name: data.chat_name});   
        },
        createModelByAPIResponse2 : function(data){   
            return new ModelHistory({ chat_id:data.id,
                                        chat_name: data.chat_name,
                                        group_id: data.group_id,
                                        image: data.image,
                                        image_thumb: data.image_thumb});   
        }


                  
    };
    
    var ModelChat = Backbone.Model.extend({
        defaults: {
            chat_id: 0,
            chat_name: "",
            group_id: 0,
            image: "",
            image_thumb: ""
        },
        initialize: function(){

        }
    });
    