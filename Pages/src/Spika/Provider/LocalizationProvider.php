<?php
namespace Spika\Provider;

use Spika\Middleware\TokenChecker;
use Silex\Application;
use Silex\ServiceProviderInterface;

class LocalizationProvider implements ServiceProviderInterface
{
	public function register(Application $app)
	{
        $app['getLang'] = $app->protect(function () use ($app) {
        
            $defaultLang = $app['defaultLang'];
            $langDir = $app['langDir'];    
            $langFile = $langDir . "/" . $defaultLang . ".ini";
            $data = parse_ini_file($langFile);
            
            return $data;
        });
        
	}

	public function boot(Application $app)
	{
	}
}