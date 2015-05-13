<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class StickersController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'stickers';

            $list = $self->app['db']->fetchAll("select * from sticker where is_deleted = 0 and organization_id = {$self->user['id']} order by created asc");
            
            return $self->render('stickers.twig', array(
                'list' => $list,
                'stickerBaseURL' => STICKERS_URL
            ));
            			
		});

		$controllers->get('/delete/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'stickers';

            $app['db']->update('sticker', array('is_deleted' => 1) ,array('id' => $id,'organization_id' => $self->user['id']));
            $self->setInfoMessage($this->lang['stickers8']);
            
            return $app->redirect(ADMIN_ROOT_URL . '/stickers');
            			
		});
		
		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $files = $request->files;
    
            $path = STICKERS_DIR;
            $filename = $files->get('stickerfile')->getClientOriginalName();
            $filenameSplited = explode('.',$filename);
            $fileExtension = $filenameSplited[count($filenameSplited) - 1];
            $newFileName = $self->user['id'] . "_" . time() . '.' . $fileExtension;
            
            $errorMessage = '';
            
            if(!preg_match('/^(png|gif|jpg|jpeg)$/i', $fileExtension)){
                $errorMessage = $this->lang['stickers5'];
            }
            
            if(empty($errorMessage)){
            
                if($files->get('stickerfile')->move($path,$newFileName)){
                    
                    // insert to database
        			$values = array(
        			        'organization_id' => $self->user['id'],
        					'is_deleted' => 0,
        					'filename' => $newFileName,
        					'created' => time());
    
        			$app['db']->insert('sticker', $values);
                    
                    $self->setInfoMessage($this->lang['stickers4']);
                }else{
                     $self->setErrorMessage($this->lang['stickers6']);
                }
            } else {
                $self->setErrorMessage($errorMessage);
            }

                        
            return $app->redirect(ADMIN_ROOT_URL . '/stickers');
            			
		});
		return $controllers;
		
	}
	
}