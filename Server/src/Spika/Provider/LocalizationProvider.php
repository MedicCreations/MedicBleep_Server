<?php
namespace Spika\Provider;

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
            
            foreach($data as $index => $row){
                
                $row = str_replace('\r\n', "\r\n", $row);
                $row = str_replace('\n', "\n", $row);
                
                $data[$index] = $row;
                
            }
            return $data;
        });
        
	}

	public function boot(Application $app)
	{
	}
}