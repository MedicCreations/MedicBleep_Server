
<div id="call_window" style="display:none" >
	
	<div class="partner_video_holder" id="remotevideo_holder">
		<img class="avatar" />
	</div>
	
	<div class="my_video_holder">
		<img class="avatar" />
		<video id="localvideo" class="video" />
	</div>
	
	<div class="footer_buttons">
        <a href="javascript:void(0)" class="button" id="btn_tuggle_video">{mutevideo}</a>
        <a href="javascript:void(0)" class="button" id="btn_tuggle_audio">{muteaudio}</a>
        <a href="javascript:void(0)" class="button" id="btn_call_close">{close}</a>
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
        <a href="javascript:void(0)" class="button" id="btn_call_close">{stop}</a>
        <a href="javascript:void(0)" class="button" id="btn_call_accept">{accept}</a>
        <a href="javascript:void(0)" class="button red" id="btn_call_decline">{decline}</a>
    </div>
    
</div>
