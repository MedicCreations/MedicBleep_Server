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
	static $fileDirName = 'uploads';
	
	public function connect(Application $app) {
		$self = $this;
		
		$mySql = new MySqlDb ();
		
		$controllers = $app ['controllers_factory'];
		
		
		//image upload
		$controllers->post('/upload', function (Request $request) use ($app, $self, $mySql) {
				
			$file = $request->files->get(FileController::$paramName);
				
			$fineName = $mySql->randomString(20, 20) . time();
				
			if(!is_writable(__DIR__.'/../../../'.FileController::$fileDirName))
				return $self->returnErrorResponse(FileController::$fileDirName ." dir is not writable.", ER_DIR_NOT_WRITABLE);
		
			$file->move(__DIR__.'/../../../'.FileController::$fileDirName, $fineName);
			
			return $app->json(array("message" => "file uploaded", "code" => CODE_SUCCESS, "file_id" => $fineName,), 200);
		
		});
		
		
		//image download
		$controllers->get ( '/download', function (Request $request) use($app, $self, $mySql) {

			$requestBodyAry = $request->query->all();
			$fileID = $requestBodyAry['file_id'];
			$filePath = __DIR__.'/../../../'.FileController::$fileDirName."/".basename($fileID);
            
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
				return $self->returnErrorResponse("File doesn't exists.", "1010");
			}
		});
		
		return $controllers;
	}
	
	
	
}