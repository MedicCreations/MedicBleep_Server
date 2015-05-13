<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class NewsController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';

            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("select * from information where is_deleted = 0 and organization_id = {$self->user['id']} limit " . PAGINATOR_PAGESIZE . " offset {$offset} ");
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from information where is_deleted = 0 and organization_id = {$self->user['id']} ");
            $count = $countAssoc['count'];
            
            return $self->render('news.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/news/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));
        
        });
		
        /* group view */
		$controllers->get('/view/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';
            $data = $this->app['db']->fetchAssoc("select * from information where id = ? and organization_id = {$self->user['id']} ", array($id));
            
            return $self->render('news_view.twig', array(
                 'data' => $data,
                 'mode' => 'view'
            ));
            			
		});
		
		$controllers->get('/delete/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';
            $data = $this->app['db']->fetchAssoc("select * from information where id = ? and organization_id = {$self->user['id']} ", array($id));
            
            return $self->render('news_view.twig', array(
                 'data' => $data,
                 'mode' => 'delete'
            ));
            			
		});

		$controllers->post('/delete/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';

			$values = array(
					'is_deleted' => 1,
					'modified' => time());
            
            $app['db']->update('information', $values,array('id' => $id));
            
            $self->setInfoMessage($self->lang['news19']);
            return $app->redirect(ADMIN_ROOT_URL . '/news');
            			
		});
		
		$controllers->get('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';
            
            return $self->render('news_add.twig', array(
                'form' => $self->defaultFormValues(),
                'mode' => 'add'
            ));
		});		

		$controllers->post('/add', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';
            
            $formValues = $request->request->all();

			$values = array(
			        'organization_id' => $self->user['id'],
					'title' => $formValues['title'],
					'body' => $formValues['body'],
					'created' => time(), 
					'modified' => time());

			$app['db']->insert('information', $values);
                        
            $self->setInfoMessage($self->lang['news7']);
            return $app->redirect(ADMIN_ROOT_URL . '/news');

		});		
		
				
        $controllers->get('/edit/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'news';
            $data = $this->app['db']->fetchAssoc("select * from information where id = ? and organization_id = {$self->user['id']} ", array($id));
            
            if(!isset($data['id'])){
                return $app->redirect(ADMIN_ROOT_URL . '/news');
            }
            
            return $self->render('news_edit.twig', array(
                 'form' => $data,
                 'mode' => 'edit'
            ));
            			
		});

		$controllers->post('/edit/{id}', function (Request $request,$id) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'groups';
            $formValues = $request->request->all();

			$values = array(
					'title' => $formValues['title'],
					'body' => $formValues['body'],
					'modified' => time());

			$app['db']->update('information', $values,array('id' => $id));
            
            $self->setInfoMessage($self->lang['news13']);
            return $app->redirect(ADMIN_ROOT_URL . '/news/');

		});
		
		return $controllers;
		
	}
	
	function defaultFormValues(){
    	return array(
    	    'id' => '',
    	    'title' => '',
    	    'body' => ''
    	);
	}
	
}