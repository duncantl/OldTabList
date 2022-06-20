var leastRecent = false; // true;

var showHost = true;

document.getElementById('refresh').addEventListener("click", function() { refresh(); } );
document.getElementById('delete').addEventListener("click", function() { deleteSelected(); } );
document.getElementById('group').addEventListener("click", function() { groupSelected(); } );

document.getElementById('toggleHost').addEventListener("click", function() { showHost = !showHost; refresh(); } );
document.getElementById('reverseOrder').addEventListener("click", function() { leastRecent = !leastRecent; refresh(); } );

function refresh()
{
    let tbl = document.getElementById('OldTabsTable');
    let kids = tbl.children;
    // have to go in reverse or kids shrinks!
    for(let i = kids.length - 1; i > 0; i--)
	tbl.removeChild(kids[i]);

    console.log("num children in table now " + kids.length);    
    showAllSortedTabs();
}


function showAllSortedTabs()
{
    let q = browser.tabs.query({});

    q.then( (tabs) => {

	let tmp = [];
        for(let t of tabs) {
	    tmp.push({ time: t.lastAccessed, title: t.title,
		       url: t.url, index: t.index, id: t.id,
		       windowId:  t.windowId,
		       daysAgo: daysAgo(new Date(t.lastAccessed)),
		       lastAccessed: t.lastAccessed
		     });	    
	}

	tmp.sort(leastRecent ? (a, b) => a.lastAccessed > b.lastAccessed :
		               (a, b) => a.lastAccessed <= b.lastAccessed);
	showTabInfo(tmp);
    });
}

var TabInfo = null;

function showTabInfo(obj)
{
    TabInfo = obj;
    let tbl = document.getElementById('OldTabsTable');
    let now = new Date();

    let i = leastRecent ? 0 : obj.length-1;
    let maxNumDays = numDaysAgo(new Date(obj[i].lastAccessed));

    let ctr = 1;
    obj.forEach( t => {
	let tr = document.createElement("tr");
	tr.rowNum = ctr++;
	tr.tabId = t.id;

	let td = document.createElement("td");
	let b = document.createElement("input");
	b.type = "checkbox";
	b.addEventListener('change', function(e) {  select({id: t.id, windowId: t.windowId}, e.target); });
	td.appendChild(b);
	tr.appendChild(td);
	
	
	
	td = document.createElement("td");
	let a = document.createElement("a");
	a.innerHTML = t.title.substring(0, 45);
	let id = t.id;
	a.setAttribute("tabId",  t.id);
	a.addEventListener('click', function(e) {     showTab({id: t.id, windowId: t.windowId}); });
	a.setAttribute("title",  t.url);	
	td.appendChild(a);
	tr.appendChild(td);


	td = document.createElement("td")
	let numDays = numDaysAgo(new Date(t.lastAccessed));
	td.innerHTML = numDays;
	td.style.background = getDaysAgoColor(numDays/maxNumDays) + "70"; 
	tr.appendChild(td);	
	
	let date = new Date(t.lastAccessed);
	td = document.createElement("td")
	td.innerHTML = formatDate(date); // date.toLocaleString();
	tr.appendChild(td);

	if(showHost) {
	    td = document.createElement("td")
	    // https://dmitripavlutin.com/parse-url-javascript/
	    let u = new URL(t.url);
	    td.innerHTML =  u.host;
	    tr.appendChild(td);	
	}
	

	tbl.appendChild(tr);
    });
    
}


function numDaysAgo(date)
{
    let now = new Date();
    let days = Math.floor((now.getTime() - date.getTime())/(1000*60*60*24));
    return(days);
}


function daysAgo(date) {
    var days = numDaysAgo(date);
    if(days == 0)
	return("today");
    
    return( days + " days ago" );
}


function showTab(obj)
{
    chrome.tabs.update(obj.id, {active: true});    
    chrome.windows.update(obj.windowId, {focused: true});
}


//console.log("starting");    
showAllSortedTabs();
//console.log("done");    

