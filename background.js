// console.log("running in background");

browser.runtime.onMessage.addListener(function(msg) {
    console.log("got message: " + JSON.stringify(msg)); // not appearing in console.
    const args = msg;

    switch(args.action) {
    case "newWindow":
	moveToNewWindow(args.tabs, args.preface);
	break;
    default:
	console.log("unknown message action: " + args.action);
    }
});


function moveToNewWindow(tabs, preface)
{
    let p = browser.windows.create( { url: "about:blank", focused: true, titlePreface: preface } );
    p.then(function(win) {
             let p = browser.tabs.move( tabs, { windowId: win.id, index: 0 } );
	// remove the final tab in the new window.
	     p.then(() => {
             	        browser.tabs.query({windowId: win.id}).then(
   		            (tabs) => browser.tabs.remove( tabs[tabs.length-1].id ),
		            () => console.log("error querying tabs")
 	           );
           })},
           function(err) { console.log("failed to create window"); } );
}


// Just a check we can intercept tab creation.
/*
browser.tabs.onCreated.addListener(function(tab) {
    console.log("got tab: " + tab.id);
    browser.tabs.update(tab.id, {url: "https://grad.ucdavis.edu"});
//    browser.tabs.executeScript({ code: "document.body.innerHTML = 'Hi'; console.log('hi');"});
});
*/