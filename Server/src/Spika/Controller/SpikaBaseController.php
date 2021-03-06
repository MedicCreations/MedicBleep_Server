<?php

/*
 * This file is part of the Silex framework.
 *
 * Copyright (c) 2013 clover studio official account
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Exception;

class SpikaBaseController implements ControllerProviderInterface
{

	var $app;
	var $lang;
	
    public function connect(Application $app)
    {
    	
    	$this->app = $app;
	    $this->lang = $this->app['getLang']();
	    
        $controllers = $app['controllers_factory'];
        return $controllers;        
    }
    
   
    public function validateRequestParams($requestBody,$requiredParams){
        $requestParams = json_decode($requestBody,true);

	    if(!is_array($requestParams))
	    	return false;
	    	
	    foreach($requiredParams as $param){
		    if(!isset($requestParams[$param]) || empty($requestParams[$param]))
		    	return false;
	    }
	    
	    return true;
    }

    public function returnErrorResponse($errorMessage, $error_code, $httpCode = 200){
	    $arr  = array('message' => $errorMessage, 'code' => $error_code);
        $json = json_encode($arr);
        return new Response($json, $httpCode);
    }
    
    public function returnSuccessResponse($successMessage, $httpCode = 200){
    	$arr  = array('message' => $successMessage, 'code' => CODE_SUCCESS);
    	$json = json_encode($arr);
    	return new Response($json, $httpCode);
    }
    
	public function sendPushRequest($params){

		$data_string = json_encode($params);
		
		$url = PUSH_ROOT_URL;
// 		echo($url);
/*
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $data_string);
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($data_string))
		);
		try {

		$result = curl_exec($ch);
		
		if (FALSE === $result)
		throw new Exception(curl_error($ch), curl_errno($ch));
		
		} catch(Exception $e) {
		
		trigger_error(sprintf(
		'Curl failed with error #%d: %s',
		$e->getCode(), $e->getMessage()),
		E_USER_ERROR);
		
		}
		
		var_dump($result);
		
		$result = json_decode($result, true);

		echo(print_r($result,true));
		
		curl_close($ch);
*/

		$parts=parse_url($url);

		$fp = fsockopen('ssl://' . $parts['host'], 443, $errno, $errstr, 30);
