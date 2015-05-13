<!DOCTYPE html>

<header>{title_chane_password}</header>


<div id="profile_edit_view">
    
    <div class="img_with_loader">
        <img src="{rooturl}/img/default_user.png" class="user_profile_image" width="200" />
        <i class="fa fa-spinner fa-spin fa-4x" style="display:none"></i>
    </div>

        
    <div id="profile_edit_profliedata">

        <div class="formrow">
            <label>{change_password_new}</label>
            <input type="password" name="new_password" value="" />
        </div>
        
        <div class="formrow topline">
            <label>{change_password_confirm}</label>
            <input type="password" name="confirm_password" value="" />
        </div>
        
        <div class="button_container">
            <a href="javascript:void(0)" class="button red">{cancel}</a>
            <a href="javascript:void(0)" class="button" id="btn_save_profile">{general_change}</a>
        </div>
    </div>
    
    <br style="clear: both" />
</div>
