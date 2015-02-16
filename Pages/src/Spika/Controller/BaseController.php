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

        $params['ROOT_URL'] = ROOT_URL;
        $params['lang'] = $this->lang;
        $params['page'] = $this->page;
        $params['user'] = $this->user;
        
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


	public function sendEmail($toAddress,$subject,$body){
		
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
	
}