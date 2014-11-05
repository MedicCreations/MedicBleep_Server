
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
    	
	<script type="text/template" id="template_userlist_row">
	
        <% _.each(users, function(user) { %>

    	       <li data-userid="<%= user.get('id') %>">
        			<p class="cell cell_1">
                        <img class="encrypted_image icon1" src="{rooturl}/img/default_user.png" fileid="<%= user.get('image_thumb') %>" state="loading" width="40"/>

        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					<%= user.get('firstname') %> <%= user.get('lastname') %>
        					<% if(user.get('webOpened') == 1) { %> <i class="fa fa-circle" style="color:#00BD38;font-size: 8pt"></i> <% } %>
        				</p>
        				<p>
        					<% if(user.get('device_ios') == 1) { %> <i class="fa fa-apple" ></i> <% } %>
        					<% if(user.get('device_android') == 1) { %> <i class="fa fa-android" ></i> <% } %>
        					<% if(user.get('device_web') == 1) { %> <i class="fa fa-desktop" ></i> <% } %>
        					
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
    

        		