<?php

/*
works with ubuntu 14.04 with following setup

add-apt-repository ppa:mc3man/trusty-media
apt-get update
apt-get install ffmpeg gstreamer0.10-ffmpeg
apt-get install frei0r-plugins

add-apt-repository --remove ppa:mc3man/trusty-media

*/
    
    $ffmpegPath = "/usr/bin/ffmpeg";
    
    function err($message){
        echo $message;
        die();
    }
    
    function RandomString()
    {
        $characters = ’0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ’;
        $randstring = '';
        for ($i = 0; $i < 10; $i++) {
            $randstring .= $characters[rand(0, strlen($characters))];
        }
        return $randstring;
    }
    
    $workingDir = __DIR__ . "/tmp";
    
    $videoFileName = RandomString();
    $audioFileName = RandomString();
    
    $videoFileOrigName = $_FILES['audioFile']['name'];
    $audioFileOrigName = $_FILES['videoFile']['name'];
    
    $videoFileSplited = explode(".", $videoFileOrigName);
    $audioFileSplited = explode(".", $audioFileOrigName);

    if(count($videoFileSplited) < 2 || count($audioFileSplited) < 2){
        err('Invalid File Name');
    }
    
    $videoExt = $videoFileSplited[1];
    $audioExt = $audioFileSplited[1];
    
    $videoTmpPath = $workingDir . "/" . RandomString() . "." . $videoExt;
    $audioTmpPath = $workingDir . "/" . RandomString() . "." . $audioExt;
    
    if(move_uploaded_file($_FILES['audioFile']['tmp_name'], $videoTmpPath)) {

    } else{
        err("There was an error uploading the file, please try again!");
    }
    
    if(move_uploaded_file($_FILES['videoFile']['tmp_name'], $audioTmpPath)) {

    } else{
        err("There was an error uploading the file, please try again!");
    }
    
    $encodedVideoPath =  $workingDir . "/" . RandomString() . ".mp4";
    
    system("{$ffmpegPath} -i {$audioTmpPath} -i {$videoTmpPath} -strict -2 -shortest {$encodedVideoPath}");
    
    if(file_exists($encodedVideoPath) && filesize($encodedVideoPath) > 0){
        
        $file = file_get_contents($encodedVideoPath);
        print json_encode(array(
            'code' => 2000,
            'data' => base64_encode($file)
        ));
        
    }else{
        err("There was an error uploading the file, please try again!");
    }
        
        
    
    
    