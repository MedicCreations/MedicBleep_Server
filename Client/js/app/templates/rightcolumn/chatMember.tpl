
    <ul id="chatmember_holder">

        
    </ul>

	<script type="text/template" id="template_memberlist_row">
	
        <% _.each(users, function(user) { %>
            <li id="searchuserlist<%= user.get('id') %>" data-userid="<%= user.get('id') %>">
                <a><%= user.get('firstname') %><%= user.get('lastname') %></a>
            </li>
        <% }); %>
        
    </script>
    