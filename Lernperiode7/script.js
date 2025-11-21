const API_URL = "https://catfact.ninja/fact";

// LocalStorage helpers
function load(key, fallback) {
    try {
        const val = JSON.parse(localStorage.getItem(key));
        return val !== null && val !== undefined ? val : fallback;
    } catch (e) {
        return fallback;
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// DOM Elements
const countdownEl = document.querySelector("#countdown");
const factEl = document.querySelector("#todayFact");
const favBtn = document.querySelector("#saveFavorite");
const favContainer = document.querySelector("#favoritesList");
const receivedContainer = document.querySelector("#receivedList");
const trendingList = document.querySelector("#trendingList");

const DAY_MS = 24 * 60 * 60 * 1000;

let lastFactTime = load("lastFactTime", 0);
let todayFact = load("todayFact", null);


// Fetch Cat Fact from API
async function fetchCatFact() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        return data.fact;
    } catch (err) {
        console.error("API error:", err);
        return "Could not load cat fact. Please try again later.";
    }
}


// Generate New Fact
async function generateNewFact() {
    const newFact = await fetchCatFact();

    todayFact = newFact;
    factEl.textContent = newFact;

    lastFactTime = Date.now();
    save("todayFact", newFact);
    save("lastFactTime", lastFactTime);

    saveReceivedFact(newFact);
    updateTrending(newFact);
}


// Countdown Logic
async function updateCountdown() {
    const now = Date.now();
    const elapsed = now - lastFactTime;

    // Only generate a new fact if 24h passed or no fact yet
    if (!todayFact || elapsed >= DAY_MS || lastFactTime === 0) {
        await generateNewFact();
    }

    const remaining = Math.max(0, DAY_MS - (Date.now() - lastFactTime));
    const h = String(Math.floor(remaining / 3600000)).padStart(2, "0");
    const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

    if (countdownEl) countdownEl.textContent = `${h}:${m}:${s}`;
    if (factEl) factEl.textContent = todayFact;
}

// Start countdown interval
if (countdownEl && factEl) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}


// Favorite Cat Facts
function saveFavorite(fact) {
    let favs = load("favoriteFacts", []);
    if (!favs.includes(fact)) {
        favs.push(fact);
        save("favoriteFacts", favs);
        renderFavorites();
    }
}

function renderFavorites() {
    if (!favContainer) return;
    favContainer.innerHTML = "";
    let favs = load("favoriteFacts", []);
    favs.forEach(f => {
        const btn = document.createElement("button");
        btn.textContent = f;
        favContainer.appendChild(btn);
    });
}

if (favBtn) {
    favBtn.addEventListener("click", () => {
        if (todayFact) {
            saveFavorite(todayFact);
            alert("Saved to favorites!");
        }
    });
}

renderFavorites();


// Received Cat Facts
function saveReceivedFact(fact) {
    let received = load("receivedFacts", []);
    if (received[received.length - 1] !== fact) {
        received.push(fact);
        save("receivedFacts", received);
        renderReceived();
    }
}

function renderReceived() {
    if (!receivedContainer) return;
    receivedContainer.innerHTML = "";
    const received = load("receivedFacts", []);
    received.forEach(fact => {
        const btn = document.createElement("button");
        btn.textContent = fact;
        receivedContainer.appendChild(btn);
    });
}

renderReceived();


//Delete Buttons
const deleteBtn = document.querySelector("#delete_btn");
if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        localStorage.removeItem("receivedFacts");
        renderReceived();
    }); 
}
const deleteBtn2 = document.querySelector("#delete_btn2");
if (deleteBtn2) {
    deleteBtn2.addEventListener("click", () => {
        localStorage.removeItem("favoriteFacts");
        renderFavorites();
    }); 
}   

// Restore Deleted Data
const restoreDeletedDataBtn = document.querySelector("#RestoreDeletedData");    