var selected = {};

/*
 The tabId and row number are attributes in the <tr> elements of the table.
 The row numbers start at 1 so can index directly to the children of the <table>.
*/


function select(tab, box)
{
    // alert("select: " + tab + " " + box.parentElement);
    if( selected.hasOwnProperty(tab.id) ) 
	delete selected[tab.id];
    else {
	selected[tab.id] = box.parentElement.parentElement.rowNum;
	// alert("selected " + box.parentElement.parentElement.rowNum + " " + box.parentElement.parentElement.tabId);
    }
}

function deleteSelected()
{
    var tids = Object.keys(selected);
    for(let i = 0; i < tids.length; i++) {
	tids[i] = parseInt(tids[i]);
    }
//    alert(Object.keys(selected).length + " tabs selected: " + tids);

    browser.tabs.remove(tids).then(cleanDeleted, () => null);
}

function cleanDeleted()
{
    let tids = Object.keys(selected);
    let tbl = document.getElementById('OldTabsTable');

    // alert("removing rows from table " + JSON.stringify(selected) + " row " + selected[tids[0]]);
    
    for(let i = 0; i < tids.length; i++) {
	// alert("removing " + tbl.children[ selected[ tids[i] ] ].innerHTML);
	tbl.removeChild(tbl.children[ selected[ tids[i] ] ]);  // 
	//XXX remove from TabInfo and from selected
    }

    selected = [];
}




// https://stackoverflow.com/questions/25275696/javascript-format-date-time
function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return (date.getMonth() + 1) + "/" + date.getDate() + "  " + strTime;
}


// https://stackoverflow.com/questions/16360533/calculate-color-hex-having-2-colors-and-percent-position
function getDaysAgoColor(ratio)
{
    var color1 = 'FF0000';
    var color2 = '00FF00';
    var hex = function(x) {
	x = x.toString(16).toUpperCase();
	return (x.length == 1) ? '0' + x : x;
    };

    var r = Math.ceil(parseInt(color1.substring(0,2), 16) * ratio + parseInt(color2.substring(0,2), 16) * (1-ratio));
    var g = Math.ceil(parseInt(color1.substring(2,4), 16) * ratio + parseInt(color2.substring(2,4), 16) * (1-ratio));
    var b = Math.ceil(parseInt(color1.substring(4,6), 16) * ratio + parseInt(color2.substring(4,6), 16) * (1-ratio));

    
    return("#" + hex(r) + hex(g) + hex(b));
}



//

function groupSelected()
{
    let p = browser.windows.create({url: "about:blank"});
    p.then(function(win) {
	//XXX remove the first tab that was created automatically for this new window.
	
	console.log('Created new window ' + win + " " + win.type);

	var tids = Object.keys(selected);
	for(i =0; i < tids.length; i++) {
	    tids[i] = parseInt(tids[i]);
	}


	setTimeout(() => {
	    alert("moving " + tids);
	    var t = browser.tabs.getCurrent();
	    browser.scripting.executeScript({target: {tabId: t.id}, func: () => document.body.innerHTML = JSON.stringify(tids)});

	// works sometimes -	    
	    chrome.tabs.move( tids, {windowId: win.id, index: 0}).then(function(tab) { alert("moved " + tab.id);},
							           function(err) { alert("error moving " + err);});

	}, 450);
    },  (e) =>  alert("Failed to create window"));
}




//--------------------------------------

// monitor tab closures to update this table. However, we
// can't really close a tab when the popup is visible (?)
// Was more relevant when we thought we would have this UI in a tab of its own.
/*
function tabClosed(tab)
{
    for(i = 0; i < TabInfo.length; i++) {
	if(TabInfo[i].id == tab.id) {
	    let tbl = document.getElementById('OldTabsTable');
	    tbl.removeChild(tbl.children[i+1]);
	    //XXX remove from TabInfo and from selected
	}
    }
    
}

browser.tabs.onRemoved.addListener(tabClosed)
*/