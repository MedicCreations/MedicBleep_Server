<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class ChatsController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){
            
            $this->page = 'chats';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from chat limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from chat");
            $count = $countAssoc['count'];
            
            
            return $self->render('chats.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/chats/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
            			
		});
		
        /* group view */
		$controllers->get('/view/{chatId}', function (Request $request,$chatId) use ($app, $self){
            
            $this->page = 'chats';
            $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));
            
             // select participants
            $users = $self->app['db']->fetchAll("select * from user where id in ( select user_id from chat_member where chat_id = ? ) ", array($chatId));
            
            // load chat
            $messages = $self->app['db']->fetchAll("
                select 
                    *,
                    message.created as message_timestamp,
                    message.id as message_id
                from 
                message
                left join user on user.id = message.user_id
                 where chat_id = ?
            ", array($chatId));
            
            return $self->render('chats_view.twig', array(
                 'data' => $data,
                 'mode' => 'view',
                 'users' => $users,
                 'messages' => $messages
            ));
            			
		});
		
        /* group delete */
		$controllers->get('/delete/{chatId}', function (Request $request,$chatId) use ($app, $self){
            
            $this->page = 'chats';
            $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));
            
            return $self->render('chats_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            			
		});

		$controllers->post('/delete/{chatId}', function (Request $request,$chatId) use ($app, $self){
            
            $this->page = 'chats';
            $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));

			$app['db']->delete('chat',array('id' => $chatId));
    			
            $self->setInfoMessage($self->lang['chats8']);
            return $app->redirect(ADMIN_ROOT_URL . '/chats');
            			
		});
		
		/* Edit */
		$controllers->get('/edit/{chatId}', function (Request $request,$chatId) use ($app, $self){
            
            $this->page = 'chats';
            $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/chats');
            }
            
            return $self->render('chats_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{chatId}', function (Request $request,$chatId) use ($app, $self){
            
            $this->page = 'chats';
            $formValues = $request->request->all();
            $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/chats');
            }
            
            if(isset($formValues['edit_profile'])){

                $errorMessage = $self->validate($request,true);
                
                if(!empty($errorMessage)){
                
                    return $self->render('chats_edit.twig', array(
                        'form' => array_merge($data,$formValues),
                        'error' => $errorMessage,
                        'mode' => 'edit'
                    ));
                    
                }else{
    
                    $pictureFile = $request->files->get('picture');
                    $image = $data['image'];
                    
                    if(!empty($pictureFile)){
    
                        $test = $self->processPicture($pictureFile,'picture');
    
                        if($test != null){
                            $image = $test[0];
                        }
                        
                    }
                    
        			$values = array(
        					'name' => $formValues['name'],
        					'image' => $image,
        					'modified' => time());
    
        			$app['db']->update('chat', $values,array('id' => $chatId));
                    
                    $data = $this->app['db']->fetchAssoc("select * from chat where id = ?", array($chatId));
                    return $self->render('chats_edit.twig', array(
                        'form' => $data,
                        'information' => $self->lang['chats7'],
                        'mode' => 'edit'
                    ));
                    
                }	
            
            }
	
		});
		
		/* Delete Message */
		$controllers->get('/view/deletemessage/{chatId}/{messageId}', function (Request $request,$chatId,$messageId) use ($app, $self){
            
            $app['db']->delete('message',array('id' => $messageId));
            return $app->redirect(ADMIN_ROOT_URL . '/chats/view/' . $chatId);
            
		});
		
		return $controllers;
		
	}
	
	function validate($request,$isEdit = false){
    	
    	$formValues = $request->request->all();

        
        if($isEdit == false){
    
        	if(empty($formValues['name']))
        	    return $this->lang['validateionError4'];

        }

        return '';
    	
	}
	
}