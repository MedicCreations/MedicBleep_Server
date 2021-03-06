<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use \Imagine\Imagick\Imagine;
use \Imagine\Image\Box;
use \Imagine\Image\Point;
use \Imagine\Image\ImageInterface;

class BaseController implements ControllerProviderInterface {
	
	var $app;
	var $lang;
	var $page='';
	var $user;
	
	public function connect(Application $app) {
	    $this->app = $app;
	    $this->lang = $this->app['getLang']();
	}
	
    public function render($templateName,$params){

        $params['APP_TITLE'] = APP_TITLE;
        $params['ADMIN_ROOT_URL'] = ADMIN_ROOT_URL;
        $params['ROOT_URL'] = ROOT_URL;
        $params['lang'] = $this->lang;
        $params['page'] = $this->page;
        $params['FILE_DOWNLOAD_URL'] = FILE_DOWNLOAD_URL;
        $params['user'] = $this->user;
        $params['sys_lang'] = LANG;
        $params['INVOICE_STATE_SENT'] = INVOICE_STATE_SENT;
        $params['INVOICE_STATE_PAID'] = INVOICE_STATE_PAID;
        $params['INVOICE_STATE_STALLED'] = INVOICE_STATE_STALLED;


        if($this->app['session']->has('infomessage')){
            
            $params['infomessage'] = $this->app['session']->get('infomessage');
            $this->app['session']->remove('infomessage');
            
        }
        
        if($this->app['session']->has('errormessage')){
            
            $params['errormessage'] = $this->app['session']->get('errormessage');
            $this->app['session']->remove('errormessage');
            
        }
        
        return $this->app['twig']->render($templateName,$params);
            
    }
    
    public function checkLoginUser(){
        
        if($this->app['session']->has('loginuser')){
            $this->user = $this->app['session']->get('loginuser');
            return true;
        }else{
            return false;
        }
        
    }
    
	function processPicture($pictureFile){
    	
    	$tmpDir = ROOT_DIR . "/tmp";
    	$origFileName = time() . $this->randomString();
    	$thumbFileName = time() . $this->randomString();
    	
    	$originalFilePath = $tmpDir . "/" . $origFileName;
    	$thumbFilePath = $tmpDir . "/" . $thumbFileName;
    	
    	$pictureFile->move($tmpDir,$origFileName);
    	
    	$imagine = new Imagine();
    	$originalImage =  $imagine->open($tmpDir . "/" . $origFileName);
    	$originalImage->save($originalFilePath,array('format'=>'jpg'));
    	
        $thumbnailImage = $this->resizeToFit(THUMB_SIZE,THUMB_SIZE,$tmpDir . "/" . $origFileName);
        $thumbnailImage->save($thumbFilePath,array('format'=>'jpg'));

    	$this->encryptFileAndSave($originalFilePath);
    	$this->encryptFileAndSave($thumbFilePath);
    	
        $originalFileId = $this->uploadFile($tmpDir . "/" . $origFileName);
        $thumbnailFileId = $this->uploadFile($tmpDir . "/" . $thumbFileName);

        if(!empty($originalFileId) && !empty($thumbnailFileId)){
            return array($originalFileId,$thumbnailFileId);
        }else{
            return null;
        }
        
	}
	
    function resizeToFit( $targetWidth, $targetHeight, $sourceFilename )
    {
        // Box is Imagine Box instance
        // Point is Imagine Point instance
        $imagine = new Imagine();
        
        $target = new Box($targetWidth, $targetHeight );
        $originalImage = $imagine->open( $sourceFilename );
        $orgSize = $originalImage->getSize();
        
        if ($orgSize->getWidth() > $orgSize->getHeight()) {
            // Landscaped.. We need to crop image by horizontally
            $w = $orgSize->getWidth() * ( $target->getHeight() / $orgSize->getHeight() );
            $h =  $target->getHeight();
            $cropBy = new Point( ( max ( $w - $target->getWidth(), 0 ) ) / 2, 0);
        } else {
            // Portrait..
            $w = $target->getWidth(); // Use target box's width and crop vertically
            $h = $orgSize->getHeight() * ( $target->getWidth() / $orgSize->getWidth() );
            $cropBy = new Point( 0, ( max( $h - $target->getHeight() , 0 ) ) / 2);
        }
        
        $tempBox = new Box($w, $h);
        $img = $originalImage->thumbnail($tempBox, ImageInterface::THUMBNAIL_OUTBOUND);
 
        return $img->crop($cropBy, $target);
    }

