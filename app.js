// ==== FRESHMEN GAMEBOARD APP ====
// Uses config.js for CONFIG.SHEET_JSON_URL and CONFIG.SHEET_UPDATE_URL

const loginSection = document.getElementById("login-section");
const boardSection = document.getElementById("board-section");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const studentNameInput = document.getElementById("studentName");
const loginCodeInput = document.getElementById("loginCode");
const welcomeEl = document.getElementById("welcome");
const tilesEl = document.getElementById("tiles");

const unlockInput = document.getElementById("unlockInput");
const submitCodeBtn = document.getElementById("submitCodeBtn");
const unlockMsg = document.getElementById("unlockMsg");

let currentStudent = null;

// ================================
// FETCH GOOGLE SHEET DATA
// ================================
async function fetchSheetData() {
  const url = CONFIG.SHEET_JSON_URL;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sheet data");
  return await res.json();
}

// ================================
// RENDER GAMEBOARD TILES
// ================================
function renderTiles() {
  tilesEl.innerHTML = "";
  CONFIG.MISSIONS.forEach((mission, idx) => {
    const isUnlocked = currentStudent.missions[idx] === true;
    const tile = document.createElement("div");
    tile.className = "tile " + (isUnlocked ? "unlocked" : "locked");

    const img = document.createElement("img");
    img.src = isUnlocked
      ? `./assets/mission${idx + 1}_unlocked.png`
      : `./assets/mission${idx + 1}_locked.png`;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = mission;

    tile.appendChild(img);
    tile.appendChild(label);
    tilesEl.appendChild(tile);
  });
}

// ================================
// LOGIN FLOW
// ================================
loginBtn.addEventListener("click", async () => {
  const name = (studentNameInput.value || "").trim();
  const code = (loginCodeInput.value || "").trim();
  if (!name || !code) return alert("Please enter both name and login code.");

  try {
    const data = await fetchSheetData();
    let found = null;
    for (const tab of data.tabs) {
      for (let i = 0; i < tab.rows.length; i++) {
        const row = tab.rows[i];
        const sName = String(row[0] || "").trim();
        const sCode = String(row[1] || "").trim();

        if (
          sName.toLowerCase() === name.toLowerCase() &&
          sCode.toLowerCase() === code.toLowerCase()
        ) {
          const missions = [];
          const codes = [];
          for (let m = 0; m < 20; m++) {
            const missionVal = row[2 + m * 2];
            const codeVal = row[3 + m * 2];
            missions.push(String(missionVal || "❌").includes("✅"));
            codes.push(codeVal || "");
          }
          found = {
            name: sName,
            tab: tab.name,
            rowIndex: i,
            loginCode: sCode,
            missions,
            codes
          };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      alert("No matching student found. Check your name and login code.");
      return;
    }

    currentStudent = found;
    welcomeEl.textContent = `Welcome, ${currentStudent.name}!`;
    loginSection.classList.add("hidden");
    boardSection.classList.remove("hidden");
    renderTiles();
  } catch (err) {
    console.error(err);
    alert("Unable to load data. Please try again later.");
  }
});

// ================================
// UNLOCK CODE HANDLER
// ================================
submitCodeBtn.addEventListener("click", async () => {
  const code = (unlockInput.value || "").trim();
  unlockMsg.textContent = "";
  if (!code) {
    unlockMsg.textContent = "Please enter a code.";
    return;
  }

  try {
    const matchIndex = currentStudent.codes.findIndex(
      (c) => c.toUpperCase() === code.toUpperCase()
    );

    if (matchIndex === -1) {
      unlockMsg.textContent = "Incorrect code. Please try again.";
      return;
    }

    // Update Google Sheet to mark as unlocked
    await fetch(CONFIG.SHEET_UPDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "unlock",
        tab: currentStudent.tab,
        rowIndex: currentStudent.rowIndex,
        missionIndex: matchIndex
      })
    });

    currentStudent.missions[matchIndex] = true;
    renderTiles();
    unlockInput.value = "";
    unlockMsg.textContent = "✅ Mission unlocked!";
    setTimeout(() => (unlockMsg.textContent = ""), 2000);
  } catch (err) {
    console.error(err);
    unlockMsg.textContent = "Error updating. Please try again.";
  }
});

// ================================
// LOGOUT
// ================================
logoutBtn.addEventListener("click", () => {
  currentStudent = null;
  loginSection.classList.remove("hidden");
  boardSection.classList.add("hidden");
  studentNameInput.value = "";
  loginCodeInput.value = "";
  tilesEl.innerHTML = "";
  unlockInput.value = "";
  unlockMsg.textContent = "";
});
