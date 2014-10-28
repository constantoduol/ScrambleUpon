package com.quest.scramble;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;



public class UploadServlet extends HttpServlet {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	
	@Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		try {
		      ServletFileUpload upload = new ServletFileUpload();
		      response.setContentType("text/plain");

		      FileItemIterator iterator = upload.getItemIterator(request);
		      while (iterator.hasNext()) {
		        FileItemStream item = iterator.next();
		        InputStream stream = item.openStream();
		        if (item.isFormField()) {
		         // log.warning("Got a form field: " + item.getFieldName());
		        } else {
		           String filename = FilenameUtils.getName(item.getName());
		           String fileContents = IOUtils.toString(stream, "UTF-8");
	               String name=filename.substring(0,filename.lastIndexOf("."));
	               saveGameWords(name,fileContents);
		        }
		      }
		      response.getWriter().write("Upload completed successfully");
		    } catch (Exception ex) {
		      throw new ServletException(ex);
		    }
    }
		
	
	
 private void saveGameWords(String category,String words){
	  StringTokenizer tokenizer=new StringTokenizer(words,",");
	  List<Entity> newWords=new ArrayList<Entity>();
	  List<String> wordsAdded=new ArrayList<String>();
	  Entity cat = new Entity("Category");
	  cat.setProperty("value", category);
	  datastore.put(cat);
	  while(tokenizer.hasMoreTokens()){
		 String word=tokenizer.nextToken().trim();
		 if(wordsAdded.contains(word)){
			//in case we have two or more similar words, just continue
			continue;
		 }
		 Entity newWord = new Entity("Word");
		 newWord.setProperty("category", category);
		 newWord.setProperty("value", word);
		 wordsAdded.add(word);
		 newWords.add(newWord);
	  }
	  datastore.put(newWords);
	}
}
