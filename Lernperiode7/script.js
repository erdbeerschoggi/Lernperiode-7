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

if (todayFact) {
  saveReceivedFact(todayFact);
}

if (todayFact && factEl) {
  factEl.textContent = todayFact;
}

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
  if (factEl) factEl.textContent = newFact;

  lastFactTime = Date.now();
  save("todayFact", newFact);
  save("lastFactTime", lastFactTime);

  saveReceivedFact(newFact);
}

// Countdown Logic
function getNextMidnight() {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

let nextMidnight = load("nextMidnight", getNextMidnight());

async function updateCountdown() {
  const now = Date.now();

  if (now >= nextMidnight) {
    await generateNewFact();
    nextMidnight = getNextMidnight();
    save("nextMidnight", nextMidnight);
  }

  const remaining = nextMidnight - now;

  const h = String(Math.floor(remaining / 3600000)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  countdownEl.textContent = `${h}:${m}:${s}`;
}

if (countdownEl) {
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

  favs.forEach((fact, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("factItem");

    const text = document.createElement("p");
    text.textContent = fact;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("deleteOne");

    delBtn.addEventListener("click", () => {
      favs.splice(index, 1);
      save("favoriteFacts", favs);
      renderFavorites();
    });

    wrapper.appendChild(text);
    wrapper.appendChild(delBtn);
    favContainer.appendChild(wrapper);
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
  if (!fact) return;

  let received = load("receivedFacts", []);
  if (!received.includes(fact)) {
    received.push(fact);
    save("receivedFacts", received);
    renderReceived();
  }
}

function renderReceived() {
  if (!receivedContainer) return;
  receivedContainer.innerHTML = "";

  let received = load("receivedFacts", []);

  received.forEach((fact, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("factItem");

    const text = document.createElement("p");
    text.textContent = fact;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "save";
    saveBtn.classList.add("saveOne");

    saveBtn.addEventListener("click", () => {
      saveFavorite(fact);
      alert("Saved to favorites!");
    });

    wrapper.appendChild(text);
    wrapper.appendChild(saveBtn);
    receivedContainer.appendChild(wrapper);
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
