var SPIKA_ExtraMessageBoxesView = Backbone.View.extend({
    
    isOpened : false,
    chatId: 0,
    localMediaStream: null,
    postBoxView: null,
    videoRecordingStream: null,
    audioRecordingStream: null,
    audioVideoRecorder:null,
    audioVideoRecorderAudio:null,
    isRecording: false,
    videoCallView: null,
    initialize: function(options) {
        
        var self = this;
        
        this.template = options.template;

        Backbone.on(EVENT_CLICK_ANYWHARE, function() {

            if(self.isOpened)
                self.hide();
        });

        Backbone.on(EVENT_OPEN_VOICE_MESSAGE, function() {

            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_takeaudio .alert_bottom_ok').css('display','none');
            self.startRecordingAudio();


        });

        Backbone.on(EVENT_OPEN_VIDEO_MESSAGE, function() {

            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_takevideo .alert_bottom_ok').css('display','none');
            self.startRecordingVideo();

        });

    },

    render: function() {
        
        $(this.el).html(U.simpleLocalizationFilter(this.template,LANG));
        
        var self = this;
        
        _.debounce(function() {
            self.onload();
        }, 100)();
              
        return this;
    },
    
    onload : function(){
        
        var self = this;
        
        $$('header .userprofile').click(function(){
            self.showContextMenu(); 
        });
        
        $$('#extra_message_box li').mouseover(function(){
            $(this).addClass('selected');
        });
        
        $$('#extra_message_box li').mouseleave(function(){
            $(this).removeClass('selected');
        });
        
        $$('#extra_message_box').mouseleave(function(){
            self.hide();
        });
        
        $$('#extramessage_btn_file').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            $$("#btn_dummy_file_upload").val('');
            $$("#btn_dummy_file_upload").click();
            
        });

        // browser compatibility
        if (bowser.chrome || bowser.firefox || bowser.android) {
            
            
            
        }else{
            
            $$('#extramessage_btn_picture').css('display','none');
            $$('#extramessage_btn_video').css('display','none');
            $$('#extramessage_btn_audio').css('display','none');
            
        }
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Source Code //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        $$('#extramessage_btn_code').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_code textarea').val('');
            self.openSourceCodeDialog();
            
        });

        $$('#extramessage_dialog_view_code .alertRightButton').click(function(){
/*
            
            var text = $$('#extramessage_dialog_view_code textarea').val();
            
            var encryptedHex = EncryptManager.encryptText(text);
            
            var data = {
                    chat_id:self.chatId,
                    type:MESSAGE_TYPE_TEXT,
                    text:encryptedHex,
                    file_id:'',
                    parent_id:self.postBoxView.replyMeessageId,
                    attributes:{
                        textType:'code'
                    }
            };

            self.postBoxView.sendTextMessage(data);
*/
            $$('#extramessage_dialog_view_code').fadeOut();
            
        });
        
        $$('#extramessage_dialog_view_code .alertLeftButton').click(function(){
            
            $$('#extramessage_dialog_view_code').fadeOut();
            
        });

		$$('#extramessage_dialog_view_code .alert_bottom_cancel').click(function(){
            
            $$('#extramessage_dialog_view_code').fadeOut();
            
        });
        
        $$('#extramessage_btn_video_call').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            if(!SPIKA_VideoCallManager.canUseWebRTC()){
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_nowebrtc);    
                return;
            }
            
            self.openCallDialog(true,true);
            
        });

        $$('#extramessage_btn_voice_call').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            if(!SPIKA_VideoCallManager.canUseWebRTC()){
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_nowebrtc);    
                return;
            }
            
            self.openCallDialog(false,true);
            
        });


		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Map events //////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
        $$('#extramessage_btn_location').click(function(){
	        
	        $$('#extramessage_dialog_view_map').fadeIn();
		    $$('#extramessage_dialog_view_mapView').css('width','100%');
		    $$('#extramessage_dialog_view_mapView').css('height','508px');		    
		    $$('#extramessage_dialog_view_map').css('display','block');
	        
			if(navigator.geolocation){
		    	var location = navigator.geolocation.getCurrentPosition(self.showLocation);
	    	}else{
		    	alert("Browser doesn't support geolocation ");
	    	}
	    	
        });

		$$('#extramessage_dialog_view_map .alertRightButton').click(function(){
			
			var point = SPIKA_LocationManager.getPoint();
			
			$$('#extramessage_dialog_view_map').fadeOut();
			//put it here
			$$('#extramessage_dialog_view_mapView').empty();
            
            var data = {
                    chat_id:self.chatId,
                    type:MESSAGE_TYPE_LOCATION,
                    longitude:EncryptManager.encryptText(point.lon),
                    latitude:EncryptManager.encryptText(point.lat)
            };
			
			apiClient.sendMessage(data,function(e){
				
			},function(e){
				
			});
			
//             self.postBoxView.sendMessage(data,MESSAGE_TYPE_LOCATION);
			
		});

		$$('#extramessage_dialog_view_map .alertLeftButton').click(function(){
			$$('#extramessage_dialog_view_map').fadeOut();
			//put it here
			$$('#extramessage_dialog_view_mapView').empty();
			
		});
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
        // Picture events ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        $$('#extramessage_btn_picture').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            self.startTakingPicture();
            
        });
        
        // take picture
        $$('#extramessage_dialog_view_takepicture .alertRightButton').click(function(){
            

            Webcam.snap( function(data_uri, canvas, context) {
                
                Webcam.reset();
                
                if(_.isNull(canvas))
                    return;
                    
                var ctx = canvas.getContext('2d');
                
                setTimeout(function() {
                
                    //canvas.width = WEBCAMPIC_HEIGHT;
                    //canvas.height = WEBCAMPIC_HEIGHT;
    
                    var dataURL = canvas.toDataURL('image/jpeg');
                    var blob = dataURItoBlob(dataURL);
                    blob.name = 'picture.jpeg';
    
                    var files = [];
                    files.push(blob);
                    Backbone.trigger(EVENT_FILE_DROP,files);
                    
                    $$('#extramessage_dialog_view_takepicture').fadeOut();
                    
                }, 100);


            });
            
        });
        
        $$('#extramessage_dialog_view_takepicture .alertLeftButton').click(function(){
            
            Webcam.reset();
            $$('#extramessage_dialog_view_takepicture').fadeOut();
            
        });
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Video events //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        $$('#extramessage_dialog_view_takevideo video').on('play',function(){
            $$('#extramessage_dialog_view_takevideo audio')[0].play();
        });

        $$('#extramessage_btn_video').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_takevideo .alertRightButton').css('display','none');
            self.startRecordingVideo();
            
        });
                
        $$('#extramessage_dialog_view_takevideo .record').click(function(){
            
            if(self.isRecording == false){
                
                self.isRecording = true;
                
                var videoPreview = $$('#extramessage_dialog_view_takevideo video')[0];
                videoPreview.src = URL.createObjectURL(self.videoRecordingStream);
                videoPreview.muted = true;
                videoPreview.controls = true;
                videoPreview.play();
    
                var videoPreview = $$('#extramessage_dialog_view_takevideo video')[0];
    
                self.audioVideoRecorder = window.RecordRTC(self.videoRecordingStream, {
                    type: 'video' // don't forget this; otherwise you'll get video/webm instead of audio/ogg
                });
                
                self.audioVideoRecorder.startRecording();
                            
                self.audioVideoRecorderAudio = window.RecordRTC(self.audioRecordingStream, {
                    type: 'audio' // don't forget this; otherwise you'll get video/webm instead of audio/ogg
                });
                
                self.audioVideoRecorderAudio.startRecording();
                            
                $$('#extramessage_dialog_view_takevideo .record').addClass('red');
                $$('#extramessage_dialog_view_takevideo .record').text(LANG.general_stop);
                $$('.recording').css('display','block');

            } else {
                
                self.isRecording = false;
                $$('#extramessage_dialog_view_takevideo .alertRightButton').css('display','inline-block');
                
                $$('.recording').css('display','none');
                $$('#extramessage_dialog_view_takevideo .record').removeClass('red');
                $$('#extramessage_dialog_view_takevideo .record').text(LANG.general_record);

                var videoPreview = $$('#extramessage_dialog_view_takevideo video')[0];
                var audioPreview = $$('#extramessage_dialog_view_takevideo audio')[0];

                self.audioVideoRecorder.stopRecording(function(url1) {

                    self.audioVideoRecorderAudio.stopRecording(function(url2) {
                        
                        audioPreview.src = url2;
                        audioPreview.muted = false;
                        //audioPreview.play();
                        
                        videoPreview.src = url1;
                        videoPreview.muted = true;
                        videoPreview.play();
                        
                        videoPreview.onended = function() {
                            videoPreview.pause();
                            
                            // dirty workaround for: "firefox seems unable to playback"
                            videoPreview.src = URL.createObjectURL(self.audioVideoRecorder.getBlob());
                            
                        };
                        
                    });
                    
                });
                
            }
            
        });
                
        $$('#extramessage_dialog_view_takevideo .alertRightButton').click(function(){
            
            try { self.videoRecordingStream.stop(); } catch (e) {;}
            try { self.audioRecordingStream.stop(); } catch (e) {;}
            $$('#extramessage_dialog_view_takevideo').fadeOut();
            
            var blobVideo = self.audioVideoRecorder.getBlob();
            var blobAudio = self.audioVideoRecorderAudio.getBlob();

            SPIKA_ProgressManager.show();
            SPIKA_ProgressManager.setTitle(LANG.general_uploading);
            SPIKA_ProgressManager.setText(LANG.encoding_video);
            SPIKA_ProgressManager.setProgress(0);
            
            // upload big image
            apiClient.mixAudioVideo(blobVideo,blobAudio,function(data){
                
                try{
                
                    var blob = U.base64ToBlob(data.data,'video/mp4');
                    blob.name = 'video.mp4';
    
                    var files = [];
                    files.push(blob);
                    Backbone.trigger(EVENT_FILE_DROP,files);
                
                } catch(ex){
                    
                    U.l(ex);
                    
                    SPIKA_ProgressManager.hide();
                    SPIKA_AlertManager.show(LANG.general_errortitle,LANG.videoupload_error);
                
                }

            },function(data){
                
                SPIKA_ProgressManager.hide();
                SPIKA_AlertManager.show(LANG.general_errortitle,data);
                
            },function(progress){
                
                SPIKA_ProgressManager.setProgress(progress);
                
            }); 

        });
        
        $$('#extramessage_dialog_view_takevideo .alertLeftButton').click(function(){
            
            try { self.videoRecordingStream.stop(); } catch (e) {;}
            try { self.audioRecordingStream.stop(); } catch (e) {;}

            $$('#extramessage_dialog_view_takevideo').fadeOut();
            
        });
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Audio events //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                
        $$('#extramessage_btn_audio').click(function(){
            
            if(self.chatId == 0){
                return;
            }
            
            $$('#extramessage_dialog_view_takeaudio .alertRightButton').css('display','none');
            $$('#extramessage_dialog_view_takeaudio .alert_box').css('height','120px');
            $$('#extramessage_dialog_view_takeaudio .alert_box').css('top','35%');
            self.startRecordingAudio();
            
        });

        $$('#extramessage_dialog_view_takeaudio .record').click(function(){
                     
            if(self.isRecording == false){
                
                self.isRecording = true;

                var audioPreview = $$('#extramessage_dialog_view_takeaudio audio')[0];
                
                audioPreview.src = URL.createObjectURL(self.audioRecordingStream);
                audioPreview.muted = true;
                audioPreview.controls = true;
                audioPreview.play();
    
                self.audioVideoRecorder = window.RecordRTC(self.audioRecordingStream, {
                    type: 'audio' // don't forget this; otherwise you'll get video/webm instead of audio/ogg
                });
                
                self.audioVideoRecorder.startRecording();
                            
                $$('#extramessage_dialog_view_takeaudio .record').addClass('red');
                $$('#extramessage_dialog_view_takeaudio .record').text(LANG.general_stop);
                $$('.recording').css('display','block');
                
            } else {
                
                self.isRecording = false;
                
                $$('#extramessage_dialog_view_takeaudio .record').removeClass('red');
                $$('#extramessage_dialog_view_takeaudio .record').text(LANG.general_record);
                $$('.recording').css('display','none');
    
                var audioPreview = $$('#extramessage_dialog_view_takeaudio audio')[0];
                $$('#extramessage_dialog_view_takeaudio .alertRightButton').css('display','inline-block');

                self.audioVideoRecorder.stopRecording(function(url) {
                    audioPreview.src = url;
                    audioPreview.muted = false;
                    audioPreview.play();
                    
                    audioPreview.onended = function() {
                        audioPreview.pause();
                        
                        // dirty workaround for: "firefox seems unable to playback"
                        audioPreview.src = URL.createObjectURL(self.audioVideoRecorder.getBlob());
                    };
                });

                
            }

        });
                
        $$('#extramessage_dialog_view_takeaudio .alertRightButton').click(function(){
            
            var blob = self.audioVideoRecorder.getBlob();
            blob.name = 'audio.wav';
            
            var files = [];
            files.push(blob);
            Backbone.trigger(EVENT_FILE_DROP,files);
            
            try { self.audioRecordingStream.stop(); } catch (e) {;}
            $$('#extramessage_dialog_view_takeaudio').fadeOut();
            
        });
        
        $$('#extramessage_dialog_view_takeaudio .alertLeftButton').click(function(){
            
            try { self.audioRecordingStream.stop(); } catch (e) {;}
            $$('#extramessage_dialog_view_takeaudio').fadeOut();
            
        });
        
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Calling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        $$('#extramessage_dialog_view_conference .alert_bottom_decline').click(function(){
            
            SPIKA_VideoCallManager.declineCall();
            $$('#extramessage_dialog_view_conference').fadeOut();
            
        });

        $$('#extramessage_dialog_view_conference .alert_bottom_accept').click(function(){
            
            $$('#extramessage_dialog_view_conference .call_buttons').css('display','block');
            $$('#extramessage_dialog_view_conference .call_received_buttons').css('display','none');
            
            require([
                'app/views/mainView/videoCallView',
                'thirdparty/text!templates/mainView/videoCallView.tpl'
            ], function (videoCallView,VideoCallViewTemplate) {
                
                self.videoCallView = new SPIKA_VideoCallView({
                    template: VideoCallViewTemplate,
                    partnerUserId: SPIKA_VideoCallManager.currentPartnerUserId
                });
                
                $$('#extramessage_dialog_view_conference .alert_content').html(self.videoCallView.render().el);

            });
                    
            
        });

 
        $$('#extramessage_dialog_view_conference .alert_bottom_cancel').click(function(){
            
            if(!_.isNull(self.videoCallView)){
                self.videoCallView.stop();
            }

            $$('#extramessage_dialog_view_conference').fadeOut();
            
        });
            
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Sticker ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                
        $$('#extramessage_btn_sticker').click(function(){
            
            mainView.chatView.stickerView.show();
            
        });
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
    },
    
    show : function(){
        
        var self = this;
        
        if(self.isOpened)
            return;
            
        _.debounce(function() {
            $$('#extra_message_box').css('display','block');
            self.isOpened = true;
        }, 100)();
  
    },
    
    hide : function(){
        
        $$('#extra_message_box').css('display','none');
        this.isOpened = false;
        
    },
    
    stopPlayingVideo:function(selector){
        
        if (this.localMediaStream) {
            this.localMediaStream.getVideoTracks[0].close();
        }
                
    },
    startTakingPicture:function(){
        
        var self = this;

        $$('#extramessage_dialog_view_takepicture').fadeIn(function(){
            Webcam.set({
	           width: videoSelfie.width,
	           height: videoSelfie.height
            });            
            Webcam.attach( '#extramessage_dialog_view_takepicture .video_preview' );

        });


    },
    
    openSourceCodeDialog:function(){
        
        $$('#extramessage_dialog_view_code').fadeIn(function(){
            
            

        });
        
    },

    startRecordingVideo:function(){
        
        var self = this;
        $$('#extramessage_dialog_view_takevideo audio')[0].src = null;
        $$('#extramessage_dialog_view_takevideo video')[0].src = null;

        $$('#extramessage_dialog_view_takevideo .device-ready').css('display','block');
        $$('#extramessage_dialog_view_takevideo .record_buttons').css('display','none');
        
        $$('#extramessage_dialog_view_takevideo').fadeIn(function(){
            
            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            
            navigator.getUserMedia({ audio: false, video: true }, function(stream) {
                
                var videoPreview = $$('#extramessage_dialog_view_takevideo video')[0];
                
                videoPreview.src = URL.createObjectURL(stream);
                videoPreview.muted = true;
                videoPreview.controls = true;
                videoPreview.play();
				
                self.videoRecordingStream = stream;

                navigator.getUserMedia({ audio: true, video: false }, function(stream) {
                    
                    self.audioRecordingStream = stream;
                    
                    $$('#extramessage_dialog_view_takevideo .device-ready').css('display','none');
                    $$('#extramessage_dialog_view_takevideo .record_buttons').css('display','block');

                }, function(error) { 
                    console.error(error); 
                    SPIKA_AlertManager.show(LANG.general_errortitle,LANG.videoupload_mic_error);
                });

            }, function(error) { 
                console.error(error);
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.videoupload_webcam_error);
                
            });

            
        });

    },

    startRecordingAudio:function(){
        
        var self = this;

        $$('#extramessage_dialog_view_takeaudio .device-ready').css('display','block');
        $$('#extramessage_dialog_view_takeaudio .record_buttons').css('display','none');


        $$('#extramessage_dialog_view_takeaudio').fadeIn(function(){
            
            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            
            navigator.getUserMedia({ audio: true, video: false }, function(stream) {
                
                var audioPreview = $$('#extramessage_dialog_view_takeaudio audio')[0];
                
                audioPreview.src = URL.createObjectURL(stream);
                audioPreview.muted = true;
                audioPreview.controls = true;
                audioPreview.play();

                self.audioRecordingStream = stream;
                
                // hack to show audio controll..
                $$('#extramessage_dialog_view_takeaudio audio').css('width','100%');

                $$('#extramessage_dialog_view_takeaudio .device-ready').css('display','none');
                $$('#extramessage_dialog_view_takeaudio .record_buttons').css('display','block');

            }, function(error) { 
                console.error(error);
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.videoupload_mic_error);
            });

        });

    },
    
	    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
	    // Calling ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
    openCallDialog : function(useVideo,useAudio){
        
        // check it is private chat and there is partner.
        var chatData = mainView.chatView.chatData;
        var self = this;
        
        if(chatData.get('type') != 1){
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_notprivate);
            return;
        }

        var chatId = chatData.get('chat_id');
        var partnerUserId = 0;
        var myUserId = SPIKA_UserManager.getUser().get('id');
        
        // get users
        apiClient.getChatMembers(chatId,function(data){

            var chatMembers = userFactory.createCollectionByAPIResponse(data)
            
            _.each(chatMembers.models,function(userData){
                
                var userId = userData.get('id');
                
                if(userId != myUserId)
                    partnerUserId = userId
                
            });
            
            if(partnerUserId != 0){
			
				Backbone.trigger(EVENT_CALL_INITIATE,{
					userId:partnerUserId,
					useVideo:useVideo,
					useAudio:useAudio
				});
				                
            }else{
                
                SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_no_partner);

            }
            
        },function(data){
        
            SPIKA_AlertManager.show(LANG.general_errortitle,LANG.call_error_general);
            
        });
        
    },
    
    showLocation:function(position){

		SPIKA_LocationManager.showMap('extramessage_dialog_view_mapView',false,position);

    }

});