
    		<div id="tab_groups_content">

        		<div id="tab_search">
        			<p>
        				<button type="submit"><i class="fa fa-search"></i></button>
        				<input id="tb_search_group" type="text" />
        			</p>
        		</div>
        		
        		<ul class="found_list" id="group_list">
        			<li class="selected">
        				<a href="">Group2</a>
        			</li>
        		</ul>
    		
    		</div>
    		
	<script type="text/template" id="template_grouplist_row">
	
        <% _.each(groups, function(group) { %>
            <li id="searchgrouplist<%= group.get('id') %>" data-groupid="<%= group.get('id') %>">
				<a><%= group.get('groupname') %></a>
			</li>
        <% }); %>
        
    </script>