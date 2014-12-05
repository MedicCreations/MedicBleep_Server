
<div id="extra_message_box">
    <ul>
        <li id="extramessage_btn_picture">
            <i class="fa fa-file-image-o"></i><br />
                Picture
        </li>
        
        <li id="extramessage_btn_video">
            <i class="fa fa-file-video-o"></i><br />
                Video
        </li>
        <li  id="extramessage_btn_audio">
            <i class="fa fa-microphone"></i><br />
                Voice
        </li>

        <!--
        <li id="extramessage_btn_image">
            <i class="fa fa-smile-o"></i><br />
                Emoticon
        </li>
        -->
        
        <li id="extramessage_btn_sticker">
            <i class="fa fa-gift"></i><br />
                Sticker
        </li>

        
        
        <li id="extramessage_btn_file">
            <i class="fa fa-file"></i><br />
                File
        </li>
        
        <li id="extramessage_btn_code">
            <i class="fa fa-code"></i><br />
                Code
        </li>
        
        <!--
        <li id="extramessage_btn_voice_call">
            <i class="fa fa-phone"></i><br />
                Voice Call
        </li>
		-->
        
        <li id="extramessage_btn_video_call">
            <i class="fa fa-video-camera"></i><br />
                Video Call
        </li>

    </ul>

	<div class="choose_file" style="display:none">
	    <input id="btn_dummy_file_upload" name="Select File" type="file" />
	    <input id="btn_dummy_picture_upload" type="file" accept="image/*;capture=camera">
    </div>

</div>

<!-- Picture -->
<div class="extramessage_dialog_view" style="display:none" id="extramessage_dialog_view_takepicture">
    <div class="alert_box">
        <div class="alert_title">Take Picture</div>
        
        <div class="alert_content" style="text-align: center"> 
            
            <div class="video_preview" style="width:100%;height:200px"></div>
                        
        </div>
        
        <div class="alert_bottom"> 
            <a href="javascript:void(0)" class="alert_bottom_cancel"> Cancel </a> 
            <a href="javascript:void(0)" class="alert_bottom_ok"> OK </a> 
        </div>
    </div>
</div>

<!-- Video -->
<div class="extramessage_dialog_view" style="display:none" id="extramessage_dialog_view_takevideo">
    <div class="alert_box">
        <div class="alert_title">Recode Video</div>
        
        <div class="alert_content" style="text-align: center"> 
            
            <span class="recording">
                <i class="fa fa-circle-o-notch fa-spin"></i> Recording
            </span>
            
            <video style="width:100%;height:200px"></video>
            <audio style="display:none"></audio>

            <span class="device-ready">Waiting To Devices Ready</span>
            
            <ul class="record_buttons" style="display:none">
                <li class="button record">Record</li>
            </ul>
            
        </div>
        
        <div class="alert_bottom"> 
            <a href="javascript:void(0)" class="alert_bottom_cancel"> Cancel </a> 
            <a href="javascript:void(0)" class="alert_bottom_ok"> Send </a> 
        </div>
        
    </div>
</div>

<!-- Audio -->
<div class="extramessage_dialog_view" style="display:none" id="extramessage_dialog_view_takeaudio">
    <div class="alert_box">
        <div class="alert_title">Recode Audio</div>
        
        <div class="alert_content" style="text-align: center"> 
            
            <span class="recording">
                <i class="fa fa-circle-o-notch fa-spin"></i> Recording
            </span>
            
            <audio></audio>
            
            <span class="device-ready">Waiting To Devices Ready</span>

            <ul class="record_buttons" style="display:none">
                <li class="button record">Record</li>
            </ul>
            
        </div>
        
        <div class="alert_bottom"> 
            <a href="javascript:void(0)" class="alert_bottom_cancel"> Cancel </a> 
            <a href="javascript:void(0)" class="alert_bottom_ok"> Send </a> 
        </div>
        
    </div>
</div>


<!-- Code -->
<div class="extramessage_dialog_view" style="display:none" id="extramessage_dialog_view_code">
    <div class="alert_box">
        <div class="alert_title">Send Source Code</div>
        
        <div class="alert_content" style="text-align: center"> 
            
            <textarea></textarea>
                        
        </div>
        
        <div class="alert_bottom"> 
            <a href="javascript:void(0)" class="alert_bottom_cancel"> Cancel </a> 
            <a href="javascript:void(0)" class="alert_bottom_ok"> OK </a> 
        </div>
        
    </div>
</div>

<!-- Video Chat-->
<div class="extramessage_dialog_view" style="display:none" id="extramessage_dialog_view_conference">
    <div class="alert_box">
        <div class="alert_title">Video Chat</div>
        
        <div class="alert_content" style="text-align: center"> 
                        
        </div>
        
        <div class="alert_bottom"> 
            <div class="call_buttons">
                <a href="javascript:void(0)" class="alert_bottom_cancel"> Finish </a> 
            </div>
            <div class="call_received_buttons">
                <a href="javascript:void(0)" class="alert_bottom_decline"> Decline </a> 
                <a href="javascript:void(0)" class="alert_bottom_accept"> Accept </a> 
            </div>
        </div>
        
    </div>
</div>