	function uploadFile($fictureFileName){


	    $fileEntity = $fictureFileName;
	    $file_contents = file_get_contents($fileEntity); 
        
        $multipartBoundary = '--------------------------'.microtime(true);
        $header = 'Content-Type: multipart/form-data; boundary='.$multipartBoundary;
        $formField = 'file';
        
        $content =  "--".$multipartBoundary."\r\n".
                    "Content-Disposition: form-data; name=\"".$formField."\"; filename=\"".basename('tmpname')."\"\r\n".
                    "Content-Type: application/zip\r\n\r\n".
                    $file_contents."\r\n";
        
        // add some POST fields to the request too: $_POST['foo'] = 'bar'
        $content .= "--".$multipartBoundary."\r\n".
                    "Content-Disposition: form-data; name=\"foo\"\r\n\r\n".
                    "bar\r\n";
        
        // signal end of request (note the trailing "--")
        $content .= "--".$multipartBoundary."--\r\n";
	    
        $context = stream_context_create(array(
            'http' => array(
                  'method' => 'POST',
                  'header' => $header,
                  'content' => $content,
            )
        ));
        
        $response = file_get_contents(API_URL . '/file/upload', false, $context);
        
        $response = json_decode($response,true);
        
        if(!empty($response['file_id'])){
            return $response['file_id'];
        }

        return '';    	
	}
	
	public function randomString($min = 5, $max = 8)
	{
		$length = rand($min, $max);
		$string = '';
		$index = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for ($i = 0; $i < $length; $i++) {
			$string .= $index[rand(0, strlen($index) - 1)];
		}
		return $string;
	}
	
	public function setInfoMessage($message){
    	$this->app['session']->set('infomessage',$message);
	}
	
	public function setErrorMessage($message){
    	$this->app['session']->set('errormessage',$message);
	}
	
	public function encryptFileAndSave($filePath){
        
        /*
        // encrypt original file
        $fp = fopen($filePath, 'r');
        
        $byteArray = "";
        if ($fp) {
            while (false !== ($char = fgetc($fp))) {
                $byteArray .= $char;
            }
        }
        */
        
        //fclose($fp);
        
        
        $fileBin = file_get_contents($filePath);
        
        $cryptor = new \RNCryptor\Encryptor();
        $encryptedBinaryData = $cryptor->encrypt($fileBin, AES_PASSWORD);
        
        $encryptedHexData = bin2hex($encryptedBinaryData);
        
        file_put_contents($filePath, $encryptedHexData);
        
	}
	
	public function sendEmail($toAddress,$subject,$body){
		
		if(EMAIL_SEND_METHOD == 1){
    		
            $transport = \Swift_SmtpTransport::newInstance();
    
            $message = \Swift_Message::newInstance()
                ->setSubject($subject)
                ->setFrom(array(EMAIL_SENDER_EMAIL => EMAIL_SENDER_NAME))
                ->setTo($toAddress)
                ->setBody($body);
            
            $mailer = \Swift_Mailer::newInstance($transport);
    		
    		$mailer->send($message);
    		
		}

		if(EMAIL_SEND_METHOD == 2){
		
            $transport = \Swift_SmtpTransport::newInstance('smtp.googlemail.com', 465, 'ssl')
                ->setUsername(GMAIL_USER)
                ->setPassword(GMAIL_PASSWORD);
    
            $message = \Swift_Message::newInstance()
                ->setSubject($subject)
                ->setFrom(GMAIL_USER)
                ->setTo($toAddress)
                ->setBody($body);
            
            $mailer = \Swift_Mailer::newInstance($transport);
            
            $mailer->send($message);
            
		}

		if(EMAIL_SEND_METHOD == 3){

            $url = 'http://local.clover-studio.com/spikaent.email/sender.php';
            
            $fields = array(
            		'email' => urlencode($toAddress),
            		'body' => urlencode(urlencode($body)),
            		'subject' => urlencode(urlencode($subject))
            );
    
            $fields_string = '';
            
            //url-ify the data for the POST
            foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
            rtrim($fields_string, '&');
            
            //open connection
            $ch = curl_init();
            
            //set the url, number of POST vars, POST data
            curl_setopt($ch,CURLOPT_URL, $url);
            curl_setopt($ch,CURLOPT_POST, count($fields));
            curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
            
            //execute post
            $result = curl_exec($ch);
            
            //close connection
            curl_close($ch);

		}

	            
	}
	
