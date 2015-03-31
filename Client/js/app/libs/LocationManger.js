var fromProjection = new OpenLayers.Projection("EPSG:4326");
var toProjection = new OpenLayers.Projection("EPSG:900913");

SPIKA_LocationManager = {
	
	mapViewer:null,
	mapCoordinate:null,
	renderToDiv:'',
	mapInteractionEnabled:false,
	pointLayer:null,
	currentPoint:null,
	
	onClose:function(){
		alert("i will close now");
	},
	
	showMap:function(showInDiv, divIsCell, coordinates){
		
		this.renderToDiv = showInDiv;
		
		if(divIsCell){
			this.mapCoordinate = new OpenLayers.LonLat(coordinates.longitude, coordinates.latitude).transform(fromProjection, toProjection);		
		}else{
			this.mapCoordinate = new OpenLayers.LonLat(coordinates.coords.longitude, coordinates.coords.latitude).transform(fromProjection, toProjection);			
		}

		
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
		}
		
		var mapLayer = new OpenLayers.Layer.OSM();

		this.pointLayer = new OpenLayers.Layer.Vector("point");
				
		var point = new OpenLayers.Feature.Vector(
		  	new OpenLayers.Geometry.Point(this.mapCoordinate.lon, this.mapCoordinate.lat),
		  	{some:"data"},
		  	{externalGraphic:'img/locationPin.png',graphicHeight:40,graphicWidth:35}		  	
	  	);
		this.pointLayer.addFeatures(point);
		
		this.mapViewer.addLayers([mapLayer, this.pointLayer]);
		
  	},
  	
  	addPoint:function(e){
	  	
	  	alert(this.mapViewer.getLayerPxFromViewPortPx(e.xy));
	  	
  	},
  	
  	removePoint:function(point){
	  	
	  	this.pointLayer.removeFeatures(this.mapCoordinate,true);
	  	
  	},
  	
  	getPoint:function(){
	  	return new OpenLayers.LonLat(this.mapCoordinate.lon, this.mapCoordinate.lat).transform(toProjection, fromProjection);
  	}
  	
  	
}