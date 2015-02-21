<?php

    define('LOGFILE','debug.log');
    
    function getDBConfig($id = ''){
    
        $DBCONFIG = array(
            'clover' => array(
                'DB_HOST' => 'localhost',
                'DB_NAME' => 'clover',
                'DB_USERNAME' => 'root',
                'DB_PASSWORD' => 'cloverpass013',
            )
        );
        
        if($id == '')
            return $DBCONFIG;
            
        if(!isset($DBCONFIG[$id]))
            return null;
            
        return $DBCONFIG[$id];
        
    }
