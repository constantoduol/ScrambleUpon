var loader={
      start:function (loadId,width,height,delay){
	       var pos=dom.el(loadId); 
		   if(delay==null){
		     delay=100;
			}
		   animate();
	       function animate(){ 
		      pos.innerHTML="";
		    for(var x=0; x<50; x++){
		      var wid=getWidth(x,50,width);
		      if(x%2!==0){
		    	  var table=dom.newEl("table");
		    	  table.attr("style","margin-left : 100px");
		    	  if(x===1){
		    		 table.attr("style","margin-top : 100px; margin-left :100px");  
		    	  }
				  table.attr("width",wid);
				  table.attr("height",height);
		    	  var id=loadId+Math.floor(1000*Math.random());
		    	  var tr=dom.newEl("tr");
		    	  tr.attr("id",id);
		    	  var td1=dom.newEl("td");
		    	  var td2=dom.newEl("td");
		    	  var td3=dom.newEl("td");
		    	  var td4=dom.newEl("td");
		    	  var td5=dom.newEl("td");
		    	  var td6=dom.newEl("td");
		    	  tr.add(td1);
		    	  tr.add(td2);
		    	  tr.add(td3);
		    	  tr.add(td4);
		    	  tr.add(td5);
		    	  tr.add(td6);
		    	  table.add(tr);
		    	  pos.add(table);
		    	  generateRandom(id,loadId);
		       }
		      else{
		    	  var table=dom.newEl("table");
				  table.attr("width",wid);
				  table.attr("height",height);
				  table.attr("style","margin-left : 100px");
		    	  var id=loadId+Math.floor(1000*Math.random());
		    	  var tr=dom.newEl("tr");
		    	  tr.attr("id",id);
		    	  tr.attr("bgcolor","#51CBEE");
		    	  var td1=dom.newEl("td");
		    	  var td2=dom.newEl("td");
		    	  var td3=dom.newEl("td");
		    	  var td4=dom.newEl("td");
		    	  var td5=dom.newEl("td");
		    	  var td6=dom.newEl("td");
		    	  tr.add(td1);
		    	  tr.add(td2);
		    	  tr.add(td3);
		    	  tr.add(td4);
		    	  tr.add(td5);
		    	  tr.add(td6);
		    	  table.add(tr);
		    	  pos.add(table);
		      }
		     }
			}
	       
	    function getWidth(x,total,width){
	       var halfway=total/2;
	       if(x >= halfway){
	    	  //we are in the lower half 
	    	   return (total-x)/halfway*width;
	       }
	       else{
	    	  //we are in the upper half 
	    	  return x/halfway*width;
	       }
	    }
			 
		function refreshAnimation(id,loadId){
			var timeOut=setTimeout(
			    function(){
			       generateRandom(id,loadId);
			     }
			 ,delay); 
			dom.el(loadId).attr("timeout",timeOut);
		 }
			 
		 function generateRandom(id,loadId) {
		      var rands=[];
			  for(var x=0; x<18; x++){
			    rands.push(getRand()); 
			  }
			  var pos=dom.el(id);
			  if(pos===null){
				 return;
			  }
			  var x=0;
			  var child = pos.firstChild;
              while(child){
                if(child.nodeName.toLowerCase() == 'td'){
				    child.setAttribute("bgcolor",rands[x]);
                }
               child = child.nextSibling;
			   x++;
             }
			refreshAnimation(id,loadId);
		  }
		
		function getRand(){
		   return  "#"+((1<<24)*Math.random()|0).toString(16);
		}	
	   },
	   
	   stop:function(id){
	     var timeOut= dom.el(id).getAttribute("timeout");
		 clearTimeout(timeOut);
	     dom.el(id).innerHTML="";
	   }
	   



}