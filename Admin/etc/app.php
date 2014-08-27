<?php

error_reporting ( E_ALL );
ini_set ( "display_errors", 1 );
date_default_timezone_set ( "GMT" );

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../init.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Silex\Provider\MonologServiceProvider;
use Silex\Provider\SwiftmailerServiceProvider;

$app = new Silex\Application ( isset ( $dependencies ) ? $dependencies : array () );
$app ['debug'] = true;

// logging
$app->register(new MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__.'/../logs/debug.log',
));

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../src/Spika/View',
));

$app->register ( new Spika\Provider\LocalizationProvider(),array(
    'defaultLang' => 'en',
    'langDir' => __DIR__.'/lang',
));

$app->register ( new Silex\Provider\DoctrineServiceProvider(), array (
		'db.options' => array (
				'driver' => 'pdo_mysql',
				'host' => 'localhost',
				'dbname' => 'spika_enterprise_db',
				'user' => 'root',
				'password' => 'cloverpass013',
				'charset' => 'utf8',
				'driverOptions' => array (
						1002 => 'SET NAMES utf8' 
				),
				'port' => 3306 
		) 
) );

$app->register(new Silex\Provider\SessionServiceProvider());

$app->mount ( '/v1/admin', new Spika\Controller\LoginController() );
$app->mount ( '/v1/admin/dashboard', new Spika\Controller\DashboardController() );
$app->mount ( '/v1/admin/users', new Spika\Controller\UsersController() );
$app->mount ( '/v1/admin/groups', new Spika\Controller\GroupsController() );
$app->mount ( '/v1/admin/chats', new Spika\Controller\ChatsController() );