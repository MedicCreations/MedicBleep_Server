    	<div class="scrollable">

        	<ul class="menu_list">

                

        	</ul>
    	</div>
    	
	<script type="text/template" id="template_chatlist_row">
	
        <% _.each(chats, function(chat) { %>

    	       <li chatid="<%= chat.get('chat_id') %>">
        			<p class="cell cell_1">
                        <img class="encrypted_image icon1" src="{rooturl}/img/default_user.png" fileid="<%= chat.get('image_thumb') %>" state="loading" width="40"/>

        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					<%= chat.get('chat_name') %>
        				</p>
        				<p>
        					<%= chat.get('unread_formatted') %>
        				</p>
        			</div>
        			<p class="cell cell_3">
        				<a href="javascript:void(0)">
        					<span class="fa-stack fa-lg">
        					  <i class="fa fa-angle-right fa-stack-1x"></i>
        					</span>
        				</a>
        			</p>
        		</li>
        		
        <% }); %>
        
    </script>
    