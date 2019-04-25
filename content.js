function grayOutWeekends(mutList) {
  if (mutList != undefined) {
    mutList
      .map(mutation => mutation.addedNodes[0] || mutation.target)
      .filter(node => node.matches && node.matches("[role='main']"))
      .map(grayOutDay)
  }
}

function grayOutDay(mainCal) {
  var nodes = mainCal.querySelectorAll(
    "div[role='columnheader'],div[data-datekey]:not([jsaction])")
  for (node of nodes) {
    if (node.getAttribute("role") == "columnheader") {
      // This is a gross hack, but inspecting the page shows that the first
      // child is a <span> containing "Sat/Sun" or "Saturday/Sunday"
      if (node.children[0].innerHTML[0] == "S") {
        node.style.backgroundColor = "#eeeeee";
      }
      continue
    }
    var datekey = node.getAttribute("data-datekey");
    if (!datekey) {
      console.log("could not read expected attribute 'data-datekey'")
      continue
    }
    datekey = parseInt(datekey)
    var year = datekey>>9
    var month = (datekey & 511)>>5
    var day = datekey & 31
    var date = new Date(
      1970 + year,
      month - 1, // JS date indexes months from 0 for some reason
      day);
    var dayOfWeek = date.getDay();
    if (dayOfWeek == 0 || dayOfWeek == 6) {
      node.style.backgroundColor = "#eeeeee";
    }
  }
}

mut = new MutationObserver(grayOutWeekends)
mut.observe(document.body, {
  "subtree": true,
  "childList": true,
  "attributes": true
})
