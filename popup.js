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

// storeColors is the onchange handler for the color pickers; it reads the
// color picker values and stores them in both cachedSettings and chrome
// storage.
function storeColors() {
  let settings = {};
  for (const day of days) {
    settings[day] = document.getElementById(day).value;
  }
  Object.assign(cachedSettings, settings);
  let storageObj = {};
  storageObj[settingsKey] = settings;
  chrome.storage.sync.set(storageObj, null);
};

// resetDefaults is the onclick handler for the "Reset Defaults" button; it
// resets the color pickers and cachedSettings to the values in
// 'defaultSettings'.  It works by setting the value of the color inputs
// directly, and then calling storeColors();
function resetDefaults() {
  if (!confirm("Are you sure you want to reset to default colors? This will "+
               "erase your custom settings.")) {
    return;
  }
  for (const day of days) {
    document.getElementById(day).value = defaultSettings[day];
  }
  storeColors();
}

window.onload = async function() {
  await initSettings;

  let row = document.getElementById('color-row')
  days.forEach(day => {
    // Add elements to the row for each day. It will look like:
    // <td>
    //   <label for="sun">Sun</label>
    //   <input type="color" id="sun" name="sun"
    //          value=<setting> onchange='storeColors'/>
    // </td>
    //
    // By adding the elements dynamically, we don't have to worry about
    // storeColors() being called before initSettings() finishes.
    let cell = document.createElement('td');

    let label = document.createElement('label');
    label.for = day;
    label.appendChild(
      document.createTextNode(day.charAt(0).toUpperCase()+day.slice(1)));

    let input = document.createElement('input');
    input.type = "color";
    input.id = day;
    input.name = day;
    input.value = cachedSettings[day];
    input.onchange = storeColors;
    
    cell.appendChild(label);
    cell.appendChild(input);
    row.appendChild(cell);
  });

  // Finally, activate the "Reset Defaults" button, now that the elements are
  // present
  document.getElementById('reset-defaults').onclick = resetDefaults
};
