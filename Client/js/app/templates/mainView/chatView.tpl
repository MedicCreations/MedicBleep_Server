
<article class="scrollable nochat">

    <div id="nochatbox">
        <i class="fa fa-exclamation-triangle"></i>
        {chat_nochat}
    </div>
    
<!--
	<section>
		<p class="icon">
			<img class="icon1" src="img/max.png" />
		</p>
		<div class="chat_content">
			<h2>
				User name 1
			</h2>
			<p class="text">
				Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
			</p>
			<div class="time_stamp">
				3 min ago
			</div>
		</div>
	</section>
	<section style="padding-left: 60px;">
		<p class="icon">
			<img class="icon1" src="img/max.png" />
		</p>
		<div class="chat_content">
			<h2>
				User name 1
			</h2>
			<p class="text">
				Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
			</p>
			<div class="time_stamp">
				3 min ago
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
	<section style="padding-left: 60px;">
		<p class="icon">
			<img class="icon1" src="img/max.png" />
		</p>
		<div class="chat_content">
			<h2>
				User name 1
			</h2>
			<p class="text">
				<img src="img/max.png" />
				<input class="download" type="button" value="Download" />
			</p>
			<div class="time_stamp">
				3 min ago
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
	<section style="padding-left: 20px;">
		<p class="icon">
			<img class="icon1" src="img/max.png" />
		</p>
		<div class="chat_content">
			<h2>
				User name 1
			</h2>
			<p class="text">
				Screen Shot 2014-10-01 at 13.08.57.png<br />
				<input class="download" type="button" value="Download" />
			</p>
			<div class="time_stamp">
				3 min ago
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
	
-->

</article>

<footer>

</footer>

    	<script type="text/template" id="template_message_row">
    	
            <% _.each(messages, function(message) { %>

            	<section style="padding-left: 20px;">
            		<p class="icon">
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

