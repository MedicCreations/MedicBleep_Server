<header>{title_edit_profile}</header>


<div id="profile_edit_view">
    
    <div class="img_with_loader">
        <img src="{rooturl}/img/default_user.png" class="user_profile_image" width="200" />
        <i class="fa fa-spinner fa-spin fa-4x" style="display:none"></i>
    </div>
    
	<div class="choose_file" style="display:none">
	    <input id="btn_dummy_file_upload_profile" name="Select File" type="file" />
    </div>
        
    <div id="profile_edit_profliedata">

        <div class="formrow">
            <label>{firstname}</label>
            <input type="text" name="firstname" value="" />
        </div>
        
        <div class="formrow topline">
            <label>{lastname}</label>
            <input type="text" name="lastname" value="" />
        </div>
        

        <div id="proflie_forms">
        </div>
        
        <div class="button_container">
            <a href="javascript:void(0)" class="button red">{cancel}</a>
            <a href="javascript:void(0)" class="button" id="btn_save_profile" style="display:none">{updateproflie}</a>
        </div>
        
    </div>
    
    <br style="clear: both" />
</div>

	<script type="text/template" id="template_proflie_form">
	
        <% _.each(parapeters, function(parameter) { %>

            <div class="formrow topline">
                <label><%= parameter.get('label') %></label>
                <input type="text" name="<%= parameter.get('key') %>" value="" />
            </div>
        		
        <% }); %>
        
    </script>