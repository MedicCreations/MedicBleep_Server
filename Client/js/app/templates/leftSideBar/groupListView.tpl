
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
    	
	<script type="text/template" id="template_grouplist_row">
	
        <% _.each(groups, function(group) { %>

    	       <li data-groupid="<%= group.get('id') %>">
        			<p class="cell cell_1">
        				<img class="encrypted_image icon1" src="{rooturl}/img/default_group.png" fileid="<%= group.get('image_thumb') %>" state="loading" width="40"/>
        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					<%= group.get('groupname') %>
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
    

        		