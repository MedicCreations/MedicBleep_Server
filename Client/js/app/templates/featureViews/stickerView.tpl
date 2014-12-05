<div id="sticker_selecter" style="display: none">
    
    <div class="sticker_holder">
 
    </div>
    
</div>

    	<script type="text/template" id="template_sticker_row">
    	
            <% _.each(stickers, function(sticker) { %>

                <a class="sticker_btn" href="javascript:void(0)" sticker="<%= sticker.get('url') %>">
                    <img src="<%= sticker.get('url') %>" />
                </a>
                                     
            <% }); %>
            
        </script>

