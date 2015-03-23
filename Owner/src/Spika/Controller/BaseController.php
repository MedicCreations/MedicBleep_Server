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
        $params['OWNER_ROOT_URL'] = OWNER_ROOT_URL;
        $params['ROOT_URL'] = ROOT_URL;
        $params['lang'] = $this->lang;
        $params['page'] = $this->page;
        $params['FILE_DOWNLOAD_URL'] = FILE_DOWNLOAD_URL;
        $params['user'] = $this->user;
        $params['sys_lang'] = LANG;
        
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

	public function setInfoMessage($message){
    	$this->app['session']->set('infomessage',$message);
	}
	
	public function setErrorMessage($message){
    	$this->app['session']->set('errormessage',$message);
	}

	public function sendMessageToUserAsAdmin($toUserId,$message){
    
        // find admin user
        $user = $this->app['db']->fetchAssoc("
            select user_mst.*,user.organization_id 
            	from user_mst 
            	left join user on user.master_user_id = user_mst.id
            	where user.id = ?
            ",array(SUPERUSER_ID));
            
        $userTo = $this->app['db']->fetchAssoc("select * from user where id = ?",array($toUserId));
                
        if(empty($userTo['id']) || empty($user['id']))
            return false;
            
        $username = $user['username'];
        $password = $user['password'];
        
    	$response = $this->makePostRequest(API_URL . '/user/login',array(
    	   'username' => $username,
           'password' => $password,
           'organization_id' => $user['organization_id']
    	));
		
        $responseAry = json_decode($response,true);
        
        if(empty($responseAry['token']))
            return false;
            
        $token = $responseAry['token'];
        
        $cryptor = new \RNCryptor\Encryptor();
		$cryptedMessage = bin2hex(base64_decode($cryptor->encrypt($message, AES_PASSWORD)));
        $cryptedMessage = mb_strtoupper($cryptedMessage);
        
        /*
        $decryptor = new \RNCryptor\Decryptor();
        $decryptedMessage = $decryptor->decrypt(base64_encode(hex2bin('03011d67f615a4f49b450205cc26954c4eb1d8c91d4bdc487c3018c4a6d3806c9b1d866e07a07ed56dc169dc9421be910531e477becd1fe93c423e545b001dd33efa98878ec26f8d12dac887df5baf4c3f66')),AES_PASSWORD);
        
        die($decryptedMessage);
        
        */
        
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
    	
    	print($response);
    	die();
		
        return true;
	}



	public function sendEmail($toAddress,$subject,$body){
		
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

		
		/*
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
        
        */

	            
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

	
}