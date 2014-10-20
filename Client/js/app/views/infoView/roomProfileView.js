var SPIKA_RoomProfileView = Backbone.View.extend({
    
    chatData : null,
    currentPage : 0,
    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    onload : function(){

        var self = this;
        
        
    },
    
    showRoom : function(chatId){
        
        var self = this;
        var user = SPIKA_UserManager.getUser();
        
        if(_.isEmpty(chatId) || chatId == 0)
            return;

        // get chat data first
        apiClient.getChatById(chatId,function(data){
            
            self.chatData = roomFactory.createModelByAPIResponse(data.chat_data);

            EncryptManager.decryptImage($$('#user_profile .profile_pic'),self.chatData.get('image_thumb'),THUMB_PIC_SIZE,apiClient,null,null,false);
            
            var name = self.chatData.get('chat_name');

            $$('#user_profile #roomprofile_name').html(name);
            
            self.showMembers();
            
            if(self.chatData.get('admin_id') == user.get('id') && self.chatData.get('type') != 2){
            
                $$('#btn_edit_room').css('display','inline-block');
                $$('#btn_edit_room').click(function(){
                    
                    U.goPage('editroom');
                     
                });
                
                if(self.chatData.get('type') != 1){
                
                    $$('#btn_delete_room').css('display','inline-block');
                    $$('#btn_delete_room').click(function(){
                        
                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // update room info
                            apiClient.updateRoom(
                                self.chatData.get('chat_id') ,
                                '',
                                '',
                                '',
                                '1',
                                '',
                                function(updateResult){
    
                                    Backbone.trigger(EVENT_LEAVE_CHAT,self.chatData.get('chat_id'));
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });
                            
                        },function(){
                            
                        });
                         
                    });
                }
                                
                if(self.chatData.get('is_active') == 1){
                
                    $$('#btn_deactivate_room').css('display','inline-block');
                    $$('#btn_deactivate_room').click(function(){

                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // update room info
                            apiClient.updateRoom(
                                self.chatData.get('chat_id') ,
                                '',
                                '',
                                '',
                                '',
                                '0',
                                function(updateResult){
    
                                    _.debounce(function() {
                                        Backbone.trigger(EVENT_START_CHAT,self.chatData.get('chat_id'));
                                    }, 1000)();
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });
                            
                        },function(){
                            
                        });

                        
                    });
                
                }else{

                    $$('#btn_activate_room').css('display','inline-block');
                    $$('#btn_activate_room').click(function(){
                        
                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // update room info
                            apiClient.updateRoom(
                                self.chatData.get('chat_id') ,
                                '',
                                '',
                                '',
                                '',
                                '1',
                                function(updateResult){
    
                                    _.debounce(function() {
                                        Backbone.trigger(EVENT_START_CHAT,self.chatData.get('chat_id'));
                                    }, 1000)();
                    
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });

                        },function(){
                            
                        });


                    });    
                
                }


            
            } else {
                
                if(self.chatData.get('type') != 1 &&  self.chatData.get('type') != 2){
                    $$('#btn_leave_room').css('display','inline-block');
                    $$('#btn_leave_room').click(function(){
                        
                        SPIKA_AlertManager.show(LANG.confirm,LANG.confirm_general,function(){
                            
                            // delete users
                            apiClient.deleteUsersFromChat(
                                self.chatData.get('chat_id'),
                                user.get('id'),
                                function(dataChat2){
        
                                    Backbone.trigger(EVENT_LEAVE_CHAT,self.chatData.get('chat_id'));
        
                                },function(data){
                                
                                    SPIKA_AlertManager.show(LANG.general_errortitle,"Failed to update room");
                    
                            });
                            
                        },function(){
                            
                        });
                        
                    }); 
                }
            }
            
        },function(data){
            
            
            
        });

        
    },
    
    showMembers : function(){
        
        var self = this;

        apiClient.getChatMembers(self.chatData.get('chat_id'),function(data){

            var chatMembers = userFactory.createCollectionByAPIResponse(data)
            var html = _.template($$('#user_profile #template_roommemberlist_row').html(), {users: chatMembers.models});
            $$('#user_profile .chat_member_list').html(html);
            
            $$('#user_profile .encrypted_image').each(function(){
            
                var state = $(this).attr('state');
                var fileId = $(this).attr('fileid');
                
                if(state == 'loading'){
                    
                    EncryptManager.decryptImage(this,fileId,THUMB_PIC_SIZE_INVIEW,apiClient);
                        
                }
                
            });

            $$('#user_profile .chat_member_list a').click(function(){
                var userid = $(this).attr('userid');
                mainView.infoView.showUserProfile(userid);
            });
            
        },function(data){
            
            
            
        });
        
    }
    
});