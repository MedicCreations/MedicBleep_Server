    		<div id="tab_users_content">

        		<div id="tab_search">
        			<p>
        				<button type="submit"><i class="fa fa-search"></i></button>
        				<input id="tb_search_user" type="text" />
        			</p>
        		</div>
        		
        		<ul class="found_list" id="user_list">

        			<li class="selected">
        				<a href="">Ken Yasue</a>
        			</li>

        		</ul>
    		
    		</div>

	<script type="text/template" id="template_userlist_row">
	
        <% _.each(users, function(user) { %>
            <li id="searchuserlist<%= user.get('id') %>" data-userid="<%= user.get('id') %>">
                <a><i class="fa fa-plus addtochatbtn" data-userid="<%= user.get('id') %>"></i> <%= user.get('firstname') %><%= user.get('lastname') %></a>
            </li>
        <% }); %>
        
    </script>