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

class SpikaBaseController implements ControllerProviderInterface
{
	
    public function connect(Application $app)
    {
    	
    	$this->app = $app;
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
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $data_string);
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($data_string))
		);
		$result = curl_exec($ch);
		
		$result = json_decode($result, true);
		
		curl_close($ch);
		
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
    			$chat['image'] = $chat_data['image'];
    			$chat['image_thumb'] = $chat_data['image_thumb'];
    		} else {
    			$chat_members = $mySql->getChatMembers($app, $chat_id);
    			$chat['chat_name'] = $this->createChatName($app, $mySql, $chat_members, array());
    		}
    	}
    	
    	return $chat;
    	
    }
    
    
    public function updateSeen(Application $app, $mySql, $chat_id){
    	
    	$last_message = $mySql->getLastMessage($app, $chat_id);
    	
    	$user = $app['user'];
    	
    	$chat = $mySql->getChatWithID($app, $chat_id);
    	
    	$chat_seen = $chat['seen_by'];
    	
    	if ($last_message['user_id'] != $user['id']){
    		
    		if (strpos($chat_seen, $user['firstname']) === false ){
    			
    			if ($chat_seen == ""){
    				$chat_seen = $user['firstname'];
    			} else {
    				$chat_seen = $chat_seen . ', ' . $user['firstname'];
    			}
    			
    			$values = array('seen_by' => $chat_seen);
    			
    			$mySql->updateChat($app, $chat_id, $values);
    			
    			//send push to all members
    			 
    			if ($user['ios_push_token'] != ''){
    				$user_push_token = $user['ios_push_token'];
    			} else {
    				$user_push_token = $user['android_push_token'];
    			}
    			 
    			$chat_members = $mySql->getChatMembers($app, $chat_id);
    			
    			$ios_push_members = array();
    			$android_push_members = array();
    			
    			foreach ($chat_members as $member){
    				 
    				// 			// prepare arrays for push notifications
    				if ($member['android_push_token'] != '' && $member['android_push_token'] != $user_push_token ){
    					array_push($android_push_members, $member['android_push_token']);
    				}
    				 
    				if ($member['ios_push_token'] != '' && $member['ios_push_token'] != $user_push_token){
    					 
    					$ios_member = array('ios_push_token' => $member['ios_push_token'],
    							'badge' => 0);
    					 
    					array_push($ios_push_members, $ios_member);
    				}
    			}
    			
    			// 		//create android fields
    			$payload = array(
    					'registration_ids' => $android_push_members,
    					'data' => array('type' => PUSH_TYPE_SEEN,
    							'chat_id' => $chat_id
    					)
    			);
    			 
    			$android_fields = array('android_push_token_members' => $android_push_members,
    					'type' => SERVICE_PROVIDOR_GCM,
    					'payload' => $payload);
    			 
    			// 		//send android push request
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
	
	
    		
}