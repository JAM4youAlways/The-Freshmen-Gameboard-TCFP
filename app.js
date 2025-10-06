// ===== GAMEBOARD (Code-only login, reveal PNG on unlock) =====

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const boardSection = document.getElementById("board-section");
const loginSection = document.getElementById("login-section");

const codeLoginInput = document.getElementById("loginCode");
const tilesEl = document.getElementById("tiles");
const unlockInput = document.getElementById("unlockInput");
const submitCodeBtn = document.getElementById("submitCodeBtn");
const unlockMsg = document.getElementById("unlockMsg");
const welcomeEl = document.getElementById("welcome");

let DATA = null; // {tabs, progress}
let current = null; // { name, loginCode, tab, rowIndex, codes[20], unlocked[20] }

async function fetchSheetData() {
  const res = await fetch(CONFIG.SHEET_JSON_URL, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch sheet data");
  return await res.json();
}

// scan all tabs to find a row with matching Login Code (column B)
function findByLoginCode(tabs, progress, loginCode) {
  const lc = (loginCode || "").trim().toLowerCase();
  for (const tab of tabs) {
    const rows = tab.rows;
    if (!rows || rows.length < 2) continue;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const codeCell = String(row[1] || "").trim().toLowerCase();
      if (codeCell === lc) {
        const name = String(row[0] || "").trim();
        const codes = [];
        for (let m = 0; m < 20; m++) {
          codes.push(String(row[2 + m] || "").trim());
        }
        const unlocked = (progress[loginCode] || new Array(20).fill(false)).slice(0, 20);
        return { name, loginCode, tab: tab.name, rowIndex: i, codes, unlocked };
      }
    }
  }
  return null;
}

function renderTiles() {
  tilesEl.innerHTML = "";
  CONFIG.MISSIONS.forEach((title, idx) => {
    const tile = document.createElement("div");
    tile.className = "tile";

    if (current.unlocked[idx]) {
      const img = document.createElement("img");
      img.alt = title;
      img.src = `./assets/mission${idx + 1}.png`;
      const label = document.createElement("div");
      label.className = "label";
      label.textContent = title;
      tile.appendChild(img);
      tile.appendChild(label);
    } else {
      const label = document.createElement("div");
      label.className = "label";
      label.textContent = title;
      const lock = document.createElement("div");
      lock.className = "lock";
      lock.textContent = "🔒";
      tile.appendChild(label);
      tile.appendChild(lock);
    }

    tilesEl.appendChild(tile);
  });
}

loginBtn.addEventListener("click", async () => {
  const loginCode = (codeLoginInput.value || "").trim();
  if (!loginCode) return alert("Please enter your login code.");

  try {
    DATA = await fetchSheetData();
    const found = findByLoginCode(DATA.tabs, DATA.progress || {}, loginCode);
    if (!found) {
      alert("No student found for that code.");
      return;
    }
    current = found;
    welcomeEl.textContent = `Welcome, ${current.name || "Student"}!`;
    loginSection.classList.add("hidden");
    boardSection.classList.remove("hidden");
    renderTiles();
  } catch (err) {
    console.error(err);
    alert("Unable to load data. Please try again later.");
  }
});

submitCodeBtn.addEventListener("click", async () => {
  if (!current) return;
  const code = (unlockInput.value || "").trim();
  unlockMsg.textContent = "";
  if (!code) { unlockMsg.textContent = "Please enter a code."; return; }

  const matchIndex = current.codes.findIndex(c => c && c.toUpperCase() === code.toUpperCase());
  if (matchIndex === -1) { unlockMsg.textContent = "Incorrect code. Please try again."; return; }
  if (current.unlocked[matchIndex]) { unlockMsg.textContent = "Already unlocked."; return; }

  try {
    const res = await fetch(CONFIG.SHEET_UPDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unlock", loginCode: current.loginCode, missionIndex: matchIndex })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Update failed");

    current.unlocked[matchIndex] = true;
    renderTiles();
    unlockInput.value = "";
    unlockMsg.textContent = "✅ Mission unlocked!";
    setTimeout(() => (unlockMsg.textContent = ""), 2000);
  } catch (err) {
    console.error(err);
    unlockMsg.textContent = "Error updating. Please try again.";
  }
});

logoutBtn.addEventListener("click", () => {
  current = null;
  loginSection.classList.remove("hidden");
  boardSection.classList.add("hidden");
  tilesEl.innerHTML = "";
  codeLoginInput.value = "";
  unlockInput.value = "";
  unlockMsg.textContent = "";
});
