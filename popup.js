const timerDisplay = document.getElementById('timer');
const pauseResumeButton = document.getElementById('pause-resume');
const set1MinButton = document.getElementById('set-1');
const set5MinButton = document.getElementById('set-5');
const set20MinButton = document.getElementById('set-20');
const muteUnmuteButton = document.getElementById('mute-unmute');

function updateMuteButton() {
  chrome.storage.local.get('isMuted', (result) => {
    muteUnmuteButton.textContent = result.isMuted ? 'Unmute' : 'Mute';
  });
}

function updateTimerDisplay() {
  chrome.storage.local.get(['timerValue', 'isPaused'], (result) => {
    const { timerValue = 20, isPaused = false } = result;

    if (isPaused) {
      // If paused, show the full time and a "Resume" button.
      timerDisplay.textContent = `${String(timerValue).padStart(2, '0')}:00`;
      pauseResumeButton.textContent = 'Resume';
    } else {
      // If running, the button should always say "Pause".
      pauseResumeButton.textContent = 'Pause';
      chrome.alarms.get('lookAway', (alarm) => {
        if (alarm) {
          // If an alarm is found, display the remaining time.
          const remainingTime = alarm.scheduledTime - Date.now();
          if (remainingTime < 1000) {
            timerDisplay.textContent = '00:00';
          } else {
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          }
        } else {
          // If no alarm is found (but not paused), show the full time.
          // This handles the state right after setting a new timer.
          timerDisplay.textContent = `${String(timerValue).padStart(2, '0')}:00`;
        }
      });
    }
  });
}

pauseResumeButton.addEventListener('click', () => {
  chrome.storage.local.get(['isPaused', 'timerValue'], (result) => {
    let { isPaused, timerValue = 20 } = result;
    isPaused = !isPaused; // Toggle the paused state

    chrome.storage.local.set({ isPaused: isPaused }, () => {
      if (isPaused) {
        chrome.alarms.clear('lookAway');
      } else {
        // When resuming, create a new one-shot alarm.
        chrome.alarms.create('lookAway', {
          delayInMinutes: timerValue,
        });
      }
      updateTimerDisplay(); // Refresh the UI
    });
  });
});

function setTimer(minutes) {
  chrome.storage.local.set({ timerValue: minutes, isPaused: false }, () => {
    // When setting a new timer, create a new one-shot alarm.
    chrome.alarms.create('lookAway', {
      delayInMinutes: minutes,
    });
    updateTimerDisplay(); // Refresh the UI
  });
}

set1MinButton.addEventListener('click', () => setTimer(0.2));
set5MinButton.addEventListener('click', () => setTimer(5));
set20MinButton.addEventListener('click', () => setTimer(20));

muteUnmuteButton.addEventListener('click', () => {
  chrome.storage.local.get('isMuted', (result) => {
    chrome.storage.local.set({ isMuted: !result.isMuted }, () => {
      updateMuteButton();
    });
  });
});

// Set up the recurring UI update
setInterval(updateTimerDisplay, 1000);

// Initial UI update on open
updateTimerDisplay();
updateMuteButton();
