<div id="room_edit_view">
    
    <div class="room_editor_top" id="">
    
        <div id="room_info">
            
            <img src="img/default_group.png" />
            
            <div id="room_info_detail">

                <div class="formrow">
                    <label style="width: 100px">Room Name</label>
                    <input type="text" name="roomname" value="" style="width: 150px"/>
                    <br style="clear:both" />
                </div>

                <div class="formrow topline right">
                    <button id="btn_saveprofile">Save</button>
                </div>
                
            </div>

        </div>
    
    </div>
    
    <div id="room_info_members">

        <div id="room_info_allusers">
        
            <p>Please select members</p>
 
     		<div class="tab_search">
    			<p>
    				<button type="submit"><i class="fa fa-search"></i></button>
    				<input id="tb_search_user" type="text" />
    			</p>
    		</div>
        		
            <ul class="user_select">
                
                
                
            </ul>
            
        </div>

        <div id="room_info_members">
            
            <p>Room Members</p>

     		<div class="tab_search">
    			<p>
    				<button type="submit"><i class="fa fa-search"></i></button>
    				<input id="tb_search_user" type="text" />
    			</p>
    		</div>
        		
        </div>
        
    </div>
    
</div>


	<script type="text/template" id="template_userlist_row_editroom">
	
        <% _.each(users, function(user) { %>
            <li id="searchuserlist<%= user.get('id') %>" data-userid="<%= user.get('id') %>">
                <img src="img/default_user.png" width="30px" />
                 <%= user.get('firstname') %><%= user.get('lastname') %>
            </li>
        <% }); %>
        
    </script>
    
