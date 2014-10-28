var dom={
    /**
     *
     * returns an element with the specified id
     */
   el : function(id){
       var element=document.getElementById(id);
       if(element){
         element.attr=function(name,value){
          this.setAttribute(name,value); 
        };
        element.add=function(elem){
          this.appendChild(elem); 
        };
       }
       return element;
   },
   
   /**
    *creates a new element with the specified tag name
    */
   newEl : function (tag){
      var element=document.createElement(tag);
       element.attr=function(name,value){
          this.setAttribute(name,value); 
       };
       element.add=function(elem){
          this.appendChild(elem); 
       };
      return element;
   },
   
   /**
    *
    * checks whether the document has completely loaded
    */
   ready : function (){
     if(document.readyState=="complete"){
        return true; 
      }
     else{
       return false;
     }
   },
   /**
    * 
    * returns an array of elements with the specified tag name
    *
    */
   tags : function(name){
      return document.getElementsByTagName(name);   
   },
   
   /**
    *waits till the document is ready and then executes the function func
    */
   waitTillReady : function(func){
      var time=setInterval(function(){
          if(dom.ready()){
            clearInterval(time); 
            func();
          }  
      },5); 
      
   },
   
     /**
    *waits till the document is ready and then executes the function func
    */
   waitTillElementReady : function(id,func){
      var time=setInterval(function(){
          if(dom.el(id)){
            clearInterval(time); 
            func();
          }  
      },5); 
      
   }
   
   

}

var funcs={} // namespace for functions



window.cookieStorage = {
    getItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    key: function (nKeyId) {
      return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
    },
    setItem: function (sKey, sValue) {
      if(!sKey) { return; }
      document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      this.length = document.cookie.match(/\=/g).length;
    },
    length: 0,
    removeItem: function (sKey) {
      if (!sKey || !this.hasOwnProperty(sKey)) { return; }
      document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      this.length--;
    },
    hasOwnProperty: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    }
  };
  window.cookieStorage.length = (document.cookie.match(/\=/g) || window.cookieStorage).length;



var ui={
  /*
  *  ui appends the input
  *
  * value
  * onclick
  * class
  * other attributes
  * 
  */
  element: function(attr){
     var run=function(id){
         var com=dom.newEl(attr.tag);
	     com.attr("id",id);
         delete attr.tag;
         for(var param in attr){
           if(typeof attr[param]=="function"){
             var func=attr[param];
             var str=func.toString();
             var funcBody=str.substring(str.indexOf("("));
             var funcName="function_"+Math.floor(Math.random()*100000000)+" ";
             var newFunc="funcs."+funcName+"= function "+funcName+funcBody;
             eval(newFunc);
             com.attr(param,"funcs."+funcName+"()"); 
           }
          else if(param=="content"){
	        com.innerHTML=attr[param];
	      }
          else if(param=="style"){
  	        for(var styleAttr in attr[param]){
  	          	com.style[styleAttr]=attr[param][styleAttr];
  	        }
  	      }
          else{
            com.attr(param,attr[param]);
          }
        }
        if(attr.parent){
          //append this element to the specified parent
            if( typeof attr.parent=="string"){
		    dom.el(attr.parent).appendChild(com);
	      }
	    else {
	         attr.parent.appendChild(com);
	     }
         delete attr.parent;
  	    }
       else{
        dom.tags("body")[0].appendChild(com);
       }	
      return com;	  
     }
	 
       function wait(func,id){
	      var time=setInterval(function(){
          if(dom.ready()){
            clearInterval(time); 
            func(id);
          }  
        },5);
     }
     if(!attr.id){
            // bind this id if none is specified
       attr.id="element_"+Math.floor(Math.random()*1000000);
     } 
     wait(run,attr.id); // run this function only after the document is ready
     return attr.id;
 },
 
 /**
  * this defines various layouts 
  *
  */
 layout : {
   // this stores layout managers
       basicLayout : {
    	  resizables : [],
          init : function(el){	  
              var menu=ui.element({
            	tag : "div",
            	id : "ui_menu_bar",
            	parent : el,
            	style : {
            	  width : ui.layout.basicLayout.getDim()[0]+"px",
            	  background : "lightgray",
            	  height : ui.layout.basicLayout.getDim()[1]*0.05+"px",
            	}
              });
              
              var divOne=ui.element({
              	tag : "div",
              	id : "ui_div_one",
              	parent : el,
              	style : {
              	  width : ui.layout.basicLayout.getDim()[0]*0.7+"px",
              	  background : "lightgreen",
              	  height : ui.layout.basicLayout.getDim()[1]*0.95+"px",
              	  "float" : "right"
              	 }
                });
               var divTwo= ui.element({
                	tag : "div",
                	id : "ui_div_two",
                	parent : el,
                	style : {
                	  width : ui.layout.basicLayout.getDim()[0]*0.3+"px",
                	  background : "lightblue",
                	  height : ui.layout.basicLayout.getDim()[1]*0.95+"px"
                	}
                });
                var menuRes={id : menu, width : 1, height : 0.05};
                var divOneRes={id : divOne, width : 0.7, height : 0.95};
                var divTwoRes={id : divTwo, width : 0.3, height : 0.95};
                ui.layout.basicLayout.resizables.push(menuRes,divOneRes,divTwoRes);
                window.onresize=ui.layout.basicLayout.resize;
               
             },
             resize: function(){
                var arr=ui.layout.basicLayout.resizables;
                for(var index in arr){
               	   var obj=arr[index];
               	   var element=dom.el(obj.id);
               	   element.style.width=ui.layout.basicLayout.getDim()[0]*obj.width+"px";
                   element.style.height=ui.layout.basicLayout.getDim()[1]*obj.height+"px";
                }
              },
        	  
        	 getDim: function(){
        	     var body = window.document.body;
        	     var screenHeight;
        	     var screenWidth;
        	     if (window.innerHeight) {
        	    	 screenHeight = window.innerHeight;
        	    	 screenWidth = window.innerWidth;
        	     } else if (body.parentElement.clientHeight) {
        	    	 screenHeight = body.parentElement.clientHeight;
        	    	 screenWidth = body.parentElement.clientWidth;
        	      } else if (body && body.clientHeight) {
        	    	  screenHeight = body.clientHeight;
        	    	  screenWidth = body.clientWidth;
        	     }
        	     return [screenWidth,screenHeight];        
        	  }
          }
       }
    	  
 
};







