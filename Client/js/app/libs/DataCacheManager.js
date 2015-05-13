//http://stackoverflow.com/questions/26329807/fast-multiple-copy-of-img-dom

DataCacheManager = {
	modelChatCache : [],
	updateChatModelCacheByCollection : function(collection){
		
		var self = this;
		
        _.each(collection.models,function(model){
           	self.modelChatCache[model.get('chat_id')] = model;
        });

	},
	getChatModelById : function(chatId){
		return this.modelChatCache[chatId];
	}
}
