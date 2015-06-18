<?php
    include('init.php');
?>
<html lang="<?php echo LANG ?>">

	<head>
	    <meta charset="utf-8">
	    <title><?php echo APP_TITLE ?></title>
	
	    <link rel="stylesheet" href="css/style.css?rnd=<?php echo time() ?>">
	    <link rel="stylesheet" href="css/progressbar.css?rnd=<?php echo time() ?>">
	    <link href="css/font-awesome-4.2.0/css/font-awesome.min.css?rnd=<?php echo time() ?>" rel="stylesheet">
	    <link rel="stylesheet" href="js/thirdparty/highlight/styles/railscasts.css?rnd=<?php echo time() ?>">
	    <link rel="stylesheet" href="js/thirdparty/chosen/chosen.css?rnd=<?php echo time() ?>">
	    
	    <script type="text/javascript" src="js/lang/<?php echo LANG ?>.js?rnd=<?php echo time() ?>"></script>
		
		<script type="text/javascript"
	      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCS-Qq_tRVcXBhupjEgbnPoNgMHcR0UV9c">
	    </script>
		
	    <meta name="apple-mobile-web-app-capable" content="yes">
	    <meta name="apple-mobile-web-app-status-bar-style" content="black">
	    <meta name="apple-mobile-web-app-title" content="AMC Walking Dead Story Sync">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
	    
	</head>

	<body id="loading">
	
	    <article>
	    
	        <section>
	        
	            <p><i class="fa fa-spinner fa-spin fa-4x"></i></p>
	            <h1><?php echo APP_TITLE ?></h1>
	            
	        </section>
	        
	    </article>
	
	    <script type="text/javascript" src="js/app/init.js?rnd=<?php echo time() ?>"></script>
	    <script type="text/javascript" src="js/app/const.js?rnd=<?php echo time() ?>"></script>
	    <script type="text/javascript" src="js/thirdparty/simplewebrtc.bundle.js?rnd=<?php echo time() ?>" ></script>
	    <script type="text/javascript" src="js/thirdparty/require.js?rnd=<?php echo time() ?>" data-main="js/app/main"></script>
	
	
	</body>
</html>