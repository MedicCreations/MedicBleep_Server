
<article class="scrollable nochat">

    <div id="nochatbox">
        <i class="fa fa-exclamation-triangle"></i>
        {chat_nochat}
    </div>

</article>

<footer>

</footer>

    	<script type="text/template" id="template_message_row">
    	
            <% _.each(messages, function(message) { %>

            	<section style="padding-left: 20px;" userid="<%= message.get('user_id') %>">
            		<p class="icon usericon"  userid="<%= message.get('user_id') %>">
            			<img class="encrypted_image_profile icon1" src="{rooturl}/img/default_user.png" fileid="<%= message.get('image_thumb') %>" state="loading" width="40"/>
            		</p>
            		<div class="chat_content">
            			<h2>
            				<%= message.get('firstname') %> <%= message.get('lastname') %>
            			</h2>
            			<p class="text">
            				<%= message.get('content') %>
            				<!-- <input class="download" type="button" value="Download" /> -->
            			</p>
            			<div class="time_stamp">
            				<%= message.get('created_formated') %>
            			</div>
            		</div>
            		<div class="replay">
            			<p>
            				<a href="">
            				<i class="fa fa-reply fa-4x"></i><br />
            				Replay
            				</a>
            			</p>
            			<p>
            				<a href="">
            				<i class="fa fa-trash fa-4x"></i><br />
            				Delete
            				</a>
            			</p>
            		</div>
            	</section>

            <% }); %>
            
        </script>

