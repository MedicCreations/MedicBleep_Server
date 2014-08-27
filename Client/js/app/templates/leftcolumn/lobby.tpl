
	<ul id="history_list">

	</ul>
	
	<script type="text/template" id="template_history_row">
	
        <% _.each(history, function(historyRow) { %>

            <li data-chatid="<%= historyRow.get('chat_id') %>">
                <a><%= historyRow.get('chat_name') %> <%= historyRow.get('unread_text') %></a>
            </li>

        <% }); %>
        
    </script>
    