// 		echo($fp);
		
		$out = "POST ".$parts['path']." HTTP/1.1\r\n";
		$out.= "Host: ".$parts['host']."\r\n";
		$out.= "Content-Type: application/json\r\n";
		$out.= "Content-Length: ".strlen($data_string)."\r\n";
		$out.= "Connection: Close\r\n\r\n";
		if (isset($data_string)) $out.= $data_string;
		
		fwrite($fp, $out);
		fclose($fp);
		
    }	
    
    public function createChatCustomID($members){
    	
    	sort($members, SORT_NUMERIC);
    	$id = implode('!', $members);
    	return $id;
    	
    }
    
    public function createChatName(Application $app, $mySql, $chat_members, $users_to_add_ary){
    	
    	$chat_name = '';
    	foreach ($chat_members as $member){
    		if ($member['user_id'] != $app['user']['id']){
    			$chat_name = $chat_name . $member['firstname'] . ', ';
    		}
    	}
    	if (count($users_to_add_ary) > 0){
    		foreach ($users_to_add_ary as $user_id_to_add){
    			if ($user_id_to_add != ""){
    				$user_to_add = $mySql->getUserByID($app, $user_id_to_add);
    				$chat_name = $chat_name . $user_to_add['firstname'] . ', ';
    			}
    		}
    	} 
    	
    	$chat_name = substr_replace($chat_name, "", -2);
    	
    	return $chat_name;
    	
    }
    
    
    public function getChatData(Application $app, $mySql, $chat_id){
    	
    	$user_id = $app['user']['id'];
    	
    	$chat = $mySql->getChatByID($app, $chat_id);
    		
    	if ($chat['name'] == ""){
    		if ($chat['type'] == CHAT_USER_TYPE){
    			$chat_data = $mySql->getPrivateChatData($app, $chat_id, $user_id);
    			$chat['chat_name'] = $chat_data['name'];
    			
    			if(is_null($chat_data['image']))
    			    $chat_data['image']='';
    			    
    			if(is_null($chat_data['image_thumb']))
    			    $chat_data['image_thumb']='';
    			    
    			$chat['image'] = $chat_data['image'];
    			$chat['image_thumb'] = $chat_data['image_thumb'];
    		} else {
    			$chat_members = $mySql->getChatMembers($app, $chat_id);
    			$chat['chat_name'] = $this->createChatName($app, $mySql, $chat_members, array());
    		}
    	}
		
		$category = $mySql->getCategoryById($app, $chat['category_id']);
		$chat['category'] = $category;
    	
    	return $chat;
    	
    }
    
    
    public function updateSeen(Application $app, $mySql, $chat_id, $countryCode){
    	
    	$last_message = $mySql->getLastMessage($app, $chat_id, $countryCode);
    	
    	$user = $app['user'];
    	
    	$chat = $mySql->getChatWithID($app, $chat_id);
    	
    	$chat_seen = $chat['seen_by'];
    	
    	if ($last_message['user_id'] != $user['id']){
    		
    		if (empty($chat_seen) || strpos($chat_seen, $user['firstname']) === false ){
    			
    			if ($chat_seen == ""){
    				$chat_seen = $user['firstname'];
    			} else {
    				$chat_seen = $chat_seen . ', ' . $user['firstname'];
    			}
    			
    			$values = array('seen_by' => $chat_seen);
    			
    			$mySql->updateChat($app, $chat_id, $values);
    			
    			//send push to all members
    			 
    			$chat_members = $mySql->getChatMembers($app, $chat_id);
    			
    			$ios_push_members = array();
    			$android_push_members = array();
    			
				$memberPushTokenListRaw = $mySql->getChatDevicesAll($app, $chat_id);
				$memberPushTokenListFormatted = array();
				
				foreach($memberPushTokenListRaw as $row){
					if(!isset($memberPushTokenListFormatted[$row['user_id']]))
						$memberPushTokenListFormatted[$row['user_id']] = array();
					
					$memberPushTokenListFormatted[$row['user_id']][] = $row;
					 
				}
				
				
				
    			foreach ($chat_members as $member){
    				 
					if(!isset($memberPushTokenListFormatted[$member['user_id']]))
						continue;
					
					if($user['id'] == $member['user_id'])
						continue; 
					 
					$devices = $memberPushTokenListFormatted[$member['user_id']];
					
					foreach($devices as $device){
                    
						if($member['web_opened'] == 1){
						
							if($device['type'] == DEVICE_WEB){
								
								// $app['monolog']->addDebug(" send web push" . print_r($member,true));  
								
								// // send websocket notification
								// $payload = json_encode(array(
									// 'command' => 'sendMessage',
									// 'identifier' => SYSTEM_IDENTIFIER,
									// 'chat_id' => $chat_id,
									// 'from_user_id' => $user['id'],
									// 'user_id' => $device['user_id'],

								
								// sendWebSocketSignal($payload,$app);
								
								// // if send web push dont send mobile push
								// break;
								
							}
							
						} else {
							
							if($device['type'] == DEVICE_ANDROID)
								array_push($android_push_members, $device['device_token']);
		
							if($device['type'] == DEVICE_IOS)
								array_push($ios_push_members, array('ios_push_token'=>$device['device_token'],'badge'=>0));
							
						}

						
					}

				}
    			
    			//create android fields
    			$payload = array(
    					'registration_ids' => $android_push_members,
    					'data' => array('type' => PUSH_TYPE_SEEN,
    							'chat_id' => $chat_id
    					)
    			);
    			 
    			$android_fields = array('android_push_token_members' => $android_push_members,
    					'type' => SERVICE_PROVIDOR_GCM,
    					'payload' => $payload);
    			 
    			//send android push request
    			if (count($android_push_members) > 0){
    				$this->sendPushRequest($android_fields);
    			}
    			 
    			 
    			// 		//create ios fields
    			$payload = array();
    			
    			$apsAry = array();
    			 
    			$dataAry = array('t' => PUSH_TYPE_SEEN,
    					'ci' => $chat_id,
    			);
    			 
    			$payload['aps'] = $apsAry;
    			$payload['d'] = $dataAry;
    			 
    			$ios_fields = array('ios_push_token_members' => $ios_push_members,
    					'type' => SERVICE_PROVIDOR_APN_DEV,
    					'payload' => $payload);
    			 
    			// 			//send ios push request
    			if (count($ios_push_members) > 0){
    				$this->sendPushRequest($ios_fields);
    			}
    			
    		}
    		
    	}
    	
    	return $chat_seen;
    } 
	
	public function mergeGroupChatUsers(Application $app, $mySql, $group_id, $chat_id){
	
		$group_members_ids = array();
		$chat_members_ids = array();
	
		$group_members = $mySql->getGroupMembers($app, $group_id);
		foreach($group_members as $member){
			array_push($group_members_ids, $member['id']);
		}
		
		$chat_members = $mySql->getChatMembers($app, $chat_id);
		foreach($chat_members as $member){
			array_push($chat_members_ids, $member['user_id']);
		}
		
		$users_to_add = array_diff($group_members_ids, $chat_members_ids);
		$mySql->addChatMembers($app, $chat_id, $users_to_add);
		
		$users_to_delete = array_diff($chat_members_ids, $group_members_ids);
		foreach ($users_to_delete as $user_id){
					$values = array('is_deleted' => 1);
					$mySql->updateChatMember($app, $chat_id, $user_id, $values);
				}
	}
	
	public function sendWebSocketSignal($message,$app){
        
        $app['monolog']->addDebug('PHP_webSocket connecting to ws server');
        $result = $app['websocket_send']($message);
        $app['monolog']->addDebug('PHP_webSocket sent:'.$result);
	}
	
	public function getDeviceType($userAgent){

        // detect iOS or Android or Web
        $deviceType = DEVICE_WEB;
        if(preg_match("/SpikaEnterprise|iOS/i", $userAgent)){
            $deviceType = DEVICE_IOS;
        }
        
        if(preg_match("/SpikaEnterprise Android/i", $userAgent)){
            $deviceType = DEVICE_ANDROID;
        }
        
        return $deviceType;
        
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
	
	public function getFormattedMessages($messages){
	
		foreach($messages as &$message){
			$user = array('user_id' => $message['user_id'], 
					'firstname' => $message['firstname'],
					'lastname' => $message['lastname'],
					'image' => $message['image'],
					'image_thumb' => $message['image_thumb'],
					'email' => empty($message['email']) ? '' : $message['email'],
					'phone_number' => empty($message['phone_number']) ? '' : $message['phone_number']);
			$message['user'] = $user;
		}
		
		return $messages;
	
	}
	
	public function getFormattedMessage($message){
	
			$user = array('user_id' => $message['user_id'], 
					'firstname' => $message['firstname'],
					'lastname' => $message['lastname'],
					'image' => $message['image'],
					'image_thumb' => $message['image_thumb'],
					'email' => empty($message['email']) ? '' : $message['email'],
					'phone_number' => empty($message['phone_number']) ? '' : $message['phone_number']);
			$message['user'] = $user;
		
		return $message;
	
	}
	
	public function getOCRuserImage(Application $app, $imageName){
		
		$imageURL = "https://theoncallroom.com/img/userprofilephotos/" . $imageName;
		$app['monolog']->addDebug("imageURL " . $imageURL);
		
		$chi = curl_init($imageURL);
		curl_setopt($chi, CURLOPT_URL, $imageURL);
		curl_setopt($chi, CURLOPT_RETURNTRANSFER, 1);
		$image = curl_exec($chi);			
		
		if(!is_null($image) && $image != false){
				
			$app['monolog']->addDebug("Fetched image from OCR");
			$destination = "/var/www/Spika_v1.0.0/spikaenterprise-web_source/Server/uploads/" . substr($imageName, 0, -4);
			$file = fopen($destination, "w");
			fwrite($file, $image);
			fclose($file);
			
		}
		curl_close($chi);
		
	}
    
    public function getOCRuserThumbImage(Application $app, $imageName){
		
		$imageURL = "https://theoncallroom.com/img/userprofilephotos/thumb/".$imageName;
							
		$chit = curl_init($imageURL);
		curl_setopt($chit, CURLOPT_URL, $imageURL);
		curl_setopt($chit, CURLOPT_RETURNTRANSFER, 1);
		$imageThumb = curl_exec($chit);
		
		
		if(!is_null($imageThumb) && $imageThumb != false){
			$app['monolog']->addDebug("Fetched thumb image from OCR");								
			$destination = "/var/www/Spika_v1.0.0/spikaenterprise-web_source/Server/uploads/" . substr($imageName, 0, -4);
			$file = fopen($destination, "w");
			fwrite($file, $imageThumb);
			fclose($file);
		}							
		curl_close($chit); 
    }
    
    public function changeOCRpassword(Application $app, $OCR_email, $new_password){
	    
	    $dataForOCR = array("email"=>$OCR_email, "password"=>$new_password);
		$data_string = json_encode($dataForOCR);
		
		$app['monolog']->addDebug(print_r($data_string,true));
	    
	    $ch = curl_init('https://theoncallroom.com/admin/Bleeps/change_password');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',                                                                                
			'Content-Length: ' . strlen($data_string))                                                                       
		);
			
		$res = curl_exec($ch);
		$res = json_decode($res, true);
		
    }
    
    //if user exists return true
	public function registerUser(Application $app, $mySql, $OCRuser){
		
		$user = $mySql->getUserByUsernameOrEmail($app, $OCRuser['email']);
// 		echo(var_dump($user));
		
		if($user == false){
			
			$mySql->registerOCRUser($app, $OCRuser, $OCRuser['password']);
			
			echo("Image " . $OCRuser['image']);
			echo("thumbImage " . $OCRuser['thumb_image']);
			
			if($OCRuser['image'] != false){
				$this->getOCRuserImage($app, $OCRuser['image']);	
			}
			
			if($OCRuser['thumb_image'] != false){
				$this->getOCRuserThumbImage($app, $OCRuser['thumb_image']);						
			}

		}
		
		return true;
		
	}
	
	public function createConnections(Application $app, $mySql, $OCRuser){
		
		if(is_array($OCRuser['connections'])){
			$connections = $OCRuser['connections'];
			
			//remove all connections
			$mySql->removeAllOCRconnections($app, $OCRuser['id']);
			
			//add all connections
			foreach($connections as $connection){				
				$userConnection = $mySql->selectOCRconnection($app, $OCRuser['id'], $connection['id']);
				if($userConnection == false){
					$mySql->insertOCRconnection($app, $OCRuser['id'], $connection['id']);
				}
								
			}			
		}
				
	}
    
}