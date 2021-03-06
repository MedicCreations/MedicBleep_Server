<?php

namespace Spika\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ParameterBag;
use Spika\Db\MySqlDb;
use Symfony\Component\HttpKernel\HttpKernelInterface;

class FileController extends SpikaBaseController {
	
	static $paramName = 'file';
	static $fileDirName = '/uploads';
	
	//static $filePath = $_SERVER['DOCUMENT_ROOT'] . '/msg/spikaenterprise_web/Server/uploads';
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		//image upload
		$controllers->post('/upload', function (Request $request) use ($app, $self, $mySql) {
				
			$file = $request->files->get(FileController::$paramName);
			
			$filePath = FILEPATH;						
			$fineName = $mySql->randomString(20, 20) . time();
                        
			if(!is_writable($filePath))
				return $self->returnErrorResponse(FileController::$fileDirName ." dir is not writable.", ER_DIR_NOT_WRITABLE);
            
			$file->move($filePath, $fineName);
			
            $userId = $app['user']['id'];
            $organizationId = $app['user']['organization_id'];
            $fileSize = $file->getClientSize();
            
			if(!$mySql->checkDiskSpace($app, $organizationId, $fileSize)){
    			return $app->json(array("message" => "Disk quota exceeded", "code" => ER_DISKSPACE_LIMIT), 200);
			}            
                        
			$mySql->addNewFile($app, $userId, $organizationId, $fileSize, $fineName);

			return $app->json(array("message" => "file uploaded", "code" => CODE_SUCCESS, "file_id" => $fineName,), 200);
		
		})->before($app['beforeSpikaTokenChecker']);
		
		//image download
		$controllers->get ( '/download', function (Request $request) use($app, $self, $mySql) {

			$requestBodyAry = $request->query->all();
			$fileID = $requestBodyAry['file_id'];
			$filePath = FILEPATH;	
			$filePath = $filePath."/".basename($fileID);
            
            $fileContent = file_get_contents($filePath);
            $size = filesize($filePath);
            
			if(file_exists($filePath)){
			    
			    $response = new Response();
                $response->setContent($fileContent);
                $response->setStatusCode(Response::HTTP_OK);
                $response->headers->set('Content-Type', 'application/text');
                $response->headers->set('Content-length', $size);

				return $response;
				
			}else{
				return $self->returnErrorResponse("File doesn't exists.", "1018");
			}
		});
		
		return $controllers;
	}
	
	
	
}