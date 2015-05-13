    var categoryFactory = {
    
        createModelByAPIResponse : function(data){
            
            return new ModelCategory({
                id: data.id,
                name: data.name
            });   
        },
        createCollectionByAPIResponse : function(data){
            
            var categoryAry = [];
            
            if(_.isArray(data.categories)){
                
                _.each(data.categories,function(row){
                    
                    categoryAry.push(categoryFactory.createModelByAPIResponse(row));
                     
                });
                
            }
                   
            var catResult = new RoomResult(categoryAry);  
            return catResult;
            
        }
            
    };

    var ModelCategory = Backbone.Model.extend({
        defaults: {
            id: 0,
            name: ''
        },
        initialize: function(){
    
        }
    });
    
    var CategoryResult = Backbone.Collection.extend({
        model: ModelCategory
    });