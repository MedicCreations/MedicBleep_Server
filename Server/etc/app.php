<?php

/*
 * This file is part of the Silex framework. Copyright (c) 2013 clover studio official account For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */
error_reporting ( E_ALL );
ini_set ( "display_errors", 1 );
date_default_timezone_set ( "GMT" );

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../init.php';
require_once __DIR__ . '/../etc/utils.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Silex\Provider\MonologServiceProvider;
use Silex\Provider\SwiftmailerServiceProvider;

$app = new Silex\Application ( isset ( $dependencies ) ? $dependencies : array () );
$app ['debug'] = true;

// logging
// $app->register(new MonologServiceProvider(), array(
// 'monolog.logfile' => __DIR__.'/../logs/debug.log',
// ));

$app->register ( new Silex\Provider\DoctrineServiceProvider (), array (
		'db.options' => array (
				'driver' => 'pdo_mysql',
				'host' => 'localhost',
				'dbname' => DB_NAME,
				'user' => DB_USERNAME,
				'password' => DB_PASSWORD,
				'charset' => 'utf8',
				'driverOptions' => array (
						1002 => 'SET NAMES utf8' 
				),
				'port' => 3306 
		) 
) );

$app->register ( new Spika\Provider\TokenServiceProvider () );


$app->register(new Silex\Provider\SessionServiceProvider(), array(
));

//ldap
//$ldapconn = ldap_connect(LDAP_SERVER, LDAP_PORT);
//ldap_set_option($ldapconn, LDAP_OPT_PROTOCOL_VERSION, 3);
//$app['ldap'] = $ldapconn;

// $app['beforeAdminChecker'] = $app->share(function () use ($app) {
// return new GameBu\Middleware\AdminChecker(
// $app
// );
// });

$app->mount ( '/v1/user', new Spika\Controller\UserController() );
$app->mount ( '/v1/file', new Spika\Controller\FileController() );
$app->mount ( '/v1/groups', new Spika\Controller\GroupController() );
$app->mount ( '/v1/message', new Spika\Controller\MessageController() );
$app->mount ( '/v1/lobby', new Spika\Controller\LobbyController() );
$app->mount ( '/v1/chat', new Spika\Controller\ChatController() );
$app->mount ( '/v1/category', new Spika\Controller\CategoryController() );