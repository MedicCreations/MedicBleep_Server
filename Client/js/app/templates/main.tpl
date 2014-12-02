<header>
    <span id="maintitle">{title_initial}</span>
    <div class="userprofile">
        <img class="profile_pic" src="{rooturl}/img/default_user.png" />
        <span></span>
        <i class="fa fa-angle-down"></i>
    </div>
</header>

<ul id="user_menu">
    <li>
        <i class="fa fa-pencil-square-o"></i> <a href="#editprofile">{edit_profile}</a>
    </li>
     <li>
        <i class="fa fa-key"></i> <a href="#changepassword">{change_password}</a>
    </li>

    <li>
       <i class="fa fa-sign-out"></i> <a href="#logout">{logout}</a>
    </li>

    <li>
       <i class="fa fa-times"></i> <a href="javascript:mainView.hideContextMenu()">{close}</a>
    </li>

</ul>


<nav id="left_sidebar">
</nav>

<div id="main_container">
</div>

<div id="cached_image" style="display:none">
</div>
