
			
		<section id="chat_view">
			<ul style="width:100%">

			</ul>
		</section>
		

		<div id="chat_post_holder">
		
		</div>
			
    		
    		
    	<script type="text/template" id="template_message_row">
    	
            <% _.each(messages, function(message) { %>

	            <li data-messageid="<%= message.get('id') %>">
	                
					<p class="sum_img">
						<img class="encrypted_image_profile" src="img/default_user.png" fileid="<%= message.get('image_thumb') %>" state="loading" width="40"/>
						
					</p>
					<div class="mess_content" style="padding-left:<%= message.get('indent') * 20 %>px">
					    <div class="mess_body">
    						<em class="date">
    							<%= message.get('created_formated') %>
    						</em>
    						<span class="name">
    							<%= message.get('firstname') %> <%= message.get('lastname') %>
    						</span>
    						<p>
    						    <%= message.get('content') %>
    						</p>
                        </div>
    					<div class="mess_option">
    					    
    					    <a href="#" class="button reply" data-messageid="<%= message.get('id') %>">
    					        <i class="fa fa-reply"></i>
    					    </a>
    					    
    					</div>
					</div>

				</li>

            <% }); %>
            
        </script>


