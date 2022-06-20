+ Can copy a profile and work with that rather than change the live settings of one's 
  Web browser
  
+  sidebar_action versus browser_action for popup versus page_action for processing pages. 

+ Won't allow javascript directly in the HTML
   + onload
   + <script> text
   
+ For output on the console, set extensions.sdk.console.logLevel  to "all" in about:config
   + https://stackoverflow.com/questions/12893981/logging-to-console-from-firefox-extension
    
+ When create a new window,
   + focused: false doesn't seem to work
   + when the window is created, the popup disappears and so any code left to run in that
     function doesn't get run
   + send a message to the persistent background process.
   
   
+ https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions   
 


