	<img class="profile_pic" src="{rooturl}/img/default_group.png" />
	<dl>
		<dt id="roomprofile_name">
			
		</dt>
	</dl>

    <ul class="chat_member_list">
        
    </ul>


	<script type="text/template" id="template_roommemberlist_row">
	
        <% _.each(users, function(user) { %>

            <li>
                <img class="encrypted_image icon1" src="{rooturl}/img/default_user.png" fileid="<%= user.get('image_thumb') %>" state="loading" width="40"/>
                &nbsp;&nbsp; <a href="javascript:void(0)" userid="<%= user.get('id') %>"><%= user.get('firstname') %> <%= user.get('lastname') %></a>
            <li>
        
        <% }); %>
        
    </script>