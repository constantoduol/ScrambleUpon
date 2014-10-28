package com.quest.scramble;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.api.datastore.Query.FilterPredicate;

@SuppressWarnings("serial")
public class ScrambleUponServlet extends HttpServlet {
	
	private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	
	private static final  int CATEGORY_LIMIT=20;
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		ensureLogin(req, resp);
	}
	
	private void processRequest(HttpServletRequest req, HttpServletResponse resp){
		 try {
             resp.setContentType("text/html;charset=UTF-8");  
             String json = req.getParameter("json");
             if(json==null){
                return;
             }
             JSONObject obj=new JSONObject(json);
             JSONObject headers = obj.optJSONObject("request_header");
             String msg=headers.optString("request_msg");
             JSONObject requestData=(JSONObject)obj.optJSONObject("request_object");
             if(msg.equals("init_data")){
            	 fetchInitData(resp);
             }
             else if(msg.equals("category_data")){
            	fetchCategoryData(resp,requestData); 
             }
             else if(msg.equals("save_game_state")){
             	saveGameState(resp,req, requestData);
              }
             else if(msg.equals("leader_board")){
            	 retrieveLeaderBoard(resp); 
             }
            
        } catch (Exception ex) {
            System.out.println(ex);
        } 	
	}
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		ensureLogin(req, resp);
	}
	
	  public void toClient(Object response,HttpServletResponse resp){
          try {
              JSONObject toClient=new JSONObject();
              toClient.put("data", response);
              PrintWriter writer = resp.getWriter();
              writer.println(toClient);
          } catch (Exception ex) {
             System.out.println(ex);
        }
   }
	
	private void fetchInitData(HttpServletResponse resp){
		//fetch categories
    	//fetch logout url	
	   try{
		 UserService userService = UserServiceFactory.getUserService();
		 String url=userService.createLogoutURL("https://scrambleupon.appspot.com/");
         Query query=new Query("Category");
         PreparedQuery pq=datastore.prepare(query);
         JSONArray arr=new JSONArray();
         for(Entity category : pq.asIterable()){
      	   String cat=(String) category.getProperty("value");
      	   arr.put(cat);
         }
		 JSONObject obj=new JSONObject();
		 obj.put("logout_url", url);
		 obj.put("categories",arr);
		 toClient(obj, resp);
	  }
	  catch(Exception e){
		  
	  }
	}
	
	private void fetchCategoryData(HttpServletResponse resp,JSONObject data){
	  try{
		 String category=data.optString("category");
		 Filter filter =new FilterPredicate("category",FilterOperator.EQUAL,category);
         Query query=new Query("Word").setFilter(filter);
         PreparedQuery pq=datastore.prepare(query);
         Iterable<Entity> iter=pq.asIterable();
         JSONArray arr=new JSONArray();
         Random rand=new Random();
         int count=0;
         for(Entity word : iter){
           boolean bool = rand.nextBoolean();
           if(bool){
      	     String wd=(String) word.getProperty("value");
      	     arr.put(wd);
      	     count++;
           }
           if(count==CATEGORY_LIMIT){
        	  break;
           }
         }
		 JSONObject obj=new JSONObject();
		 obj.put("words",arr);
		 toClient(obj, resp);
	  }
	  catch(Exception e){
		  
	  }
	}
	
   private void retrieveLeaderBoard(HttpServletResponse resp){
	 try{
	   Query query=new Query("User");
	   query.addSort("score", SortDirection.DESCENDING);
	   PreparedQuery pq=datastore.prepare(query); 
	   Iterable<Entity> iter=pq.asIterable(FetchOptions.Builder.withLimit(20));
	   JSONArray arr=new JSONArray();
	   for(Entity en : iter){
		 long score=(Long) en.getProperty("score");  
		 long lastPlayed=(Long) en.getProperty("last_played");
		 String userName=(String) en.getProperty("username");
		 String category=(String) en.getProperty("category");
		 JSONObject obj=new JSONObject();
		 obj.put("score",score);
		 obj.put("last_played",lastPlayed);
		 obj.put("username",userName);
		 obj.put("category",category);
		 arr.put(obj);
	   }
	   toClient(arr,resp);
	 }
	 catch(Exception e){
		System.out.println(e); 
		e.printStackTrace();
	 }
   }
   
   private void ensureLogin(HttpServletRequest req,HttpServletResponse resp) throws IOException{
	   UserService userService = UserServiceFactory.getUserService();
       User user = userService.getCurrentUser();
       if (user != null) {
           processRequest(req,resp);
       } else {
    	  try{
           String url=userService.createLoginURL("https://scrambleupon.appspot.com");
           JSONObject toClient=new JSONObject();
           toClient.put("data", url);
           toClient.put("type","auth_url");
           PrintWriter writer = resp.getWriter();
           writer.println(toClient);
    	  }
    	  catch(Exception e){
    		  
    	  }
       }
   }
	
   private void saveGameState(HttpServletResponse resp,HttpServletRequest req,JSONObject data){
	 //save difficulty
	 //save score
	 //save username
	   try{
	     int score=data.optInt("score");
	     String difficulty=data.optString("difficulty");
	     String category =data.optString("category");
	     UserService userService = UserServiceFactory.getUserService();
	     User currentUser=userService.getCurrentUser();
	     if(currentUser==null){
	    	toClient("success",resp);
	    	return;
	    
	     }
	     String email=currentUser.getEmail();
	     String name=currentUser.getNickname();
	     Filter filter =new FilterPredicate("email",FilterOperator.EQUAL,email);
	     Query query=new Query("User").setFilter(filter);
	     PreparedQuery pq=datastore.prepare(query);
	     int count=0;
	     for(Entity en : pq.asIterable()){
	      //if there is nothing create a new user
	    	long currentScore=(Long)en.getProperty("score");
	    	if(score>currentScore){
	    		en.setProperty("score", score);
	  	        en.setProperty("difficulty",difficulty);
	  	        en.setProperty("category",category);
	  	        en.setProperty("last_played",System.currentTimeMillis());
	  	       datastore.put(en);
	    	}
	       count++;
	     }
	    if(count==0){
	      Entity en=new Entity("User");
	      en.setProperty("username", name);
	      en.setProperty("email", email);
	      en.setProperty("score", score);
	      en.setProperty("category",category);
	      en.setProperty("difficulty",difficulty);
	      en.setProperty("last_played",System.currentTimeMillis());
	      datastore.put(en);
	    }
	    toClient("success",resp);
	   }
	  catch(Exception e){
		 e.printStackTrace();
		 toClient("success",resp);
	  }
   }
}
