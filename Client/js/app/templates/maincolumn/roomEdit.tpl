<div id="room_edit_view">
    
    <div class="room_editor_top" id="">
    
        <div id="room_info">
            
            <div id="room_edit_avatarimage">
                <i class="fa fa-circle-o-notch fa-spin"></i>
                <img src="img/default_group.png" width="100%"/>
            </div>
			<div class="choose_file" style="display:none">
			    <input id="btn_dummy_file_upload_room_info" name="Select File" type="file" />
            </div>
    
            <div id="room_info_detail">

                <div class="formrow">
                    <label style="width: 100px">Room Name</label>
                    <input type="text" name="roomname" value="" style="width: 150px"/>
                    <br style="clear:both" />
                </div>

                <div class="formrow topline right">
                    <button id="btn_saveroominfo">Save</button>
                </div>
                
            </div>

        </div>
    
    </div>

    <div id="room_info_member">
    
        <p>Members</p>

        <div class="user_member">
            
            
            
        </div>
        
         <br style="clear:both" />
         
    </div>
    
   
    
    <div id="room_info_allusers">
    
        <p>Please select members</p>

 		<div class="tab_search">
			<p>
				<button type="submit"><i class="fa fa-search"></i></button>
				<input id="tb_search_user_room" type="text" />
			</p>
		</div>
    		
        <ul class="user_select">
            
            
            
        </ul>
        
    </div>

    
</div>


	<script type="text/template" id="template_userlist_row_editroom">
	
        <% _.each(users, function(user) { %>
            <li id="searchuserlist<%= user.get('id') %>" data-userid="<%= user.get('id') %>">
                 <%= user.get('firstname') %> <%= user.get('lastname') %>
            </li>
        <% }); %>
        
    </script>
    
	<script type="text/template" id="template_memberlist_editroom">
	    
	    <% _.each(users, function(user) { %>
            <div data-userid="<%= user.get('id') %>"><%= user.get('firstname') %> <%= user.get('lastname') %></div>
        <% }); %>
        
    </script>
    