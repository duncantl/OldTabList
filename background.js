// console.log("running in background");

browser.runtime.onMessage.addListener(function(obj) {
    console.log("got message: " + obj); // not appearing in console.
    let tids = JSON.parse(obj.tabs);
    let p = browser.windows.create( { url: "about:blank", focused: true } );
    p.then(function(win) {   browser.tabs.move( tids, { windowId: win.id, index: 0 } ); },
	   function(err) { console.log("failed to create window"); } );

});
				     