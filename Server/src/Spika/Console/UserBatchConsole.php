<?php

namespace Spika\Console;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Spika\Db\MySqlDb;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class UserBatchConsole extends \Knp\Command\Command {

        protected function configure() {
            $this
            ->setName("userbatch")
            ->setDescription("Handle user data");
            
        }
        
        protected function execute(InputInterface $input, OutputInterface $output) {
            
            $app = $this->getSilexApplication();
            
            $mysql = new MySqlDb ();
            $mysql->disconectWebUsers($app);

            
        }
        
}