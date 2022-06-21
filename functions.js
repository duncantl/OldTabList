// async

//var domains = {};
function tabsByDomain(domains)
{
    if(domains === undefined)
	domains = {};
    
    let p = browser.windows.getAll({populate: true});
   
    p.then( wins => {
	wins.forEach(w => w.tabs.forEach(t => {
	    let u = new URL(t.url);
//	    console.log("tabsByDomain: tab "  + t.id + " " + u.hostname);
	    let dom = u.hostname;
	    if(!domains.hasOwnProperty(dom))
		domains[dom] = [];
			     
	    domains[dom].push(t.id);
	})
		    );

/*	
	const counts = {};
	for(const k in domains)
	    counts[k] = domains[k].length;
	
	document.getElementById("temp").innerHTML = JSON.stringify(counts);
*/	
    } );

    return(p);
}


var DomainWhiteList = [""];

function groupByDomain(minThreshold)
{
    const d = {};
    tabsByDomain(d).then((w) => {

	console.log("groupByDomain: number of domains " + Object.keys(d).length + " " + JSON.stringify(Object.keys(d)))

	let others = [];

	let numWins = 0;
	for(let k in d) {
	    console.log("domain " + k + " " + d[k].length + " tabs");
	    
	    if(DomainWhiteList.includes(k)) {
		console.log("skipping '" + k + "'");
		continue;
	    }

	    
	    if(d[k].length >= minThreshold) {
		console.log(d[k].length + " tabs for "  + k);
		moveToNewWindow(d[k], k);
		numWins++;
	    } else 
		others = others.concat(d[k]);
	}
	
	if(others.length) {
	    console.log(others.length + " tabs going to combined window");
	    moveToNewWindow(others, "other");
	    numWins++;
	} else 
	    console.log("no tabs in other[]");

	console.log("number of windows = " + numWins);
    });
}

function moveToNewWindow(tids, domain)
{
    browser.runtime.sendMessage({action: "newWindow", tabs: tids, preface: domain + ": "});

/*    
    console.log("moveToNewWindow for " + domain + " " + JSON.stringify(tids));
     // {tabId: tids[0]})
    let p = browser.windows.create({url: "about:blank", titlePreface: domain + ": "});
	p.then( w => {
            // .slice(1, tids.length-1) 
	    browser.tabs.move( tids , {windowId: w.id, index: -1}).then( () => console.log("moved " + tids.length + " tabs to " + w.title), (err) => console.log("moving tabs failed : " +err));
	}).catch(err => console.log("Failed to create new window for " + tids.length + " tabs: " +  err));
*/
}

