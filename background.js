// console.log("running in background");

browser.runtime.onMessage.addListener(function(obj) {
    console.log("got message: " + obj); // not appearing in console.
    let tids = JSON.parse(obj.tabs);
    let p = browser.windows.create( { url: "about:blank", focused: true } );
    p.then(function(win) {
             let p = browser.tabs.move( tids, { windowId: win.id, index: 0 } );
	// remove the final tab in the new window.
	     p.then(() => {
             	        browser.tabs.query({windowId: win.id}).then(
   		            (tabs) => browser.tabs.remove( tabs[tabs.length-1].id ),
		            () => console.log("error querying tabs")
 	           );
           })},
           function(err) { console.log("failed to create window"); } );

});
				     