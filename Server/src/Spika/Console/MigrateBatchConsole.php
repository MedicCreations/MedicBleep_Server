<?php

namespace Spika\Console;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Spika\Db\MySqlDb;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class MigrateBatchConsole extends \Knp\Command\Command {

        protected function configure() {
            $this
            ->setName("migrate")
            ->setDescription("Migrate user data");
            
        }
        
        protected function execute(InputInterface $input, OutputInterface $output) {
            
            $app = $this->getSilexApplication();
            
            $users = $app['db']->fetchAll("select * from user");
            
            foreach($users as $user){
                
                $userMst = $app['db']->fetchAssoc("select * from user_mst where id = ?",array($user['master_user_id']));
                
                if(!isset($userMst['id'])){
                    
                    $userMstData = array(
                        'username' => $user['username'],
                        'password' => $user['password'],
                        'email' => $user['email'],
                        'email_verified' => 1,                        
                        'created' => $user['created'],
                        'modified' => $user['modified']
                    );
                    
                    $app['db']->insert('user_mst',$userMstData);
                    
                    $lastInsertId = $app['db']->lastInsertId();
                    
                    $app['db']->update('user',array(
                        'is_valid' => 1,
                        'master_user_id' => $lastInsertId
                    ),array('id' => $user['id']));

                }
                
            }
            
            
        }
        
}