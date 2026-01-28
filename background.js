chrome.runtime.onInstalled.addListener(() => {
  // Initialize all state variables on installation.
  chrome.storage.local.set({ timerValue: 20, isPaused: false, breakInProgress: false, isMuted: false });
  chrome.alarms.create('lookAway', {
    delayInMinutes: 20,
  });
});

// When the alarm fires, signal that a break is in progress.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'lookAway') {
    chrome.storage.local.set({ breakInProgress: true });
    chrome.tabs.create({ url: 'look_away.html' });
  }
});

// When a tab is closed, check if it was a break tab.
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.storage.local.get(['breakInProgress', 'isPaused', 'timerValue'], (result) => {
    // Only proceed if a break was actually in progress.
    if (result.breakInProgress) {
      // The break is now over. Reset the flag.
      chrome.storage.local.set({ breakInProgress: false }, () => {
        // IMPORTANT: Only restart the timer if the user has NOT manually paused it.
        if (!result.isPaused) {
          chrome.alarms.create('lookAway', {
            delayInMinutes: result.timerValue || 20,
          });
        }
      });
    }
  });
});
