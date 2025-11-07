// HTML-Elemente holen
const factParagraph = document.querySelector("main section:nth-of-type(2) p");
const countdownElement = document.querySelector("main section:nth-of-type(1) p");

// API
async function fetchCatFact() {
  const urls = [
    "https://cat-fact.herokuapp.com/facts/random", // Original API (Sehrwahrscheinlich nicht verfügbar)
    "https://catfact.ninja/fact" // Backup API (API die von ChatGPT vorgeschlagen wurde)
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API-Fehler");
      const data = await response.json();

      
      const fact = data.text || data.fact;
      factParagraph.textContent = fact;
      return;
    } catch (error) {
      console.warn(`Fehler bei ${url}:`, error.message);
    }
  }

  factParagraph.textContent = "Keine Cat Facts verfügbar.";
}

//24-Stunden-Countdown
let countdown = 86400;

function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function startCountdown() {
  countdownElement.textContent = formatTime(countdown);
  const interval = setInterval(() => {
    countdown--;
    countdownElement.textContent = formatTime(countdown);

    if (countdown <= 0) {
      clearInterval(interval);
      fetchCatFact();
      countdown = 86400;
      startCountdown();
    }
  }, 1000);
}

//Start
fetchCatFact();
startCountdown();