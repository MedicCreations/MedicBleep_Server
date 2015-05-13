<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class PaymentController extends BaseController {
	
	public function connect(Application $app) {
	    
	    parent::connect($app);

		$self = $this;		
		$mySql = new MySqlDb ();
		$controllers = $app ['controllers_factory'];
		
		$controllers->get('/', function (Request $request) use ($app, $self){

            if(!$self->checkLoginUser())
                return $app->redirect(ADMIN_ROOT_URL . '');

            $self->page = 'payment';
            
            $page = $request->get('page');
            if(empty($page))
                $page = 1;
            
            $offset = ($page - 1) * PAGINATOR_PAGESIZE;
            $list = $self->app['db']->fetchAll("
                select * from payment where organization_id = ? order by created desc limit " . PAGINATOR_PAGESIZE . " offset {$offset} ",array($self->user['id']));
            $countAssoc = $self->app['db']->fetchAssoc("select count(*) as count from payment where organization_id = ?  ",array($self->user['id']));
            $count = $countAssoc['count'];
                                    
            return $self->render('payment.twig', array(
                'pager' => array(
                    'baseURL' => ADMIN_ROOT_URL . "/payment/?page=",
                    'pageCount' => ceil($count / PAGINATOR_PAGESIZE) - 1,
                    'page' => $page,
                    'count' => $count,
                    'pageSize' => PAGINATOR_PAGESIZE
                ),
                'list' => $list
            ));

		});
		
		$controllers->get('/downloadinvoice/{paymentId}', function (Request $request,$paymentId) use ($app, $self){
            
            $data = $self->app['db']->fetchAssoc("select * from payment where id = ? ", array($paymentId));
            
            $filepath = INVOICEPATH . "/" . $data['filename'];
            
            if(!file_exists($filepath) || !is_file($filepath)){
            
    			$self->setErrorMessage($this->lang['payment12']);
    			return $app->redirect(ADMIN_ROOT_URL . '/payment'); 

            }

            $stream = function () use ($filepath) {
                readfile($filepath);
            };
            
            return $app->stream($stream, 200, array(
                'Content-Type' => 'application/octet-stream',
                'Content-length' => filesize($filepath),
                'Content-Disposition' => 'attachment; filename="'. $data['invoice_name'] . '"' 
            ));

            			
		});
		
		return $controllers;
		
	}
	
}