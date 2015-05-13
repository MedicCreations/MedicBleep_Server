
SPIKA_LocationManager = {
	
	mapViewer:null,
	mapCoordinate:null,
	oldMapCoordinate:null,
	renderToDiv:'',
	mapInteractionEnabled:false,
	pointLayer:null,
	currentPoint:null,
	currentCountry:'',
/*
	fromProjection: new OpenLayers.Projection("EPSG:4326"),
	toProjection: new OpenLayers.Projection("EPSG:900913"),
*/
	
	onClose:function(){
		alert("i will close now");
	},
	
	showMap:function(showInDiv, divIsCell, coordinates){
		
		var self = this;
		
		this.renderToDiv = showInDiv;
		
		var fromProjection = new OpenLayers.Projection("EPSG:4326");
		var toProjection = new OpenLayers.Projection("EPSG:900913");

		
		if(divIsCell){
			this.mapCoordinate = new OpenLayers.LonLat(coordinates.longitude, coordinates.latitude).transform(fromProjection, toProjection);		
		}else{
			this.mapCoordinate = new OpenLayers.LonLat(coordinates.coords.longitude, coordinates.coords.latitude).transform(fromProjection, toProjection);			
		}

		this.oldMapCoordinate = this.mapCoordinate;
		
		this.mapViewer = new OpenLayers.Map({
			div:this.renderToDiv,
			maxExtent: new OpenLayers.Bounds(
		        -20037508.34, -20037508.34, 20037508.34, 20037508.34
		    ),
		    center: this.mapCoordinate,
		    controls:[],
		    zoom: 6
		});
		
		if(!divIsCell){
			this.mapViewer.addControl(new OpenLayers.Control.Navigation());	
			this.mapViewer.addControl(new OpenLayers.Control.ArgParser());	
			this.mapViewer.addControl(new OpenLayers.Control.Attribution());
			
			OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
                    //A click happened!
                    var lonlat = self.mapViewer.getLonLatFromViewPortPx(e.xy)
                    
//                     lonlat.transform(fromProjection, toProjection);
                    self.addPoint(lonlat);                   
/*
                    alert("You clicked near " + lonlat.lat + " N, " +
                                              + lonlat.lon + " E");
*/
                }

            });
			
			var click = new OpenLayers.Control.Click();
			
			this.mapViewer.addControl(click);
			click.activate();
		}
		
		var mapLayer = new OpenLayers.Layer.OSM();

		this.pointLayer = new OpenLayers.Layer.Vector("point");
		
		self.addPoint(this.mapCoordinate);
		
		this.mapViewer.addLayers([mapLayer, this.pointLayer]);
		
  	},
  	
  	addPoint:function(pointToAdd){
		
		this.removeAllFeatures();
	  	
		var point = new OpenLayers.Feature.Vector(
			new OpenLayers.Geometry.Point(pointToAdd.lon, pointToAdd.lat),
			{some:"data"},
			{externalGraphic:'img/locationPin.png',graphicHeight:40,graphicWidth:35}		  	
		);
		
		this.mapCoordinate = new OpenLayers.LonLat(pointToAdd.lon, pointToAdd.lat);
		
		this.pointLayer.addFeatures(point);
	  	
  	},
  	
  	removeAllFeatures:function(){
	  	
	  	this.pointLayer.removeAllFeatures();
	  	
  	},
  	
  	resetPoint:function(){
  		this.addPoint(this.oldMapCoordinate);	
  	},
  	
  	getPoint:function(){
	  	
		var fromProjection = new OpenLayers.Projection("EPSG:4326");
		var toProjection = new OpenLayers.Projection("EPSG:900913");
		  	
		return new OpenLayers.LonLat(this.mapCoordinate.lon, this.mapCoordinate.lat).transform(toProjection, fromProjection);
	},
  	
	getCountry:function(){
		
		var self = this;
		
		if(!this.currentCountry){
			if(navigator.geolocation){

		    	var location = navigator.geolocation.getCurrentPosition(function(location){

/*
				var locationQuery = " http://nominatim.openstreetmap.org/reverse?format=json&lat=" + location.coords.latitude + "&lon=" + location.coords.longitude + "&addressdetails=1";
				
				$.ajax({
					type:"GET",
					beforeSend:function(request){
						request.setRequestHeader('Access-Control-Allow-Origin','http://134.0.78.160');
					},
					url:locationQuery,
					success:function(data){
						self.currentCountry = data.address.country_code.toUpperCase();
						return self.currentCountry;					 
					}
				});
				
				$.get(locationQuery, function(data){
					self.currentCountry = data.address.country_code.toUpperCase();
					return self.currentCountry;					 
				});					
*/
					
				geocoder = new google.maps.Geocoder();
				var latLng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
				geocoder.geocode({'latLng': latLng},function (results, status){
						if(status == google.maps.GeocoderStatus.OK){
							self.currentCountry = results[1].address_components[2].short_name;
							console.log(results[1].address_components[2].short_name);
							return self.currentCountry;
						}
				});
			    	
		    	});
	    	}else{
		    	alert("Browser doesn't support geolocation ");
	    	}	
		}else{
			return self.currentCountry;
		}
		
	},
	
	contactGoogleForGeolocation:function(location){

		var self = this;
		
		geocoder = new google.maps.Geocoder();
    	var latLng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    	geocoder.geocode({'latLng': latLng},function (results, status){
	    	if(status == google.maps.GeocoderStatus.OK){
// 		    	self.currentCountry = results[1].address_components[3].short_name;
		    	
				    	console.log(results[1].address_components[3].short_name);
	    	}
    	});
		
	}

}