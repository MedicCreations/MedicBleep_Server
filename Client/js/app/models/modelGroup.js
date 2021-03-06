    var groupFactory = {
    
        createModelByAPIResponse : function(data){
            var group_id = 0;
            var group_name = '';
            
            if(!_.isUndefined(data.group_id)){
                group_id = data.group_id;
            }
            
            if(!_.isUndefined(data.id)){
                group_id = data.id;
            }

            if(!_.isEmpty(data.name)){
                group_name = data.name;
            }
            
            if(!_.isEmpty(data.groupname)){
                group_name = data.groupname;
            }
                
            return new ModelGroup({ id:group_id,groupname: group_name, image: data.image, image_thumb:  data.image_thumb});   
        },
        createCollectionByAPIResponse : function(data){
            
            var groupAry = [];
            
            if(_.isArray(data.groups)){
                
                _.each(data.groups,function(row){
                    
                    groupAry.push(groupFactory.createModelByAPIResponse(row));
                     
                });
                
            }
            
            return new GroupResult(groupAry);
            
        }
            
    };
    
    var ModelGroup = Backbone.Model.extend({
        defaults: {
            id: 0,
            groupname: "Not specified",
            image: "Not specified",
            image_thumb: "Not specified",
        },
        initialize: function(){
    
        }
    });
    
    var GroupResult = Backbone.Collection.extend({
        model: ModelGroup,
        searchById: function(groupId){

            for( i in this.models){
                groupModel = this.models[i];
                
                if(groupModel.get('id') == groupId)
                    return groupModel;
            }
            
            return null;
            
        }
    });