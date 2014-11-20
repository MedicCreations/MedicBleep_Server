    var profileParameterFactory = {
    
        createModelByAPIResponse : function(data){
            
            return new ModelProfileParameter({
                id: data.id,
                key: data.key,
                label: data.label
            });   
        },
        createCollectionByAPIResponse : function(data){
            
            var paramAry = [];
            
            if(_.isArray(data.detail_values)){
                
                _.each(data.detail_values,function(row){
                    
                    paramAry.push(profileParameterFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                   
            var paramResult = new RoomResult(paramAry);  
            return paramResult;
            
        }
            
    };

    var ModelProfileParameter = Backbone.Model.extend({
        defaults: {
            id: 0,
            key: 0,
            label: ''
        },
        initialize: function(){
    
        }
    });
    
    var ProfileParameterResult = Backbone.Collection.extend({
        model: ModelProfileParameter
    });