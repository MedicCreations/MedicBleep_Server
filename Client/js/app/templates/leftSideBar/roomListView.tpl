
    	<div class="menu_search">
    		<form>
    			<input type="text" placeholder="Search" />
    			<a>
    				<i class="fa fa-search fa-2x"></i>
    			</a>
    		</form>
    	</div>
    	
    	<div class="scrollable">
    	
        	<ul id="menu_list">



        	</ul>
    	</div>
    	
	<script type="text/template" id="template_roomlist_row">
	
        <% _.each(rooms, function(room) { %>

    	       <li>
        			<p class="cell cell_1">
        				<img class="icon1" src="img/max.png" />
        			</p>
        			<div class="cell cell_2">
        				<p class="name">
        					Chat room 1dd
        				</p>
        				<p>
        					3 members
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
    

        		