var Ajax={
    /**
     *@param data the data to be pushed to the server
     */
    run:function(data){  
       /*
        * url
        * loadArea
        * data
        * type
        * success
        * error
        */
      
           //show that this page is loading
      if(data.loadArea){
        dom.el(data.loadArea).style.display="block";
      }
      function callback(xhr){
        return function(){
         if (xhr.readyState === 4) {
           if (xhr.status === 200) {
             var resp=xhr.responseText;
             var json=JSON.parse(resp);
             if(data.success!==null){
                  if(json.type==="auth_url"){
                      window.location=json.data;   
                   }
                  else if(json.msg==="error"){
                	 setInfo(json.data.error);
                  }
                  else{
                     data.success(json); 
                   }
               }

           } else {
             if(data.error!==null){
                if(data.loadArea){
                  dom.el(data.loadArea).style.display="none";
                 }
                data.error(data);
             }  
           }
          }
        }
      }
        
      return function(){
           var xhr=getRequestObject();
           if(data.error!=null){
              if(xhr.onerror){
                xhr.onerror=data.error; 
              } 
           }
           sendJSON(data.url,data.data,xhr,callback(xhr),data.type);
     }();
     
    }
 
   
    
};










/*
 * this function returns an xml http object
 */

function getRequestObject(){
    if(window.ActiveXObject){
      return new ActiveXObject("Microsoft.XMLHTTP");  
    }
    else if(window.XMLHttpRequest){
       return new  XMLHttpRequest();
    }
    else{
       return null; 
    }
    
}






/**
 * used to send json data to the server
 * @param serverUrl the url to the server where the data is to be sent
 * @param json this is the json data to be sent to the server
 * @param request this is the xmlhttp request object
 * @param callback this is the callback function
 * @param type post or get
 */
function sendJSON(serverUrl,json,request,callback,type){
    json="json="+JSON.stringify(json);
    request.onreadystatechange=callback;
    if(type.toUpperCase()=="GET"){
      serverUrl=serverUrl+"?"+json
      request.open("GET", serverUrl, true);
      request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      request.send(); 
    }
    else if(type.toUpperCase()==="POST"){
      request.open("POST", serverUrl, true);
      request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      request.send(json); 
    }
}





