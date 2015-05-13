<!DOCTYPE html>
<div id="call_window" style="display:none" >
	
	<div class="partner_video_holder" id="remotevideo_holder">
		<img class="avatar" />
	</div>
	
	<div class="my_video_holder">
		<img class="avatar" style="display:none"/>
		<video id="localvideo" class="video" />
	</div>
	
	<div class="footer_buttons">
        <a href="javascript:void(0)" id="btn_tuggle_video"><img class="imgbutton" src="{rooturl}/img/call_mute_video_on.png"/></a>
        <a href="javascript:void(0)" id="btn_tuggle_audio"><img class="imgbutton" src="{rooturl}/img/call_mute_audio_on.png"/></a>
        <a href="javascript:void(0)" id="btn_call_close"><img class="imgbutton" src="{rooturl}/img/call_decline.png"/></a>
	</div>
	
</div>

<div id="calling_window" style="display:none">

    <div class="statustext">
        calling...
    </div>
    
    <div class="status">
        <div class="info_from">
            <img class="avatar_from icon1" src="{rooturl}/img/default_user.png"/><br />
            <span>Ken</span>
        </div>
        
        <div>
            <img class="indicator" src="{rooturl}/img/calling.gif"/>    
        </div>
        <div class="info_to">
             <img class="avatar_to icon1" src="{rooturl}/img/default_user.png"/><br />
             <span>Ken</span>
        </div>
    </div>
    
    <br style="clear: both" />
    
    <div class="operations">
        <a href="javascript:void(0)" id="btn_call_close">
            <img class="imgbutton" src="{rooturl}/img/call_decline.png"/>
        </a>
        <a href="javascript:void(0)" id="btn_call_accept_audio">
            <img class="imgbutton" src="{rooturl}/img/voice_call_accept.png"/>
        </a>
        <a href="javascript:void(0)" id="btn_call_accept_video">
            <img class="imgbutton" src="{rooturl}/img/video_call_accept.png"/>
        </a>
        <a href="javascript:void(0)" id="btn_call_decline">
            <img class="imgbutton" src="{rooturl}/img/call_decline.png"/>
        </a>
    </div>
    
</div>
