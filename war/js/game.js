var game ={
		
		resizables : [],
		running : false,
		currentIndex : 0,
		currentScore : 0,
		score : 200,
		timeLimit : 30,
		timeRemaining : 30,
		difficulty : 50,
        wordDict : [],
        currentTimeId : 0,
        currentWord : "",
        category : "",
		categories : function(){
			var html=game.startLoad("Loading ...");
			var json={
	       	         request_header : {
	       	             request_msg : "init_data",
	       	           },
	       	        request_object : {
	       	         }
	       	     };
	       	    Ajax.run({
	       	        url : "/quest/scramble",
	       	        type : "post",
	       	        data : json,
	       	        error : function(err){ 
	       	          game.alert("Whoops","Something went wrong");  
	       	        },
	       	        success : function(json){
	       	           game.stopLoad();
	       	           var data=json.data.categories;
	       	           var area=dom.el("scramble_list");
	       	           for(var x=0; x<data.length; x++){
	       	        	 var opt=dom.newEl("option");
		       	         opt.text=data[x];
		       	         opt.value=data[x];
		       	         area.add(opt);
	       	           }
	       	        } 
	       	   });
		},
		wordList : function (cat,func){
			game.startLoad("Loading ...");
			var json={
       	         request_header : {
       	             request_msg : "category_data"
       	           },
       	        request_object : {
       	           category : cat
       	         }
       	     };
       	    Ajax.run({
       	        url : "/quest/scramble",
       	        type : "post",
       	        data : json,
       	        error : function(err){ 
       	          game.alert("Whoops","Something went wrong");  
       	        },
       	       success : function(json){
       	    	  game.stopLoad();
       	    	  game.wordDict=json.data.words;
       	    	  game.wordDict=game.shuffle(game.wordDict);
       	    	  game.category=cat;
       	          game.nextWord();
       	       } 
       	   }); 
		},
		startLoad : function(msg){
			var progArea=dom.el("form_area");  
        	var label=dom.newEl("label");
        	label.attr("id","load_area");
        	label.attr("style","font-size : 30px; margin-top : 10px;");
        	label.innerHTML=msg;
        	progArea.add(label)
		},
		stopLoad : function(){
			var loadArea=dom.el("load_area");
			var progArea=dom.el("form_area"); 
			progArea.removeChild(loadArea);
		},
	   shuffle : function (o){ //v1.0
		    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		    return o;
		},
		nextWord : function (){
	      if(!game.running){
	    	 return; 
	      }
	      var data=game.wordDict;
	      game.clearTimer();
	      clearTimeout(game.currentTimeId);
	      game.timeRemaining=game.timeLimit;
	      if(game.currentIndex>game.wordDict.length-1){
	    	  game.saveGameState();
	          showStart();
	          showShareBoard();
	          game.running=false;
	          game.currentIndex=0;
	      }
	      else{
	    	game.currentWord=game.wordDict[game.currentIndex];
	        $("#scramble_area").addClass("animated");
	        var html="<a href='#hint' onclick='game.hint()' title='Hint'>"+game.scramble(game.wordDict[game.currentIndex])+"</a>"
	        $("#scramble_area").html(html);
	    	game.updateTime();
	    	var func=function(){
	    	   $("#scramble_area").removeClass("animated");
	    	};
	    	game.runLater(func,3000);
	    	var time=game.runLater(game.nextWord, game.timeLimit*1000);
            game.currentTimeId=time;
            game.currentIndex++;
	      }
		},
		hint : function (){
		   var html="<a href='#hint' onclick='game.hint()' title='Hint'>"+game.currentWord+"</a>"
	       $("#scramble_area").html(html);	
		   game.runLater(game.nextWord, 3000);
		},
		saveGameState: function(){
			var json={
	       	         request_header : {
	       	             request_msg : "save_game_state",
	       	           },
	       	        request_object : {
	       	           score : game.currentScore,
	       	           difficulty : game.difficulty,
	       	           category : game.category
	       	         }
	       	     };
	       	    Ajax.run({
	       	        url : "/quest/scramble",
	       	        type : "post",
	       	        data : json,
	       	        error : function(err){ 
	       	          game.alert("Whoops","Something went wrong");  
	       	        },
	       	        success : function(json){
	       	         
	       	        } 
	       	   });	
		},
		init : function(){
		  game.resize();
		  game.categories();
		  window.onresize=game.resize;
		},
		alert: function(title,content){
		  dom.el("modal-title").innerHTML=title;
		  dom.el("modal-content").innerHTML=content;
		  $("#alert-window").modal();
		},
		start: function(category){
		   game.running=true;
		   game.wordList(category);	
		   dom.el("score_board").innerHTML="000";
		   game.currentScore=0;
		},
		startTimer: function(){
		  game.updateTime();
		},
		clearTimer : function(){
			 var href=dom.el("start_href");
			 if(!href){
				return;
			 }
         	 var timeOutId=href.getAttribute("timeout_id");
         	 if(timeOutId){
         	   clearTimeout(timeOutId);	 
         	 }
		},
		updateTime: function(){
			var area=dom.el("timer");
			var limit=game.timeRemaining;
			var time=setTimeout('game.updateTime()',1000); 
			if(limit<10){
			  limit="0"+limit;
			}
			if(area){
				area.innerHTML="<a href=#restart title='Restart the game' id='start_href' timeout_id="+time+" onclick='showStart()'>00:"+limit+"</a>";	
			}
			game.timeRemaining--;
			limit--;
		  },
		validate : function(entry){
		   if(!game.running){
			 return; 
		   }
		   if(entry.toUpperCase()===game.currentWord.toUpperCase()){
			  var score=parseInt(game.score*Math.exp(  -((game.timeLimit-game.timeRemaining)/game.timeLimit)));
			  game.currentScore=game.currentScore+score;
			  $("#score_board").html(game.currentScore);
			  $("#score_animation").html("+"+score);
			  $("#score_animation").addClass("scoreAnim");
			  var func=function(){
				 $("#score_animation").removeClass("scoreAnim");  
				 $("#score_animation").html("");
			  }
			  game.runLater(func, 3000);
			  game.nextWord();
		   }
		   else{
			 $("#scramble_area").addClass("error");
			 var func=function(){
			    $("#scramble_area").removeClass("error");
				game.nextWord();  
			 } 
			 game.runLater(func,2000);
		   }
		},
		scramble : function(word){
			  function doScramble(str){
				 var arr = str.split(" ");
				 var scrambled="";
				 for(var x=0; x<arr.length; x++){
				   scrambled=scrambled+" "+scramble(arr[x]);
				  }
				 return scrambled.trim();
				}

				function scramble(str) {
				    var scrambled = '',
				    randomNum;
				    while (str.length > 1) {
				    randomNum = Math.floor(Math.random() * str.length); 
				    scrambled += str.charAt(randomNum);
				    if (randomNum == 0) {
				      str = str.substr(randomNum + 1);
				    }
				    else if (randomNum == (str.length - 1)) {
				      str = str.substring(0, str.length - 1);
				    }
				    else {
				      str = str.substring(0, randomNum) + str.substring(randomNum + 1);
				    }
				  }
				  scrambled += str;
				  return scrambled;
				}
			return doScramble(word);
		},
		runLater : function(func,limit){
		   return setTimeout(func,limit);      
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
    	  },
    	  resize: function(){
              var arr=game.resizables;
              for(var index in arr){
             	   var obj=arr[index];
             	   var element=dom.el(obj.id);
             	   if(!element){
             		 //console.log("Element "+obj.id+" not found!");
             		 continue;  
             	   }
             	   element.style.width=game.getDim()[0]*obj.width+"px";
                   element.style.height=game.getDim()[1]*obj.height+"px";
                   if(obj.style){
                	 for(var style in obj.style){
                		var factor=obj.style[style].factor;
                		var along=obj.style[style].along;
                		if(along==="height"){
                			element.style[style]=factor*game.getDim()[1]+"px";
                		}
                		else if(along==="width"){
                			element.style[style]=factor*game.getDim()[0]+"px";
                		}
                	 }  
                   }
                   
              }
              
            }
		
		
		
		
}