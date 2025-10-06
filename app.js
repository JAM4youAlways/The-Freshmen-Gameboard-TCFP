// ==== FRESHMEN GAMEBOARD 4.0 ====
const el = (id)=>document.getElementById(id);

const loginSection = el("login-section");
const boardSection = el("board-section");
const loginBtn = el("loginBtn");
const logoutBtn = el("logoutBtn");
const loginCodeInput = el("loginCode");
const welcomeEl = el("welcome");
const unlockInput = el("unlockInput");
const submitCodeBtn = el("submitCodeBtn");
const unlockMsg = el("unlockMsg");
const tilesEl = el("tiles");
const loginMsg = el("loginMsg");
const tabNameEl = el("tabName");

let current = null; // { tab, rowIndex, codes[], progress[], studentName? }

async function fetchJSON() {
  const res = await fetch(CONFIG.SHEET_JSON_URL, { method:'GET' });
  if (!res.ok) throw new Error('Failed to load data');
  return await res.json();
}

function parseRow(row) {
  const name = String(row[0] || '').trim();
  const login = String(row[1] || '').trim();
  const codes = [];
  for (let c = 2; c <= 21; c++) codes.push(String(row[c] || '').trim());
  const progress = [];
  for (let p = 22; p <= 41; p++) {
    const val = String(row[p] || '').trim();
    progress.push( val === '✅' || val === 'TRUE' || val === '1' );
  }
  return { name, login, codes, progress };
}

function renderTiles() {
  tilesEl.innerHTML = '';
  CONFIG.MISSIONS.forEach((title, idx) => {
    const unlocked = !!(current.progress[idx]);
    const tile = document.createElement('div');
    tile.className = 'tile ' + (unlocked ? 'unlocked' : 'locked');

    if (unlocked) {
      const img = document.createElement('img');
      img.src = CONFIG.ASSET_FOR(idx);
      img.alt = title;
      tile.appendChild(img);
    } else {
      const label = document.createElement('div');
      label.className = 'title';
      label.textContent = title;
      const lock = document.createElement('img');
      lock.className = 'padlock';
      lock.alt = 'Locked';
      lock.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 24 24" fill="orange" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm3 8H9V7a3 3 0 116 0v3z"/>
        </svg>
      `);
      tile.appendChild(label);
      tile.appendChild(lock);
    }
    tilesEl.appendChild(tile);
  });
}

loginBtn.addEventListener('click', async () => {
  const code = (loginCodeInput.value || '').trim();
  loginMsg.textContent = '';
  if (!code) { loginMsg.textContent = 'Please enter your login code.'; return; }

  try {
    const data = await fetchJSON();
    let found = null, foundTab = null, foundRowIdx = -1;

    for (const tab of data.tabs) {
      if (!CONFIG.COUNSELOR_TABS.includes(tab.name)) continue;
      for (let i = 1; i < tab.rows.length; i++) {
        const row = tab.rows[i];
        if (!row) continue;
        const parsed = parseRow(row);
        if (parsed.login.toUpperCase() === code.toUpperCase()) {
          found = parsed;
          foundTab = tab.name;
          foundRowIdx = i;
          break;
        }
      }
      if (found) break;
    }

    if (!found) { loginMsg.textContent = 'No matching login code found.'; return; }

    current = {
      tab: foundTab,
      rowIndex: foundRowIdx,
      codes: found.codes,
      progress: found.progress,
      studentName: found.name
    };

    welcomeEl.textContent = current.studentName ? `Welcome, ${current.studentName}!` : 'Welcome!';
    tabNameEl.textContent = `Counselor tab: ${current.tab}`;

    loginSection.classList.add('hidden');
    boardSection.classList.remove('hidden');
    renderTiles();

  } catch (err) {
    console.error(err);
    loginMsg.textContent = 'Unable to load data. Please try again later.';
  }
});

submitCodeBtn.addEventListener('click', async () => {
  if (!current) return;
  const entry = (unlockInput.value || '').trim();
  unlockMsg.textContent = '';
  if (!entry) { unlockMsg.textContent = 'Please enter a code.'; return; }

  try {
    const idx = current.codes.findIndex((c, i) =>
      c && c.toUpperCase() === entry.toUpperCase() && !current.progress[i]
    );

    if (idx === -1) { unlockMsg.textContent = 'Incorrect code or already used.'; return; }

    const res = await fetch(CONFIG.SHEET_UPDATE_URL, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        action: 'unlock',
        tab: current.tab,
        rowIndex: current.rowIndex,
        missionIndex: idx
      })
    });
    if (!res.ok) throw new Error('Update request failed');
    const payload = await res.json();
    if (payload && payload.success === false) throw new Error(payload.error || 'Update rejected');

    current.progress[idx] = true;
    unlockInput.value = '';
    unlockMsg.style.color = '#1d8f3b';
    unlockMsg.textContent = '✅ Mission unlocked!';
    renderTiles();
    setTimeout(()=>{ unlockMsg.textContent=''; unlockMsg.style.color=''; }, 1600);
  } catch (err) {
    console.error(err);
    unlockMsg.textContent = 'Error updating. Please try again.';
  }
});

logoutBtn.addEventListener('click', () => {
  current = null;
  loginSection.classList.remove('hidden');
  boardSection.classList.add('hidden');
  loginCodeInput.value = '';
  unlockInput.value = '';
  unlockMsg.textContent = '';
  tilesEl.innerHTML = '';
});
