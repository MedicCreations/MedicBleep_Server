<header></header>

<nav id="left_sidebar">

	<div id="menu_container_selectuser">

    	<div class="menu_search">
    		<form>
    			<input type="text" placeholder="Search" />
    			<a>
    				<i class="fa fa-search fa-2x"></i>
    			</a>
    		</form>
    	</div>
    	
    	<div class="scrollable">
    	
        	<ul class="menu_list">


        	</ul>
    	</div>
    	
	</div>
	
    <div id="nav_bottom_createroom">
		<a href="javascript:void(0)">
		<span class="fa-stack fa-lg">
		  <i class="fa fa-times fa-stack-1x"></i>
		</span>
		</a>
	</div>


</nav>

<div id="createroom_container">
    
    <div class="room_info">
        
        <div class="img_with_loader">
            <img src="{rooturl}/img/default_group.png" class="room_profile_image" width="200" />
            <i class="fa fa-spinner fa-spin fa-4x"></i>
        </div>
        
        
        <div class="room_parameters_form">
            
            <input type="text" name="roomname" placeholder="{roomname_placeholder}" />
			
			<div class="room_password_holder">
            	<input type="password" name="password" placeholder="{roompassword_placeholder}" />
            	<input type="password" name="password_confirm" placeholder="{roompassword_placeholder_again}" />
            	<br style="clear: both" />
            	<span class="passwordnotice textred">{roompassword_notice}</span>
			</div>
			
            <input type="checkbox" name="isprivate" style="width: 20px;display: inline"/> {room_private}

            <select class="category_select_box"></select>

        	<div class="choose_file" style="display:none">
        	    <input id="btn_dummy_file_upload_profile" name="Select File" type="file" />
            </div>

            <br style="clear: both"/>
            
            <div class="button_container">
                <a href="javascript:void(0)" class="button red">{cancel}</a>
                <a href="javascript:void(0)" class="button" id="btn_create_room">{general_save}</a>
            </div>
    
        </div>
    
    </div>
    
    <br style="clear: both"/>
    
    <div class="mambers_panel">
    
        <div class="members_container user">
            
            <h3>{createroom_users}</h3>
            
            <ul class="members">
         
            </ul>
        
        </div>
    
        <div class="members_container group">
            
            <div class="selectedlist">

                <h3><i class="fa fa-plus-square fa-lg"></i> {createroom_groups} </h3>
                
                <ul class="members">
                    
                    
                    
                </ul>
                
            </div>
             
            <div class="selectlist scrollable"  style="display:none">
                
                <h3><i class="fa fa-minus-square fa-lg"></i> {createroom_groups_select} </h3>
                
                <input type="text" name="search_group_tb" placeholder="{createroom_search}" value=""/>

                <ul class="members">
                    
                    
                    
                </ul>
                
            </div>
                       
        </div>
    
        <div class="members_container room">
                
            <div class="selectedlist">

                <h3><i class="fa fa-plus-square fa-lg"></i> {createroom_rooms} </h3>
                
                <ul class="members">
                    
                    
                    
                </ul>
                
            </div>
             
            <div class="selectlist scrollable"  style="display:none">
                
                <h3><i class="fa fa-minus-square fa-lg"></i> {createroom_rooms_select} </h3>
                
                <input type="text" name="search_group_tb" placeholder="{createroom_search}" value=""/>

                <ul class="members">
                    
                    
                    
                </ul>
                
            </div>
            
        </div>
        
    </div>



	<script type="text/template" id="template_userlist_row">
	
        <% _.each(users, function(user) { %>

    	       <li data-userid="<%= user.get('id') %>">
    	       
        			<p class="cell cell_1">
                        <img class="encrypted_image icon1" src="{rooturl}/img/default_user.png" fileid="<%= user.get('image_thumb') %>" state="loading" width="40"/>
        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					<%= user.get('firstname') %> <%= user.get('lastname') %>
        				</p>
        				<p>
        					
        				</p>
        			</div>
        			<p class="cell cell_3">
        				<a href="javascript:void(0)">
        					<span class="fa-stack fa-lg">
        					  <i class="fa fa-plus fa-stack-1x"></i>
        					</span>
        				</a>
        			</p>
        		</li>
        		
        <% }); %>
        
    </script>

	<script type="text/template" id="template_memberlist_row">
	
        <% _.each(users, function(user) { %>

           <li data-userid="<%= user.get('id') %>">
               <img class="encrypted_image icon1" src="{rooturl}/img/default_user.png" fileid="<%= user.get('image_thumb') %>" state="loading" width="40"/>
               <span>
                    <%= user.get('firstname') %> <%= user.get('lastname') %>
               </span>
               <i class="fa fa-times"  data-userid="<%= user.get('id') %>"></i>
           </li> 
        		
        <% }); %>
        
    </script>

	<script type="text/template" id="template_grouplist_row">
	
        <% _.each(groups, function(group) { %>

           <li data-groupid="<%= group.get('id') %>">
               <img class="encrypted_image icon1" src="{rooturl}/img/default_group.png" fileid="<%= group.get('image_thumb') %>" state="loading" width="40"/>
               <span>
                    <%= group.get('groupname') %>
               </span>
               <i class="fa fa-plus"  data-groupid="<%= group.get('id') %>"></i>
           </li> 
        		
        <% }); %>
        
    </script>

	<script type="text/template" id="template_roomlist_row">
	
        <% _.each(rooms, function(room) { %>

           <li data-roomid="<%= room.get('chat_id') %>">
               <img class="encrypted_image icon1" src="{rooturl}/img/default_group.png" fileid="<%= room.get('image_thumb') %>" state="loading" width="40"/>
               <span>
                    <%= room.get('chat_name') %>
               </span>
               <i class="fa fa-plus"  data-roomid="<%= room.get('chat_id') %>"></i>
           </li> 
        		
        <% }); %>
        
    </script>

   
    <script type="text/template" id="template_categorylist_createroom_row">
        
        <option value=""><%= LANG.category_not_specified %></option>
        
        <% _.each(categories, function(category) { %>
    	        <option value="<%= category.get('id') %>"><%= category.get('name') %></option>
        <% }); %>
        
    </script>


</div>