document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.getElementById('look-away-timer');
  let seconds = 20;

  const restartButton = document.getElementById('restart');

  restartButton.addEventListener('click', () => {
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  });

  // Speak the instruction immediately, but only if not muted.
  chrome.storage.local.get('isMuted', (result) => {
    if (!result.isMuted) {
      chrome.tts.speak('Time to look away. Gaze at something 20 feet away for 20 seconds.');
    }
  });

  const countdown = setInterval(() => {
    seconds--;
    timerDisplay.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(countdown);
      // The tab can be closed manually or automatically.
      // For simplicity, we'll just let the user close it.
    }
  }, 1000);
});
