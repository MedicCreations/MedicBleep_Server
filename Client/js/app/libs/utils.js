var U = {
    l : function(obj){
        console.log(obj);
    },
    formatDate : function(ut){
        
        // multiplied by 1000 so that the argument is in milliseconds, not seconds
        var date = new Date(ut*1000);
        // hours part from the timestamp
        var hours = date.getHours();
        // minutes part from the timestamp
        var minutes = date.getMinutes();
        // seconds part from the timestamp
        var seconds = date.getSeconds();
        
        // will display time in 10:30:23 format
        var month = date.getMonth() + 1;
        var day = date.getDate();
        
        if(hours < 10)
            hours = '0' + hours;
            
        if(minutes < 10)
            minutes = '0' + minutes;
            
        if(seconds < 10)
            seconds = '0' + seconds;
        
        
        if(month < 10)
            month = '0' + month;
        
        if(day < 10)
            day = '0' + day;
        
        var formattedTime = month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        
        var nowDate = new Date();
        var now = new Date().getTime() / 1000;
        var interval = now - ut;
        
        if(interval < 60){
            return 'now';
        }
        else if(interval < 60*60){
            return  Math.floor(interval / 60) + " min ago";
        }
        else if(interval < 60*60*24){
            return  Math.floor(interval / 60 / 60) + " hours ago";
        }
        else if(nowDate.getDate() == date.getDate() && nowDate.getMonth() == date.getMonth() && nowDate.getYear() == date.getYear()){
            return  hours + ':' + minutes + ':' + seconds;
        }
        else{
            formattedTime;
        }
        
        
        return formattedTime;
    },
    playsound : function(soundId){

    },
    resize : function(file, max_width, max_height, compression_ratio, imageEncoding, listener){
    
        var fileLoader = new FileReader(),
        canvas = document.createElement('canvas'),
        context = null,
        imageObj = new Image(),
        blob = null;            
    
        //create a hidden canvas object we can use to create the new resized image data
        canvas.id     = "hiddenCanvas";
        canvas.width  = max_width;
        canvas.height = max_height;
        canvas.style.visibility   = "hidden";   
        document.body.appendChild(canvas);  
    
        //get the context to use 
        context = canvas.getContext('2d');  
    
        // check for an image then
        //trigger the file loader to get the data from the image         
        if (file.type.match('image.*')) {
            fileLoader.readAsDataURL(file);
        } else {
            alert('File is not an image');
        }
    
        // setup the file loader onload function
        // once the file loader has the data it passes it to the 
        // image object which, once the image has loaded, 
        // triggers the images onload function
        fileLoader.onload = function() {
            var data = this.result; 
            imageObj.src = data;
        };
    
        fileLoader.onabort = function() {
            alert("The upload was aborted.");
        };
    
        fileLoader.onerror = function() {
            alert("An error occured while reading the file.");
        };  
    
        // set up the images onload function which clears the hidden canvas context, 
        // draws the new image then gets the blob data from it
        imageObj.onload = function() {  
            
            var self = this;
            
            var left = 0;
            var top = 0;
            var size = 0;
            
            if(this.height > this.width){            
                left = 0;
                top = (this.height - this.width) / 2;
                size = this.width;
            }else{
                left = (this.width - this.height) / 2;
                top = 0;
                size = this.height;
            }
            
            // Check for empty images
            if(this.width == 0 || this.height == 0){
                alert('Image is empty');
            } else {                
    
                context.clearRect(0,0,max_width,max_height);
                context.drawImage(imageObj, left, top, size, size, 0, 0, max_width, max_height);
    
                blob = dataURItoBlob(canvas.toDataURL(imageEncoding));
    
                listener(blob);
            }       
        };
    
        imageObj.onabort = function() {
            alert("Image load was aborted.");
        };
    
        imageObj.onerror = function() {
            alert("An error occured while loading image.");
        };
    
    },
    getWidth : function(){
    
        if(WINDOW_MODE){
            return $(window).width();        
        }else{
            return $(HOLDER).width(); 
        }
    },
    getHeight : function(){
        if(WINDOW_MODE){
            return $(window).height();        
        }else{
            return $(HOLDER).width(); 
        }
    },
    sel:function(selector){
        return HOLDER + ' ' + selector;
    },
    updateUnread:function(unreadnum){
        var title = "Spika";
       
        if(unreadnum > 0){
            title += " (" + unreadnum + ")"; 
        }
        
        document.title = title;

    },
    convertHexToString : function(input) {

        // split input into groups of two
        var hex = input.match(/[\s\S]{2}/g) || [];
        var output = '';
    
        // build a hex-encoded representation of your string
        for (var i = 0, j = hex.length; i < j; i++) {
            output += '%' + ('0' + hex[i]).slice(-2);
        }
    
        // decode it using this trick
        output = decodeURIComponent(output);
    
        return output;
    }

}

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  var blob = new Blob([ab], {type: mimeString}); 
  return blob;

}

function genTmplPath(fileName){
    return 'thirdparty/text!templates/' + genTmplPath;
}