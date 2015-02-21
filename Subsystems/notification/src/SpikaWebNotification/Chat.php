<?php
namespace SpikaWebNotification;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

require(__DIR__ . '/../../init.php');

class Chat implements MessageComponentInterface {
    protected $clients;
    
    var $logger;
    var $userData;
    var $databaseSetting;
    var $conn;
    
    public function __construct() {
        global $test;
        
        $this->clients = new \SplObjectStorage;
        
        $this->logger = new Logger('notification');
        $this->logger->pushHandler(new StreamHandler(__DIR__ . '/../../log/' . LOGFILE, Logger::DEBUG));
        //$this->logger->pushHandler(new \Monolog\Handler\ErrorLogHandler());
        
        // add records to the log
        $this->logger->addInfo('Notification startup');
        
        // add records to the log
        $this->logger->addInfo('Notification startup');

        $AllDB = getDBConfig();
        
        //$this->conn = array();

		/*
        foreach($AllDB as $key => $db){

            $config = new \Doctrine\DBAL\Configuration();
    
            $connectionParams = array(
                'dbname' => $db['DB_NAME'],
                'user' => $db['DB_USERNAME'],
                'password' => $db['DB_PASSWORD'],
                'host' => $db['DB_HOST'],
                'driver' => 'pdo_mysql',
            );
            
            $this->conn[$key] = \Doctrine\DBAL\DriverManager::getConnection($connectionParams, $config);
                    
        }
        */
        /*
        
        $db = getDBConfig($parsedMessage['identifier']);
        
        $config = new \Doctrine\DBAL\Configuration();

        $connectionParams = array(
            'dbname' => $db['DB_NAME'],
            'user' => $db['DB_USERNAME'],
            'password' => $db['DB_PASSWORD'],
            'host' => $db['DB_HOST'],
            'driver' => 'pdo_mysql',
        );
        
        $this->conn = \Doctrine\DBAL\DriverManager::getConnection($connectionParams, $config);
        
        */

    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        $this->logger->addInfo("New connection! ({$conn->resourceId})\n");
        
        $this->userData[$conn->resourceId] = array(
            'identifier' => '',
            'userId' => '',            
        );
    }

    public function onMessage(ConnectionInterface $from, $msg) {
                
        $numRecv = count($this->clients) - 1;
        
        // parse message
        $parsedMessage = json_decode($msg,true);
        $command = $parsedMessage['command'];
        
        $this->logger->addInfo(print_r($parsedMessage,true));
        $this->logger->addInfo($command);
        
        if($command == 'setUser'){
            
            $this->logger->addInfo("set resouse id " . $from->resourceId . " to " . $parsedMessage['userId']);
            
            $this->userData[$from->resourceId] = array(
                'identifier' => $parsedMessage['identifier'],
                'userId' => $parsedMessage['userId'],            
            );

        }

        if($command == 'removeUser'){
            $this->logger->addInfo('user deattached');
            unset($this->userData[$from->resourceId]);
        }
 
         if($command == 'sendMessage'){
            
            if(isset($parsedMessage['identifier'])){
                
                //$conn = $this->conn[$parsedMessage['identifier']];
                
                $userData = $this->userData[$from->resourceId];
                $chatId = $parsedMessage['chat_id'];
                $userId = $parsedMessage['user_id'];
                $message = $parsedMessage['message'];

                foreach ($this->clients as $client) {
                    
                    $value = $this->userData[$client->resourceId];
                    
                    $this->logger->addInfo($value['userId']  . ":" . $userId);
                    
                    if($value['userId'] == $userId){

	                    $this->logger->addInfo("send web notification " . $userId);
	                    
                        $client->send(json_encode(array(
                            'command' => 'sendMessage',
                            'chat_id' => $chatId,                      
                            'user_id' => $userId,
                            'message' => $message                       
                        )));
                    
                    }
                    
                }
 
                /*
                // get all users to notify
                $chatMember = $conn->fetchAll("select * from chat_member where chat_id = {$chatId}");
                $userIdAry = array();
                foreach($chatMember as $row){
                    $userIdAry[] = $row['user_id'];                 
                }

                foreach ($this->clients as $client) {
                    
                    $value = $this->userData[$client->resourceId];
                    
                    if(in_array($value['userId'],$userIdAry)){

                        $client->send(json_encode(array(
                            'command' => 'sendMessage',
                            'chat_id' => $chatId,                      
                            'user_id' => $userId                        
                        )));
                    
                    }
                    
                }
				
				*/
            }

        }
               
        /*
        
        $this->logger->addInfo(sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's'));

        foreach ($this->clients as $client) {
            if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
        
        */
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        $this->logger->addInfo("Connection {$conn->resourceId} has disconnected");


    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $this->logger->addInfo("An error has occurred: {$e->getMessage()}\n");
        $conn->close();
    }
}