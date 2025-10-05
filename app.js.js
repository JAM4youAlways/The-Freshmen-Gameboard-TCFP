// ==== FRESHMEN GAMEBOARD APP ====
// Uses config.js for CONFIG.SHEET_JSON_URL and CONFIG.SHEET_UPDATE_URL
// Each student logs in with name + login code, then unlocks tiles with counselor codes.

const loginSection = document.getElementById("login-section");
const boardSection = document.getElementById("board-section");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const studentNameInput = document.getElementById("studentName");
const loginCodeInput = document.getElementById("loginCode");
const welcomeEl = document.getElementById("welcome");
const tilesEl = document.getElementById("tiles");

const modal = document.getElementById("modal");
modal.classList.add("hidden"); // ensure hidden on load
const modalTitle = document.getElementById("modalTitle");
const unlockInput = document.getElementById("unlockInput");
const cancelBtn = document.getElementById("cancelBtn");
const submitCodeBtn = document.getElementById("submitCodeBtn");
const modalMsg = document.getElementById("modalMsg");

let currentStudent = null; // holds the logged-in student's info
let pendingMissionIndex = null;

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

    if (!isUnlocked) {
      tile.addEventListener("click", () => openUnlockModal(idx));
    } else {
      tile.style.cursor = "default";
    }

    tilesEl.appendChild(tile);
  });
}

// ================================
// MODAL HANDLING
// ================================
function openUnlockModal(idx) {
  pendingMissionIndex = idx;
  modalTitle.textContent = `Enter unlock code for: ${CONFIG.MISSIONS[idx]}`;
  unlockInput.value = "";
  modalMsg.textContent = "";
  modal.classList.remove("hidden");
  unlockInput.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  pendingMissionIndex = null;
}

cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

submitCodeBtn.addEventListener("click", async () => {
  const code = (unlockInput.value || "").trim();
  if (!code) {
    modalMsg.textContent = "Please enter a code.";
    return;
  }

  try {
    const correct = currentStudent.codes[pendingMissionIndex];
    if (code.toUpperCase() !== String(correct).toUpperCase()) {
      modalMsg.textContent = "Incorrect code. Please try again.";
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
        missionIndex: pendingMissionIndex
      })
    });

    currentStudent.missions[pendingMissionIndex] = true;
    renderTiles();
    closeModal();
  } catch (err) {
    modalMsg.textContent = "Error updating. Please try again.";
    console.error(err);
  }
});

// ================================
// LOGIN FLOW
// ================================
loginBtn.addEventListener("click", async () => {
  const name = (studentNameInput.value || "").trim();
  const code = (loginCodeInput.value || "").trim();
  if (!name || !code) return alert("Please enter both name and login code.");

  try {
    const data = await fetchSheetData();

    // Look through each tab and row for a matching student
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

          // After columns 0 and 1, missions and codes alternate (20 missions total)
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

    // Successful login
    currentStudent = found;
    welcomeEl.textContent = `Welcome, ${currentStudent.name}!`;
    loginSection.classList.add("hidden");
    boardSection.classList.remove("hidden");
    renderTiles();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Unable to load data. Please try again later.");
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
  modal.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});


