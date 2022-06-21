var leastRecent = true; // false; // true;
var sortVar = 'lastAccessed';

var showHost = true;


document.getElementById('refresh').addEventListener("click", function() { refresh(); } );
document.getElementById('delete').addEventListener("click", function() { deleteSelected(); } );
document.getElementById('group').addEventListener("click", function() { groupSelected(); } );

document.getElementById('toggleHost').addEventListener("click", function() { showHost = !showHost; refresh(); } );
document.getElementById('reverseOrder').addEventListener("click", function() { leastRecent = !leastRecent; refresh(); } );
document.getElementById('sortBy').addEventListener("click", function(ev) {
    sortVar = ev.target.value;
    refresh();
});

var originalHostStyle = document.getElementById('OldTabsTable').children[0].children[0].children[4].style;

function refresh()
{
    let tbl = document.getElementById('OldTabsTable');
    let kids = tbl.children;
    // have to go in reverse or kids shrinks!
    for(let i = kids.length - 1; i > 0; i--)
	tbl.removeChild(kids[i]);


    // https://www.w3schools.com/jsref/prop_style_display.asp
    let host_th = tbl.children[0].children[0].children[4];
    if(showHost)
	host_th.style = originalHostStyle;
    else
	host_th.style.display = "none";

    console.log("num children in table now " + kids.length);    
    showAllSortedTabs();
}


function showAllSortedTabs()
{
    let q = browser.tabs.query({});

    q.then( (tabs) => {

	let tmp = [];
/*	
        for(let t of tabs) {
	    tmp.push({ time: t.lastAccessed, title: t.title,
		       url: t.url, index: t.index, id: t.id,
		       windowId:  t.windowId,
		       daysAgo: daysAgo(new Date(t.lastAccessed)),
		       lastAccessed: t.lastAccessed,
		       favIconUrl: t.favIconUrl
		     });	    
	}
*/
	tmp = tabs;
	tmp.sort(leastRecent ? (a, b) => a[sortVar] > b[sortVar] :
		               (a, b) => a[sortVar] <= b[sortVar]);
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

    const fragment = new DocumentFragment();

    let ctr = 1;
    let winId = -1;
    let bgColors = ["white", "lightgrey"];
    let bgIndex = 0;
    obj.forEach( t => {

	if(t.windowId != winId) {
	    winId = t.windowId;
	    bgIndex = (bgIndex == 0) ? 1 : 0;
	}
	
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
	if(sortVar == 'windowId') {
	    td.style.background =  bgColors[bgIndex];
	}
	
	let a = document.createElement("a");

	a.innerHTML = " <img src=" + t.favIconUrl + " width=16px height=16px>" + t.title.substring(0, 45)  ;
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
	

	fragment.appendChild(tr);
    });

    tbl.appendChild(fragment);
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

    browser.tabs.remove(tids).then(cleanDeleted, () => null);
}

function cleanDeleted()
{
    let tids = Object.keys(selected);
    let tbl = document.getElementById('OldTabsTable');

    
    for(let i = 0; i < tids.length; i++) {
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



function groupSelected()
{
    let tids = Object.keys(selected);
    
    if(tids.length == 0)
	return(false);
    
    for(let i = 0; i < tids.length ; i++) {
	    tids[i] = parseInt(tids[i]);
    }
    
    browser.runtime.sendMessage({action: "newWindow", tabs: tids, preface: ""});
}


// tabsByDomain();
document.getElementById("btn.groupByDomain").addEventListener("click",  function() { groupByDomain(3); });





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