    function makePostRequest($url,$fields,$headers = array()){
        
        $fields_string = "";
        
        //url-ify the data for the POST
        foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
        rtrim($fields_string, '&');


        $ch = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        
        //set the url, number of POST vars, POST data
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_POST, count($fields));
        curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);


        //execute post
        $result = curl_exec($ch);
        
        //close connection
        curl_close($ch);
        
        return $result;

    }

    function makeGetRequest($url,$headers){

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        
        //set the url, number of POST vars, POST data
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        //execute post
        $result = curl_exec($ch);
        
        //close connection
        curl_close($ch);
        
        return $result;

    }



	public function sendMessageToUserAsAdmin($organizationId,$toUserId,$message){
    
        // find admin user
        $user = $this->app['db']->fetchAssoc("
            select * from user_mst where id in (
                select master_user_id
                from user 
                where user.is_admin = 1 
                and user.organization_id = ?
            )",array($organizationId));
            
        $userTo = $this->app['db']->fetchAssoc("select * from user where id = ?",array($toUserId));
                
        if(empty($userTo['id']) || empty($user['id']))
            return false;
            
        $username = $user['username'];
        $password = $user['password'];
        
    	$response = $this->makePostRequest(API_URL . '/user/login',array(
    	   'username' => $username,
           'password' => $password,
           'organization_id' => $organizationId
    	));
        
        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['token']))
            return false;
            
        $token = $responseAry['token'];
        
        $cryptor = new \RNCryptor\Encryptor();
		$cryptedMessage = bin2hex(base64_decode($cryptor->encrypt($message, AES_PASSWORD)));
        $cryptedMessage = mb_strtoupper($cryptedMessage);
        
        // get chat id
    	$response = $this->makePostRequest(API_URL . '/user/chat/start',array(
    	   'user_id' => $toUserId,
           'firstname' => $userTo['firstname'],
           'lastname' => $userTo['lastname']
    	),array(
    	    "token: {$token}"
    	));

        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['chat_id']))
            return false;
        
        $chatId = $responseAry['chat_id'];
        
        // send message
    	$response = $this->makePostRequest(API_URL . '/message/send',array(
    	   'user_id' => $user['id'],
           'chat_id' => $chatId,
           'type' => 1,
           'text' => $cryptedMessage
    	),array(
    	    "token: {$token}"
    	));

        return true;
	}
	
	public function sendMessageToGroupAsAdmin($organizationId,$toGroupId,$message){
    
        // find admin user
        $user = $this->app['db']->fetchAssoc("
            select * from user_mst where id in (
                select master_user_id
                from user 
                where user.is_admin = 1 
                and user.organization_id = ?
            )",array($organizationId));
            
        $groupTo = $this->app['db']->fetchAssoc("select * from groups where id = ?",array($toGroupId));
        
        if(empty($groupTo['id']) || empty($groupTo['id']))
            return false;
            
        $username = $user['username'];
        $password = $user['password'];
        
    	$response = $this->makePostRequest(API_URL . '/user/login',array(
    	   'username' => $username,
           'password' => $password,
           'organization_id' => $organizationId
    	));
        
        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['token']))
            return false;
            
        $token = $responseAry['token'];
        
        $cryptor = new \RNCryptor\Encryptor();
		$cryptedMessage = bin2hex(base64_decode($cryptor->encrypt($message, AES_PASSWORD)));
        $cryptedMessage = mb_strtoupper($cryptedMessage);
        
        // get chat id
    	$response = $this->makePostRequest(API_URL . '/groups/chat/start',array(
           'group_id' => $toGroupId,
           'groupname' => $groupTo['name']
    	),array(
    	    "token: {$token}"
    	));

        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['chat_id']))
            return false;
        
        $chatId = $responseAry['chat_id'];
        
        // send message
    	$response = $this->makePostRequest(API_URL . '/message/send',array(
    	   'user_id' => $user['id'],
           'chat_id' => $chatId,
           'type' => 1,
           'text' => $cryptedMessage
    	),array(
    	    "token: {$token}"
    	));
				
        return true;
	}
	
	public function sendMessageToRoomAsAdmin($organizationId,$roomId,$message){
    
        // find admin user
        $user = $this->app['db']->fetchAssoc("
            select * from user_mst where id in (
                select master_user_id
                from user 
                where user.is_admin = 1 
                and user.organization_id = ?
            )",array($organizationId));
            
        $username = $user['username'];
        $password = $user['password'];
        
    	$response = $this->makePostRequest(API_URL . '/user/login',array(
    	   'username' => $username,
           'password' => $password,
           'organization_id' => $organizationId
    	));
        
        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['token']))
            return false;
            
        $token = $responseAry['token'];
        
        $cryptor = new \RNCryptor\Encryptor();
		$cryptedMessage = bin2hex(base64_decode($cryptor->encrypt($message, AES_PASSWORD)));
        $cryptedMessage = mb_strtoupper($cryptedMessage);
        
        
        // send message
    	$response = $this->makePostRequest(API_URL . '/message/send',array(
    	   'user_id' => $user['id'],
           'chat_id' => $roomId,
           'type' => 1,
           'text' => $cryptedMessage
    	),array(
    	    "token: {$token}"
    	));
				
        return true;
	}
	
	public function sendMessage($user,$chatId,$text,$messageType){
    	
    	$response = $this->makePostRequest(API_URL . '/user/login',array(
    	   'username' => $user['username'],
           'password' => $user['password']
    	));
    	
    	$responseAry = json_decode($response,true);
    	
    	if(empty($responseAry['token'])){
        	return false;
    	}
        
        $token = $responseAry['token'];

        $cryptor = new \RNCryptor\Encryptor();
		$cryptedMessage = bin2hex(base64_decode($cryptor->encrypt($text, AES_PASSWORD)));
        $cryptedMessage = mb_strtoupper($cryptedMessage);
        
        // メッセージの送信
    	$response = $this->makePostRequest(API_URL . '/message/send',array(
    	   'user_id' => $user['id'],
           'chat_id' => $chatId,
           'type' => $messageType,
           'text' => $cryptedMessage
    	),array(
    	    "token: {$token}"
    	));

        $responseAry = json_decode($response,true);

    	if(empty($responseAry['id'])){
        	return false;
    	}
    	
        return $responseAry['id'];
    	
	}

}