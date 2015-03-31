
<article class="scrollable nochat">
	
    <div id="nochatbox">
        <i class="fa fa-exclamation-triangle"></i>
        {chat_nochat}
    </div>

</article>

<div id="room_actions">

    <a href="javascript:void(0)" class="button" id="btn_note"><i class="fa fa-pencil-square-o"></i> {note}</a>
    <a href="javascript:void(0)" class="button" id="btn_edit_room" style="display:none">{editroom}</a>
    <a href="javascript:void(0)" class="button red" id="btn_deactivate_room" style="display:none">{deactivateroom}</a>
    <a href="javascript:void(0)" class="button red" id="btn_activate_room" style="display:none">{activateroom}</a>
    <a href="javascript:void(0)" class="button red" id="btn_leave_room" style="display:none">{leaveroom}</a>
    <a href="javascript:void(0)" class="button red" id="btn_delete_room" style="display:none">{deleteroom}</a>
        
</div>

<div id="thread_view_header">
	Thread View Mode <a href="javascript:void(0)">Finish</a>
</div>


<footer>

</footer>

    	<script type="text/template" id="template_message_row">
    	
            <% _.each(messages, function(message) { %>
                                                
            	<section userid="<%= message.get('user_id') %>" messageid="<%= message.get('id') %>">
            	    <div class="message_icon_holder">
            	        <i class="icon_replytarget fa fa-caret-right blink large" style="display:none"></i>
            	        
            	        <% if(message.get('child_list') != ''){ %><i class="icon_rootmessage fa fa-arrow-right large"></i><% } %>
            	        <% if(message.get('parent_id') != 0)  {%><i class="icon_repliedmessage fa fa-arrow-left large"></i><% } %>
            	        
            	    </div>
            	    <div style="padding-left: <%= message.get('indentpixel') %>px;" >
                		<p class="icon usericon" userid="<%= message.get('user_id') %>">
                			<img class="encrypted_image_profile icon1" src="{rooturl}/img/default_user.png" fileid="<%= message.get('image_thumb') %>" state="loading" width="40"/>
                		</p>
                		<div class="chat_content">
                			<h2>
                				<%= message.get('firstname') %> <%= message.get('lastname') %>
                			</h2>
                			<% if(message.get('type') == "4"){ %>
	                			<%= message.get('content') %>
                			<%}else{%>
	                			<p class="text">
	                			    <!-- <%= message.get('id') %> -->
	                				<%= message.get('content') %>
	                				<!-- <input class="download" type="button" value="Download" /> -->
	                			</p>
                			<%}%>
                			
                			<div class="time_stamp">
                				<%= message.get('created_formated') %>
                			</div>
                		</div>
                		<div class="replay">
                			<p class="message-menu-btn-reply" userid="<%= message.get('user_id') %>">
                				<a href="javascript:void(0)" class="btn-reply"  messageid="<%= message.get('id') %>">
                				<i class="fa fa-reply fa-2x"></i><br />
                				{reply}
                				</a>
                			</p>
                			<p class="message-menu-btn-delete" userid="<%= message.get('user_id') %>">
                				<a href="javascript:void(0)" class="btn-delete"  messageid="<%= message.get('id') %>">
                				<i class="fa fa-trash fa-2x"></i><br />
                				{delete}
                				</a>
                			</p>
                		</div>
            	    </div>
            	</section>

            <% }); %>
            
        </script>

