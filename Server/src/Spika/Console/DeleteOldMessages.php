<?php 

namespace Spika\Console;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Spika\Db\MySqlDb;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;


class DeleteOldMessages extends \Knp\Command\Command {

	protected function configure(){
		$this
		->setName("deleteOldMessages")
		->setDescription("Delete user messages that are older than 72 hours");
	}
	
	protected function execute(InputInterface $input, OutputInterface $output) {
		
// 		echo "\n"."finding messages \n\n";
        
        
        $app = $this->getSilexApplication();
        
        $app['monolog']->addDebug("******** Deleting old messages *********");
        $app['monolog']->addDebug("		Finding old messages");
                
        $mysql = new MySqlDb ();
		$messages = $mysql->findOutdatedMessages($app);
		
// 		echo "finding files \n\n";
		
		//find files and messages from database first
		
		$normalMesssage = [];
		$messageWithFiles = [];

        $app['monolog']->addDebug("		Filtering old messages");		
		foreach($messages as $message){
			
			if(empty($message['file_id'])){
				array_push($normalMesssage, $message);
			}else{
				array_push($messageWithFiles, $message);
			}

		}

		$app['monolog']->addDebug("		Normal messages count: " . count($normalMesssage));
		$app['monolog']->addDebug("		Media messages count: " . count($messageWithFiles));
		
		$app['monolog']->addDebug("		Deleting normal old messages");
		//first delete normal message
		foreach($normalMesssage as $otherMessage){
			
			$mysql->deleteMessageFrom($app, "message", "id", $otherMessage['id']);
			$mysql->deleteMessageFrom($app, "message", "root_id", $otherMessage['id']);
			$mysql->deleteMessageFrom($app, "message_log" ,"message_id", $otherMessage['id']);
			
		}

		$app['monolog']->addDebug("		Deleting media old messages");		
		//then delete file message delete files from disk
		$dir = '/var/www/Spika_v1.0.0/spikaenterprise-web_source/Server/uploads';
		
		if (! is_dir($dir)) {
        	$output->writeln('Invalid directory path');
    	}else{
	    	$dh  = opendir($dir);
			while (false !== ($filename = readdir($dh))) {
				
				foreach($messageWithFiles as $fileMessage){
				
					if($filename == $fileMessage['file_id']){

						//delete file
						$mysql->deleteMessageFrom($app, "files", "filename", strval($fileMessage['file_id']));
						$this->deleteFile($dir . "/" . strval($fileMessage['file_id']));

						//delete thumb
						if(strval($fileMessage['thumb_id']) != ""){
							$mysql->deleteMessageFrom($app, "files", "filename", strval($fileMessage['thumb_id']));
							$this->deleteFile($dir . "/" . strval($fileMessage['thumb_id']));				
						}

						//delete message
						$mysql->deleteMessageFrom($app, "message", "id", $fileMessage['id']);
						$mysql->deleteMessageFrom($app, "message", "root_id", $fileMessage['id']);
						$mysql->deleteMessageFrom($app, "message_log" ,"message_id", $fileMessage['id']);
						
					}
					
				}
				
			}
    	}

		$app['monolog']->addDebug("		Finished old messages");	
    }

	private function deleteFile($path){

		if(file_exists($path)){
			unlink($path);	
		}
		
	}

}
	
?>