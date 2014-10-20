
    	<div class="menu_search">
    			<input type="text" placeholder="Search" />
    			<a>
    				<i class="fa fa-search fa-2x"></i>
    			</a>
    	</div>
    	
    	<div class="scrollable">
    	
        	<ul class="menu_list">



        	</ul>
    	</div>
    	
	<script type="text/template" id="template_roomlist_row">
	
        <% _.each(rooms, function(room) { %>

    	       <li chatid="<%= room.get('chat_id') %>">
        			<p class="cell cell_1">
        				<img class="encrypted_image icon1" src="{rooturl}/img/default_group.png" fileid="<%= room.get('image_thumb') %>" state="loading" width="40"/>
        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					<%= room.get('chat_name') %> <%= room.get('unread_formatted') %>
        				</p>
        				<p>
        					
        				</p>
        			</div>
        			<p class="cell cell_3">
        				<a href="">
        					<span class="fa-stack fa-lg">
        					  <i class="fa fa-angle-right fa-stack-1x"></i>
        					</span>
        				</a>
        			</p>
        		</li>
        		
        <% }); %>
        
    </script>
    

        		