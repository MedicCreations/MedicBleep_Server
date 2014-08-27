<?php
namespace Spika\Provider;

use Spika\Middleware\TokenChecker;
use Silex\Application;
use Silex\ServiceProviderInterface;

class TokenServiceProvider implements ServiceProviderInterface
{
	public function register(Application $app)
	{
		if (!isset($app['beforeSpikaTokenChecker'])) {
			$app['beforeSpikaTokenChecker'] = $app->share(function () use ($app) {
				return new TokenChecker(
						$app
				);
			});
		}
	}

	public function boot(Application $app)
	{
	}
}