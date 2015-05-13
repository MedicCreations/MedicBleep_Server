<?php

/*
 * This file is part of the Silex framework. Copyright (c) 2013 clover studio official account For the full copyright and license information, please view the LICENSE file that was distributed with this source code.
 */
error_reporting ( E_ALL );
ini_set ( "display_errors", 1 );
date_default_timezone_set ( "GMT" );

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/const.php';
require_once __DIR__ . '/../init.php';
require_once __DIR__ . '/../etc/utils.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Silex\Provider\MonologServiceProvider;
use Silex\Provider\SwiftmailerServiceProvider;
use Knp\Provider\ConsoleServiceProvider;

$app = new Silex\Application ( isset ( $dependencies ) ? $dependencies : array () );
$app ['debug'] = true;

// set default organization id
$app['organization_id'] = 1;

// logging
$app->register(new MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__.'/../logs/debug.log',
));

$app->register ( new Spika\Provider\LocalizationProvider(),array(
    'defaultLang' => LANG,
    'langDir' => __DIR__.'/lang',
));


$app->register ( new Silex\Provider\DoctrineServiceProvider (), array (
		'db.options' => array (
				'driver' => 'pdo_mysql',
				'host' => DB_HOST,
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

$app->register(new Silex\Provider\SwiftmailerServiceProvider(), array(
	'swiftmailer.options' => array(
	'host' => 'smtp.gmail.com',
	'port' => 465,
	'username' => 'sinisa.brcina@clover-studio.com',
	'password' => 'sinek0212',
	'encryption' => 'ssl',
	'auth_mode' => 'login'), 
		'swiftmailer.class_path' => __DIR__.'/../vendor/swiftmailer/lib/classes'
));

$app->register ( new Spika\Provider\TokenServiceProvider () );

$app->register(new Spika\Provider\WebSocketNotificationProvider(), array(
    'host' => WEBSOCKET_SERVER_HOST,
    'port' => WEBSOCKET_SERVER_PORT
));

$app->register(new Silex\Provider\SessionServiceProvider(), array(
));

// setup console
$app->register(
    new ConsoleServiceProvider(),
    array(
        'console.name' => 'UserBatch',
        'console.version' => '0.1.0',
        'console.project_directory' => __DIR__ . "/.."
    )
);

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
$app->mount ( '/v1/room', new Spika\Controller\RoomController() );
$app->mount ( '/v1/search', new Spika\Controller\SearchController() );
$app->mount ( '/v1/member', new Spika\Controller\MemberController() );
$app->mount ( '/v1/OCR', new Spika\Controller\OCRController() );