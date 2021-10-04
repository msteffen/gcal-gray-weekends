// days is an Array mapping the output of date.getDay() to a key in the
// settings object
const days = [ "sun"
              , "mon"
              , "tue"
              , "wed"
              , "thu"
              , "fri"
              , "sat" ];

// defaultSettings stores the default "color settings" object, which is used if
// none is stored in chrome.storage under 'settingsKey'
const defaultSettings = { "sun": "#eeeeee"
                        , "mon": "#ffffff"
                        , "tue": "#ffffff"
                        , "wed": "#ffffff"
                        , "thu": "#ffffff"
                        , "fri": "#ffffff"
                        , "sat": "#eeeeee" };

// settingsKey is the key in chrome.storage containing the user's current color
// settings (see 'cachedSettings' for usage description and 'defaultSettings'
// for an example value).
const settingsKey = "gcal_gray_weekends_colors";

// cachedSettings holds the object mapping day of week ('sun', 'mon', ...) to
// the user's preferred color (read from chrome.storage). See 'defaultSettings'
// for an example.
const cachedSettings = {};

// initSettings tries to read the user's color settings from chrome.storage and
// store the result in cachedSettings. It stores 'defaultSettings' in
// 'cachedSettings' if the read fails.
const initSettings = new Promise((resolve) => {
  chrome.storage.sync.get([settingsKey], (result) => {
    if (result && result[settingsKey] && result[settingsKey].sun) {
      Object.assign(cachedSettings, result[settingsKey]);
    } else {
      if (chrome.runtime.lastError) {
        console.warn(
          "could not get gcal_gray_weekend settings (using default settings): ",
          chrome.runtime.lastError);
      }
      Object.assign(cachedSettings, defaultSettings);
    }
    resolve();
  });
});

// grayOutWeekends is called on any DOM mutations that affect the calendar
// element (e.g. user going to the next/previous month) and is responsible for
// pulling the calendar element out of the mutation object and re-coloring the
// appropriate divs inside the calendar element (with 'applyColor').
async function grayOutWeekends(mutList) {
  await initSettings;
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
      let day = node.children[0].innerHTML.slice(0,3).toLowerCase();
      node.style.backgroundColor = cachedSettings[day];
      continue;
    }

    // color date divs (for a particular date. See README on github for
    // discussion of 'data-datekey').
    let datekey = node.getAttribute("data-datekey");
    if (!datekey) {
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
    node.style.backgroundColor = cachedSettings[days[dayOfWeek]];
  }
}

// Update color whenever the DOM is updated
mut = new MutationObserver(grayOutWeekends);
mut.observe(document.body, {
  "subtree": true,
  "childList": true,
  "attributes": true
});
