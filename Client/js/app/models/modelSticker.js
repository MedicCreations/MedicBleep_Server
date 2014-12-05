    var stickerFactory = {
    
        createModelByAPIResponse : function(data){
            
            return new ModelProfileParameter({
                id: data.id,
                filename: data.filename,
                url: data.url
            });   
        },
        createCollectionByAPIResponse : function(data){
            
            var paramAry = [];
            
            if(_.isArray(data.stickers)){
                
                _.each(data.stickers,function(row){
                    
                    paramAry.push(stickerFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                   
            var stickerResult = new RoomResult(paramAry);  
            return stickerResult;
            
        }
            
    };

    var ModelSticker = Backbone.Model.extend({
        defaults: {
            id: 0,
            filename: '',
            url: ''
        },
        initialize: function(){
    
        }
    });
    
    var ModelStickerResult = Backbone.Collection.extend({
        model: ModelSticker
    });