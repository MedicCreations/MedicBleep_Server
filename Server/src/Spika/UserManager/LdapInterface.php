<?php
namespace Spika\UserManager;

use Silex\Application;

interface LdapInterface
{
	public function checkUser(Application $app, $password, $username);
	public function getUsersList(Application $app, $search, $outside_id);
	public function getGroupsList(Application $app, $search, $username);
	public function getGroupMembers(Application $app, $group_name);

}