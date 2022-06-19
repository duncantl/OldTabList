document.getElementById('refresh').addEventListener("click", function() { refresh(); } );
document.getElementById('delete').addEventListener("click", function() { deleteSelected(); } );
document.getElementById('group').addEventListener("click", function() { groupSelected(); } );

function refresh()
{
    let tbl = document.getElementById('OldTabsTable');
    let kids = tbl.children;
    // have to go in reverse or kids shrinks!
    for(let i = kids.length - 1; i > 1; i--)
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
		       daysAgo: daysAgo(new Date(t.lastAccessed))
		     });	    
	}

	tmp.sort((a, b) => a.time > b.time);
    
	showTabInfo(tmp)
    });
}

var TabInfo = null;

function showTabInfo(obj)
{
    TabInfo = obj;
    let tbl = document.getElementById('OldTabsTable');
    let now = new Date();

    let maxNumDays = numDaysAgo(new Date(obj[0].time));
    
    obj.forEach( t => {
	let tr = document.createElement("tr");

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
	td.appendChild(a);
	tr.appendChild(td);


	td = document.createElement("td")
	td.innerHTML = t.daysAgo;
	let numDays = numDaysAgo(new Date(t.time));
//	alert("color " + "  " + numDays + " " + maxNumDays + " " + getDaysAgoColor(numDays/maxNumDays));
	td.style.color = getDaysAgoColor(numDays/maxNumDays); // "red"
	tr.appendChild(td);	
	
	let date = new Date(t.time);
	td = document.createElement("td")
	td.innerHTML = formatDate(date); // date.toLocaleString();
	tr.appendChild(td);


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


showAllSortedTabs();


var selected = {};

function select(tab, box)
{
    if( selected.hasOwnProperty(tab.id)) 
	delete selected[tab.id];
    else
	selected[tab.id] = true;
}

function deleteSelected()
{
    alert(Object.keys(selected).length + " tabs selected");
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

