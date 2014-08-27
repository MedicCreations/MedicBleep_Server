<?php
namespace Spika\UserManager;

use Silex\Application;

class Ldap implements LdapInterface{
	
	public function checkUser(Application $app, $password, $username){
		
		$base_dn = LDAP_BASE_DN;
		
		$filter="(uid={$username})";
		
		$read = ldap_search($app['ldap'], $base_dn, $filter);
		$info = ldap_get_entries($app['ldap'], $read);
		
		if ($info['count']>0){
			
			$user_dn = $info[0]['dn'];
			$user_uid_number = $info[0]['uidnumber'][0];
			$firstname = $info[0]['givenname'][0];
			$lastname = $info[0]['sn'][0];
			
			$auth_status = @ldap_bind($app['ldap'], $user_dn, $password);
			
			ldap_close($app['ldap']);
			
			$result = array('auth_status' => $auth_status,
					'uid_number' => $user_uid_number,
					'firstname' => $firstname,
					'lastname' => $lastname);
			
		} else {
			
			$result = array('auth_status' => false,
					'uid_number' => '',
					'firstname' => '',
					'lastname' => '');
			
		}
		
		return $result;
		
	}
	
	
	public function getUsersList(Application $app, $search, $outside_id){
		
		ldap_set_option($app['ldap'], LDAP_OPT_PROTOCOL_VERSION, 3);
			
		$base_dn = "OU=users,DC=clover-studio,DC=com";

		if ($search==""){
			$filter="(&(givenname=*)(!(uidnumber=".$outside_id.")))";
		} else {
			$filter="(&(givenname=".$search."*)(!(uidnumber=".$outside_id.")))";
		}
		
		$justthese = array("cn", "sn", "givenname", "uidnumber");
			
		$pageSize = 100;
		
		$cookie = '';
		
		$user_ary = array();
		
		do {
			ldap_control_paged_result($app['ldap'], $pageSize, true, $cookie);
		
			$result = ldap_search($app['ldap'], $base_dn, $filter, $justthese);
			$entries = ldap_get_entries($app['ldap'], $result);
		
			foreach ($entries as $e) {
				$firstName = $e['givenname'][0];
				$lastname = $e['sn'][0];
				$ldap_id = $e['uidnumber'][0];
					
				$user = array('id' => $ldap_id,
						'firstname' => $firstName,
						'lastname' => $lastname,
						'image' => DEFAULT_USER_IMAGE,
						'image_thumb' => DEFAULT_USER_IMAGE);
				if ($user['id'] != NULL){
					array_push($user_ary, $user);
				}	
				
			}
		
			ldap_control_paged_result_response($app['ldap'], $result, $cookie);
				
		} while($cookie !== null && $cookie != '');
			
		
		return $user_ary;
	}
	
	
	public function getGroupsList(Application $app, $search, $username){
	
		ldap_set_option($app['ldap'], LDAP_OPT_PROTOCOL_VERSION, 3);
			
		$base_dn = "OU=groups,DC=clover-studio,DC=com";
	
		if ($search==""){
			$filter="(&(cn=*)(memberuid=*".$username."*))";
		} else {
			$filter="(&(cn=".$search."*)(memberuid=*".$username."*))";
		}
	
		$justthese = array("cn", "gidnumber");
			
		$pageSize = 100;
	
		$cookie = '';
	
		$group_ary = array();
	
		do {
			ldap_control_paged_result($app['ldap'], $pageSize, true, $cookie);
	
			$result = ldap_search($app['ldap'], $base_dn, $filter, $justthese);
			$entries = ldap_get_entries($app['ldap'], $result);
			
			foreach ($entries as $e) {
				$groupName = $e['cn'][0];
				$group_id = $e['gidnumber'][0];
					
				$group= array('id' => $group_id,
						'groupname' => $groupName, 
						'image' => DEFAULT_GROUP_IMAGE,
						'image_thumb' => DEFAULT_GROUP_IMAGE);
				if ($group['id'] != NULL){
					array_push($group_ary, $group);
				}
	
			}
	
			ldap_control_paged_result_response($app['ldap'], $result, $cookie);
	
		} while($cookie !== null && $cookie != '');
			
	
		return $group_ary;
	}
	
	
	public function getGroupMembers(Application $app, $group_id){
		
		$base_dn = "OU=groups,DC=clover-studio,DC=com";
		
		$filter="(gidNumber=".$group_id.")";
		$justthese = array("memberuid");
		
		$user_ary = array();
		
		$result = ldap_search($app['ldap'], $base_dn, $filter, $justthese);
		$entries = ldap_get_entries($app['ldap'], $result);
		
		$members = $entries[0]['memberuid'];
		
		unset($members['count']);
	
		foreach ($members as $m) {
			$base_dn = LDAP_BASE_DN;
			
			$filter="(uid={$m})";
			
			$read = ldap_search($app['ldap'], $base_dn, $filter);
			$info = ldap_get_entries($app['ldap'], $read);
			
			$user_uid_number = $info[0]['uidnumber'][0];
			$firstname = $info[0]['givenname'][0];
			$lastname = $info[0]['sn'][0];
			
			$ldap_user = array('id' => $user_uid_number, 
					'firstname' => $firstname,
					'lastname' => $lastname);
			
			array_push($user_ary, $ldap_user);
		}
		
		return $user_ary;
		
	}
	
}