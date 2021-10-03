// grayOutWeekends is called on any DOM mutations that affect the calendar
// element (e.g. user going to the next/previous month) and is responsible for
// pulling the calendar element out of the mutation object and re-coloring the
// appropriate divs inside the calendar element (with 'applyColor').
function grayOutWeekends(mutList) {
  if (mutList != undefined) {
    mutList
      .map(mutation => mutation.addedNodes[0] || mutation.target)
      .filter(node => node.matches && node.matches("[role='main']"))
      .map(applyColor);
  }
}

// applyColor recolors the appropriate divs in the calendar element, passed in
// 'mainCal' by 'grayOutWeekends' (which calls this when the calendar element
// changes) and 'chrome.storage.onChanged' at the bottom (which calls this when
// the user's settings change).
function applyColor(mainCal) {
  let nodes = mainCal.querySelectorAll(
    "div[role='columnheader'],div[data-datekey]:not([jsaction])");
  for (const node of nodes) {
    // color header divs (containing e.g. "Sun")
    if (node.getAttribute("role") == "columnheader") {
      // This is a gross hack, but inspecting the page shows that the first
      // child is a <span> containing "Sat/Sun" or "Saturday/Sunday"
      if (node.children[0].innerHTML[0] == "S") {
        node.style.backgroundColor = "#eeeeee";
      }
      continue;
    }

    // color date divs (for a particular date. See README on github for
    // discussion of 'data-datekey').
    let datekey = node.getAttribute("data-datekey");
    if (!datekey) {
      console.log("could not read expected attribute 'data-datekey'");
      continue;
    }
    datekey = parseInt(datekey);
    let year = datekey>>9;
    let month = (datekey & 511)>>5;
    let day = datekey & 31;
    let date = new Date(
      1970 + year,
      month - 1, // JS date indexes months from 0 but gcal does not
      day);
    let dayOfWeek = date.getDay();
    if (dayOfWeek == 0 || dayOfWeek == 6) {
      node.style.backgroundColor = "#eeeeee";
    }
  }
}

// Update color whenever the DOM is updated
mut = new MutationObserver(grayOutWeekends);
mut.observe(document.body, {
  "subtree": true,
  "childList": true,
  "attributes": true
});
