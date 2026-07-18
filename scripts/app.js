// === Plant Data ===
const PLANTS = [
  { name: "狗尾巴草", time: 1, icon: "\u{1F33E}", desc: "顽强的野草" },
  { name: "牵牛花", time: 1, icon: "\u{1F338}", desc: "清晨绽放" },
  { name: "蒲公英", time: 1, icon: "\u{1F33C}", desc: "随风飘散" },
  { name: "薄荷", time: 5, icon: "\u{1F33F}", desc: "清凉提神" },
  { name: "向日葵", time: 10, icon: "\u{1F33B}", desc: "追逐阳光" },
  { name: "多肉植物", time: 10, icon: "\u{1FAB4}", desc: "耐旱可爱" },
  { name: "银杏树", time: 25, icon: "\u{1F333}", desc: "活化石" },
  { name: "竹子", time: 25, icon: "\u{1F38B}", desc: "节节高升" },
  { name: "薰衣草", time: 25, icon: "\u{1F49C}", desc: "紫色浪漫" },
  { name: "枫树", time: 45, icon: "\u{1F341}", desc: "热烈燃烧" },
  { name: "樱花树", time: 45, icon: "\u{1F338}", desc: "粉色浪漫" },
  { name: "红杉树", time: 45, icon: "\u{1F332}", desc: "参天大树" },
  { name: "发光蘑菇", time: 60, icon: "\u{1F344}", desc: "神秘荧光" }
];

// === State ===
let selectedDuration = 25;
let selectedPlant = null;
let timerInterval = null;
let totalSeconds = 0;
let elapsedSeconds = 0;
let focusStartTime = null;
let soundEnabled = false;
let audioCtx = null;
let noiseNode = null;
let noiseGain = null;
let isDarkMode = false;

// === Page Navigation ===
function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  const target = document.getElementById('page-' + pageName);
  if (target) {
    target.classList.add('active');
    void target.offsetWidth;
    target.classList.add('fade-in');
  }
  if (pageName === 'landing') updateLandingTreeCount();
  if (pageName === 'plant') renderPlantGrid();
  if (pageName === 'forest') renderForest();
  if (pageName === 'forest') {
    document.getElementById('page-forest-detail').classList.remove('active');
  }
  if (pageName === 'settings') updateSettingsUI();
}

// === Landing ===
function updateLandingTreeCount() {
  const forest = getForest();
  let total = 0;
  for (const key in forest) total += forest[key].count;
  document.getElementById('landing-tree-count').textContent = total;
}

function handleTreeClick() {
  const tree = document.getElementById('landing-tree');
  tree.classList.add('strong-sway');

  // Create burst of falling leaves
  createFallingLeaves(10, 'burst-leaf');

  setTimeout(() => {
    tree.classList.remove('strong-sway');
  }, 1500);
}

// Idle falling leaves - gentle continuous effect
let idleLeafTimer = null;
function startIdleLeaves() {
  if (idleLeafTimer) return;
  const spawnIdleLeaf = () => {
    // Only spawn if landing page is active
    const landingPage = document.getElementById('page-landing');
    if (landingPage && landingPage.classList.contains('active')) {
      createFallingLeaves(1, 'idle-leaf');
    }
    // Random interval 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    idleLeafTimer = setTimeout(spawnIdleLeaf, delay);
  };
  // Start after a short delay
  idleLeafTimer = setTimeout(spawnIdleLeaf, 1500);
}

function createFallingLeaves(count, type) {
  const container = document.getElementById('falling-leaves');
  if (!container) return;

  const leafColors = ['#81C784', '#27AE60', '#A5D6A7', '#4CAF50', '#C8E6C9', '#2E7D32'];
  const isBurst = type === 'burst-leaf';

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf-particle ' + type;

    // Starting position within the tree crown area
    const startX = isBurst
      ? 50 + Math.random() * 140
      : 70 + Math.random() * 100;
    const startY = isBurst
      ? 20 + Math.random() * 90
      : 30 + Math.random() * 70;

    // Fall direction - wider spread for burst
    const fallX = isBurst
      ? (Math.random() - 0.5) * 120
      : (Math.random() - 0.5) * 50;

    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const delay = isBurst ? Math.random() * 0.3 : 0;

    leaf.style.cssText = `
      left: ${startX}px;
      top: ${startY}px;
      background: ${color};
      --fall-x: ${fallX}px;
      animation-delay: ${delay}s;
    `;

    container.appendChild(leaf);

    // Clean up after animation
    const duration = isBurst ? 1800 : 3200;
    setTimeout(() => {
      if (leaf.parentNode) leaf.parentNode.removeChild(leaf);
    }, duration + delay * 1000);
  }
}

// === Time Selection ===
function onSliderInput() {
  const slider = document.getElementById('time-slider');
  const val = parseInt(slider.value);
  selectedDuration = val;
  updateTimeDisplay();
  updateQuickTimeActive();
}

function setTime(val) {
  const slider = document.getElementById('time-slider');
  slider.value = val;
  selectedDuration = val;
  updateTimeDisplay();
  updateQuickTimeActive();
}

function updateTimeDisplay() {
  const val = selectedDuration;
  const display = document.getElementById('time-slider-value');
  if (display) display.textContent = val;
  // Update slider fill
  const slider = document.getElementById('time-slider');
  if (slider) {
    const pct = ((val - 1) / (120 - 1)) * 100;
    slider.style.setProperty('--slider-pct', pct + '%');
  }
}

function updateQuickTimeActive() {
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.classList.remove('active');
  });
}

// === Plant Selection ===
function renderPlantGrid() {
  document.getElementById('plant-page-title').textContent =
    `专注${selectedDuration}分钟，今天想种什么？`;

  const grid = document.getElementById('plant-grid');
  grid.innerHTML = '';

  PLANTS.forEach(plant => {
    const canPlant = plant.time <= selectedDuration;
    const card = document.createElement('div');
    card.className = 'plant-card' + (canPlant ? '' : ' disabled');
    if (selectedPlant && selectedPlant.name === plant.name && canPlant) {
      card.classList.add('selected');
    }
    card.innerHTML = `
      <div class="plant-icon">${plant.icon}</div>
      <div class="plant-name">${plant.name}</div>
      <div class="plant-time">${plant.time}分钟</div>
      <div class="plant-desc">${plant.desc}</div>
    `;
    if (canPlant) {
      card.addEventListener('click', () => selectPlant(plant));
    }
    grid.appendChild(card);
  });

  updateHarvestInfo();
  updateStartBtn();
}

function selectPlant(plant) {
  selectedPlant = plant;
  renderPlantGrid();
}

function updateHarvestInfo() {
  const info = document.getElementById('plant-harvest-info');
  if (!selectedPlant) {
    info.textContent = '';
    return;
  }
  const count = Math.floor(selectedDuration / selectedPlant.time);
  info.textContent = `预计收获：${count}颗${selectedPlant.name}`;
}

function updateStartBtn() {
  const btn = document.getElementById('btn-start-focus');
  btn.disabled = !selectedPlant;
}

// === Focus Timer ===
function startFocus() {
  if (!selectedPlant) return;
  totalSeconds = selectedDuration * 60;
  elapsedSeconds = 0;
  focusStartTime = Date.now();

  // Reset sound toggle state
  soundEnabled = false;
  const btn = document.getElementById('sound-toggle');
  if (btn) btn.classList.remove('active');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');
  if (iconOff) iconOff.style.display = 'block';
  if (iconOn) iconOn.style.display = 'none';

  document.getElementById('focus-plant-name').textContent = selectedPlant.name;
  renderFocusPlant(0);
  navigateTo('focus');
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - focusStartTime) / 1000);
    if (elapsedSeconds >= totalSeconds) {
      elapsedSeconds = totalSeconds;
      clearInterval(timerInterval);
      timerInterval = null;
      onFocusComplete();
      return;
    }
    updateTimerDisplay();
    updatePlantGrowth();
  }, 1000);
}

function updateTimerDisplay() {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  document.getElementById('focus-timer').textContent =
    `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function updatePlantGrowth() {
  const progress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);
  renderFocusPlant(progress);
}

// === Give Up ===
function showGiveUpConfirm() {
  const name = selectedPlant ? selectedPlant.name : '植物';
  document.querySelector('#giveup-modal .modal-text').textContent = `确认要放弃吗？这颗${name}会枯萎🥀`;
  document.getElementById('giveup-modal').style.display = 'flex';
}

function hideGiveUpConfirm() {
  document.getElementById('giveup-modal').style.display = 'none';
}

function confirmGiveUp() {
  hideGiveUpConfirm();
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopWhiteNoise();
  // Reset sound toggle
  soundEnabled = false;
  // Wilt animation
  const area = document.getElementById('focus-plant-area');
  area.classList.add('wilting');
  setTimeout(() => {
    area.classList.remove('wilting');
    selectedPlant = null;
    navigateTo('landing');
  }, 1500);
}

// === Focus Complete ===
function onFocusComplete() {
  // Stop white noise if playing
  stopWhiteNoise();

  // Play completion chime
  playCompletionSound();

  const harvestCount = Math.floor(selectedDuration / selectedPlant.time);
  const date = new Date();
  const dateStr = `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;

  // Save to forest
  saveToForest(selectedPlant, selectedDuration, harvestCount, dateStr);

  // Render complete page
  document.getElementById('complete-plant-area').innerHTML =
    getPlantSVG(selectedPlant.name, 100);

  document.getElementById('achievement-icon').textContent = selectedPlant.icon;
  document.getElementById('achievement-title').textContent =
    `你收获了 ${harvestCount} 颗${selectedPlant.name}！`;
  document.getElementById('achievement-duration').textContent =
    `本次专注：${selectedDuration} 分钟`;
  document.getElementById('achievement-date').textContent = `日期：${dateStr}`;

  // Handle notification based on page visibility
  if (document.hidden) {
    // Page is hidden - send desktop notification
    sendDesktopNotification(harvestCount, dateStr);
    // When user clicks notification, bring page to front
    window.addEventListener('focus', function onFocus() {
      navigateTo('complete');
      createCelebration();
      window.removeEventListener('focus', onFocus);
    }, { once: true });
  } else {
    // Page is visible - show complete page directly
    navigateTo('complete');
    createCelebration();
  }
}

// === Forest Data ===
function getForest() {
  try {
    const data = localStorage.getItem('focusTree_forest');
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function saveToForest(plant, duration, count, dateStr) {
  const forest = getForest();
  if (!forest[plant.name]) {
    forest[plant.name] = { count: 0, records: [], icon: plant.icon, time: plant.time };
  }
  forest[plant.name].count += count;
  forest[plant.name].records.push({ duration, date: dateStr });
  localStorage.setItem('focusTree_forest', JSON.stringify(forest));
}

// === Forest Page ===
function renderForest() {
  const forest = getForest();
  const entries = Object.entries(forest).sort((a, b) => b[1].count - a[1].count);

  const statsEl = document.getElementById('forest-stats');
  const listEl = document.getElementById('forest-list');
  const emptyEl = document.getElementById('forest-empty');
  const weeklyEl = document.getElementById('forest-weekly-chart');
  const visualEl = document.getElementById('forest-visual');
  const distEl = document.getElementById('forest-distribution');
  const todayEl = document.getElementById('forest-today');
  const allRecEl = document.getElementById('forest-all-records');

  // Collect all records flat
  const allRecords = [];
  let totalCount = 0, totalMinutes = 0;
  entries.forEach(([name, data]) => {
    totalCount += data.count;
    (data.records || []).forEach(r => {
      totalMinutes += r.duration;
      allRecords.push({ name, icon: data.icon, ...r });
    });
  });

  if (entries.length === 0) {
    statsEl.style.display = 'none';
    weeklyEl.style.display = 'none';
    visualEl.style.display = 'none';
    distEl.style.display = 'none';
    todayEl.style.display = 'none';
    allRecEl.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';
  [statsEl, weeklyEl, visualEl, distEl, todayEl, allRecEl].forEach(el => el.style.display = '');

  // === Today stats ===
  const now = new Date();
  const todayStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  const todayRecords = allRecords.filter(r => r.date === todayStr);
  const todayMin = todayRecords.reduce((s, r) => s + r.duration, 0);
  const todayCount = todayRecords.length;

  // === Week stats ===
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0,0,0,0);
  const weekMin = allRecords.filter(r => new Date(r.date.replace(/\./g, '-')) >= weekStart)
    .reduce((s, r) => s + r.duration, 0);
  const weekH = Math.floor(weekMin / 60);
  const weekM = weekMin % 60;

  // === Stats Row ===
  statsEl.innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${totalCount}</div>
      <div class="stat-label">总树木</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${totalMinutes}</div>
      <div class="stat-label">总分钟</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${todayCount}</div>
      <div class="stat-label">今日</div>
    </div>
  `;

  // === Weekly Bar Chart ===
  renderWeeklyChart(allRecords);

  // === Forest Visualization (mini trees) ===
  renderForestVisualization(forest, totalCount);

  // === Plant Distribution ===
  renderDistribution(entries, totalCount);

  // === Today's Records ===
  renderTodayRecords(todayRecords);

  // === All Plant List ===
  listEl.innerHTML = '';
  entries.forEach(([name, data]) => {
    const item = document.createElement('div');
    item.className = 'forest-item';
    const lastDate = data.records && data.records.length > 0
      ? data.records[data.records.length - 1].date : '';
    item.innerHTML = `
      <div class="forest-item-icon">${data.icon || ''}</div>
      <div class="forest-item-info">
        <div class="forest-item-name">${name}</div>
        <div class="forest-item-count">已收获 ${data.count} 颗</div>
      </div>
      <div class="forest-item-date">${lastDate}</div>
      <div class="forest-item-arrow">›</div>
    `;
    item.addEventListener('click', () => showForestDetail(name));
    listEl.appendChild(item);
  });
}

function renderWeeklyChart(allRecords) {
  const container = document.getElementById('weekly-bars');
  const now = new Date();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const ds = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    const dayMin = allRecords.filter(r => r.date === ds).reduce((s, r) => s + r.duration, 0);
    days.push({ label: i === 0 ? '今天' : dayNames[d.getDay()], minutes: dayMin, isToday: i === 0 });
  }

  const maxMin = Math.max(...days.map(d => d.minutes), 1);

  container.innerHTML = days.map(d => {
    const h = Math.max(2, (d.minutes / maxMin) * 65);
    const valLabel = d.minutes > 0 ? (d.minutes >= 60 ? Math.round(d.minutes/60) + 'h' : d.minutes + 'm') : '';
    return `<div class="week-bar-wrap">
      ${valLabel ? `<span class="week-bar-value">${valLabel}</span>` : ''}
      <div class="week-bar${d.isToday ? ' today' : ''}" style="height:${h}px"></div>
      <span class="week-bar-label">${d.label}</span>
    </div>`;
  }).join('');
}

function renderForestVisualization(forest, totalCount) {
  const container = document.getElementById('forest-mini-trees');
  const countEl = document.getElementById('forest-visual-count');
  const displayCount = Math.min(totalCount, 50);
  countEl.textContent = totalCount > 50 ? `展示前50棵，共${totalCount}棵` : `共${totalCount}棵`;

  // Build a flat list of tree types
  const treeList = [];
  Object.entries(forest).forEach(([name, data]) => {
    for (let i = 0; i < data.count && treeList.length < 50; i++) {
      treeList.push({ name, icon: data.icon });
    }
  });

  container.innerHTML = treeList.map((t, i) => {
    const hue = hashColor(t.name);
    const delay = (i * 0.05).toFixed(2);
    return `<div class="mini-tree" title="${t.name}" style="animation-delay:${delay}s">
      <svg viewBox="0 0 24 30">
        <rect x="10" y="18" width="4" height="12" rx="1.5" fill="#8D6E63"/>
        <ellipse cx="12" cy="14" rx="${7 + (i % 3)}" ry="${6 + (i % 2)}" fill="${hue}" opacity="0.85"/>
        <ellipse cx="12" cy="10" rx="${5 + (i % 2)}" ry="${4 + (i % 3)}" fill="${hue}" opacity="0.6"/>
      </svg>
    </div>`;
  }).join('');
}

function hashColor(name) {
  const colors = ['#27AE60', '#2E7D32', '#81C784', '#4CAF50', '#66BB6A', '#388E3C', '#A5D6A7', '#43A047'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function renderDistribution(entries, totalCount) {
  const container = document.getElementById('distribution-bars');
  const maxCount = Math.max(...entries.map(([, d]) => d.count), 1);

  container.innerHTML = entries.map(([name, data]) => {
    const pct = (data.count / maxCount) * 100;
    return `<div class="dist-row">
      <span class="dist-icon">${data.icon || ''}</span>
      <span class="dist-name">${name}</span>
      <div class="dist-bar-bg">
        <div class="dist-bar-fill" style="width:${pct}%"></div>
      </div>
      <span class="dist-count">${data.count}</span>
    </div>`;
  }).join('');
}

function renderTodayRecords(todayRecords) {
  const container = document.getElementById('today-records');
  if (todayRecords.length === 0) {
    container.innerHTML = '<div class="today-empty">今天还没有专注记录</div>';
    return;
  }
  container.innerHTML = todayRecords.reverse().map(r => `
    <div class="today-record-item">
      <span class="today-record-icon">${r.icon || ''}</span>
      <span class="today-record-name">${r.name}</span>
      <span class="today-record-dur">${r.duration}分钟</span>
    </div>
  `).join('');
}

function showForestDetail(plantName) {
  const forest = getForest();
  const data = forest[plantName];
  if (!data) return;

  document.getElementById('detail-title').textContent = plantName;

  const totalMin = (data.records || []).reduce((s, r) => s + r.duration, 0);
  document.getElementById('detail-summary').innerHTML = `
    <div class="detail-summary-icon">${data.icon || ''}</div>
    <div class="detail-summary-name">${plantName}</div>
    <div class="detail-summary-stats">
      <div class="detail-stat">
        <div class="detail-stat-val">${data.count}</div>
        <div class="detail-stat-lbl">收获数量</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-val">${totalMin}</div>
        <div class="detail-stat-lbl">总专注分钟</div>
      </div>
      <div class="detail-stat">
        <div class="detail-stat-val">${data.time}</div>
        <div class="detail-stat-lbl">单次时长</div>
      </div>
    </div>
  `;

  const records = (data.records || []).slice().reverse();
  document.getElementById('detail-records').innerHTML = records.map(r => `
    <div class="detail-record-item">
      <span class="detail-record-date">${r.date}</span>
      <span class="detail-record-dur">${r.duration}分钟</span>
    </div>
  `).join('');

  navigateTo('forest-detail');
}

// === Celebration Particles ===
function createCelebration() {
  const container = document.getElementById('celebration-particles');
  container.innerHTML = '';
  const colors = ['#27AE60', '#81C784', '#FFD700', '#FF6B6B', '#8D6E63', '#E8F5E9'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / 30;
    const dist = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 6;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: ${color};
      left: 50%; top: 50%;
      animation: particleBurst 1s ease-out forwards;
      --tx: ${tx}px; --ty: ${ty}px;
    `;
    // Use individual keyframes via style
    p.style.animationName = 'none';
    container.appendChild(p);
    // Force reflow then animate
    requestAnimationFrame(() => {
      p.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.3)`, opacity: 0 }
      ], { duration: 1000, easing: 'ease-out', fill: 'forwards' });
    });
  }
  setTimeout(() => { container.innerHTML = ''; }, 1200);
}

// === Plant SVG Rendering ===
function getPlantSVG(plantName, progress) {
  const stage = progress < 10 ? 0 : progress < 30 ? 1 : progress < 55 ? 2 : progress < 80 ? 3 : 4;
  const svgMap = {
    "狗尾巴草": svgFoxtailGrass,
    "牵牛花": svgMorningGlory,
    "蒲公英": svgDandelion,
    "薄荷": svgMint,
    "向日葵": svgSunflower,
    "多肉植物": svgSucculent,
    "银杏树": svgGinkgo,
    "竹子": svgBamboo,
    "薰衣草": svgLavender,
    "枫树": svgMaple,
    "樱花树": svgCherryBlossom,
    "红杉树": svgRedwood,
    "发光蘑菇": svgGlowingMushroom
  };
  const fn = svgMap[plantName] || svgFoxtailGrass;
  return `<div class="plant-svg-container">${fn(stage)}</div>`;
}

function renderFocusPlant(progress) {
  const area = document.getElementById('focus-plant-area');
  area.innerHTML = getPlantSVG(selectedPlant.name, progress);
}

// === SVG Plant Generators ===
// Each returns SVG string for a given stage (0-4)

function svgSoil() {
  return `<ellipse cx="100" cy="240" rx="50" ry="10" fill="#795548" opacity="0.5"/>`;
}

function svgFoxtailGrass(stage) {
  const h = 40 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 2s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <line x1="100" y1="240" x2="100" y2="${240-h}" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/>
    ${stage >= 1 ? `<ellipse cx="100" cy="${240-h-5}" rx="4" ry="8" fill="#8BC34A"/>` : ''}
    ${stage >= 2 ? `<path d="M100 ${240-h+20} Q80 ${240-h+10} 70 ${240-h+25}" stroke="#4CAF50" stroke-width="2" fill="none"/>
    <path d="M100 ${240-h+30} Q120 ${240-h+20} 130 ${240-h+35}" stroke="#4CAF50" stroke-width="2" fill="none"/>` : ''}
    ${stage >= 3 ? `<ellipse cx="100" cy="${240-h-10}" rx="6" ry="18" fill="#CDDC39" opacity="0.8"/>
    <ellipse cx="97" cy="${240-h-12}" rx="4" ry="14" fill="#C0CA33"/>` : ''}
    ${stage >= 4 ? `<ellipse cx="100" cy="${240-h-15}" rx="8" ry="25" fill="#CDDC39"/>
    <ellipse cx="98" cy="${240-h-18}" rx="5" ry="20" fill="#D4E157"/>
    <line x1="95" y1="${240-h-30}" x2="92" y2="${240-h-38}" stroke="#CDDC39" stroke-width="1.5"/>
    <line x1="100" y1="${240-h-32}" x2="100" y2="${240-h-42}" stroke="#CDDC39" stroke-width="1.5"/>
    <line x1="105" y1="${240-h-30}" x2="108" y2="${240-h-38}" stroke="#CDDC39" stroke-width="1.5"/>` : ''}
  </svg>`;
}

function svgMorningGlory(stage) {
  const h = 30 + stage * 40;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <path d="M100 240 Q95 ${240-h*0.5} 100 ${240-h}" stroke="#4CAF50" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${stage >= 1 ? `<path d="M100 ${240-h+20} Q85 ${240-h+15} 80 ${240-h+25}" stroke="#4CAF50" stroke-width="2" fill="none"/>
    <ellipse cx="78" cy="${240-h+22}" rx="8" ry="5" fill="#66BB6A" transform="rotate(-20 78 ${240-h+22})"/>` : ''}
    ${stage >= 2 ? `<path d="M100 ${240-h+40} Q115 ${240-h+30} 120 ${240-h+40}" stroke="#4CAF50" stroke-width="2" fill="none"/>
    <ellipse cx="122" cy="${240-h+38}" rx="8" ry="5" fill="#66BB6A" transform="rotate(20 122 ${240-h+38})"/>` : ''}
    ${stage >= 3 ? `<circle cx="100" cy="${240-h-5}" r="12" fill="#9C27B0" opacity="0.3"/>` : ''}
    ${stage >= 4 ? `<path d="M88 ${240-h-5} Q100 ${240-h-25} 112 ${240-h-5} Q100 ${240-h+5} 88 ${240-h-5}" fill="#9C27B0"/>
    <circle cx="100" cy="${240-h-8}" r="4" fill="#E1BEE7"/>
    <path d="M92 ${240-h-3} Q100 ${240-h-18} 108 ${240-h-3}" fill="#AB47BC" opacity="0.6"/>` : ''}
  </svg>`;
}

function svgDandelion(stage) {
  const h = 30 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 2.5s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <line x1="100" y1="240" x2="100" y2="${240-h}" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round"/>
    ${stage >= 1 ? `<ellipse cx="95" cy="235" rx="10" ry="4" fill="#66BB6A" transform="rotate(-15 95 235)"/>
    <ellipse cx="105" cy="233" rx="10" ry="4" fill="#66BB6A" transform="rotate(15 105 233)"/>` : ''}
    ${stage >= 2 ? `<ellipse cx="90" cy="225" rx="8" ry="3" fill="#81C784" transform="rotate(-25 90 225)"/>
    <ellipse cx="110" cy="222" rx="8" ry="3" fill="#81C784" transform="rotate(25 110 222)"/>` : ''}
    ${stage >= 3 ? `<circle cx="100" cy="${240-h-5}" r="8" fill="#FFEB3B"/>
    <circle cx="100" cy="${240-h-5}" r="5" fill="#FDD835"/>` : ''}
    ${stage >= 4 ? `<circle cx="100" cy="${240-h-5}" r="14" fill="#F5F5F5" opacity="0.9"/>
    ${Array.from({length:12}, (_, i) => {
      const a = (Math.PI*2*i)/12;
      const x1 = 100 + Math.cos(a)*6;
      const y1 = (240-h-5) + Math.sin(a)*6;
      const x2 = 100 + Math.cos(a)*16;
      const y2 = (240-h-5) + Math.sin(a)*16;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E0E0E0" stroke-width="1"/>
      <circle cx="${x2}" cy="${y2}" r="2" fill="#FAFAFA"/>`;
    }).join('')}
    <circle cx="100" cy="${240-h-5}" r="5" fill="#FDD835"/>` : ''}
  </svg>`;
}

function svgMint(stage) {
  const h = 25 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  const leaves = (y, count) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const ly = y + i * 15;
      s += `<ellipse cx="${100 + side*18}" cy="${ly}" rx="14" ry="7" fill="#4CAF50" transform="rotate(${side*25} ${100+side*18} ${ly})"/>`;
      s += `<ellipse cx="${100 + side*18}" cy="${ly}" rx="10" ry="4" fill="#66BB6A" transform="rotate(${side*25} ${100+side*18} ${ly})" opacity="0.6"/>`;
    }
    return s;
  };
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <line x1="100" y1="240" x2="100" y2="${240-h}" stroke="#388E3C" stroke-width="3" stroke-linecap="round"/>
    ${stage >= 1 ? leaves(220, 1) : ''}
    ${stage >= 2 ? leaves(200, 2) : ''}
    ${stage >= 3 ? leaves(180, 3) : ''}
    ${stage >= 4 ? leaves(160, 4) + `<ellipse cx="100" cy="${240-h-5}" rx="10" ry="6" fill="#81C784"/>` : ''}
  </svg>`;
}

function svgSunflower(stage) {
  const h = 40 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <line x1="100" y1="240" x2="100" y2="${240-h}" stroke="#388E3C" stroke-width="4" stroke-linecap="round"/>
    ${stage >= 1 ? `<ellipse cx="85" cy="220" rx="15" ry="8" fill="#4CAF50" transform="rotate(-30 85 220)"/>
    <ellipse cx="115" cy="215" rx="15" ry="8" fill="#4CAF50" transform="rotate(30 115 215)"/>` : ''}
    ${stage >= 2 ? `<ellipse cx="80" cy="200" rx="12" ry="6" fill="#66BB6A" transform="rotate(-40 80 200)"/>
    <ellipse cx="120" cy="195" rx="12" ry="6" fill="#66BB6A" transform="rotate(40 120 195)"/>` : ''}
    ${stage >= 3 ? `<circle cx="100" cy="${240-h-5}" r="15" fill="#FDD835" opacity="0.5"/>` : ''}
    ${stage >= 4 ? `${Array.from({length:10}, (_, i) => {
      const a = (Math.PI*2*i)/10;
      const px = 100 + Math.cos(a)*20;
      const py = (240-h-5) + Math.sin(a)*20;
      return `<ellipse cx="${px}" cy="${py}" rx="10" ry="5" fill="#FDD835" transform="rotate(${(a*180/Math.PI)+90} ${px} ${py})"/>`;
    }).join('')}
    <circle cx="100" cy="${240-h-5}" r="12" fill="#795548"/>
    <circle cx="100" cy="${240-h-5}" r="8" fill="#5D4037"/>` : ''}
  </svg>`;
}

function svgSucculent(stage) {
  const s = 0.4 + stage * 0.15;
  const sway = stage >= 4 ? 'style="animation:plantSway 4s ease-in-out infinite"' : '';
  const petal = (cx, cy, r, color, rot) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.6}" fill="${color}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <g transform="translate(100,220) scale(${s})">
      ${petal(0, 0, 20, '#66BB6A', 0)}
      ${stage >= 1 ? `${petal(-15, -10, 16, '#81C784', -30)}${petal(15, -10, 16, '#81C784', 30)}` : ''}
      ${stage >= 2 ? `${petal(-20, -25, 14, '#A5D6A7', -50)}${petal(20, -25, 14, '#A5D6A7', 50)}${petal(0, -30, 14, '#81C784', 0)}` : ''}
      ${stage >= 3 ? `${petal(-10, -40, 12, '#C8E6C9', -20)}${petal(10, -40, 12, '#C8E6C9', 20)}` : ''}
      ${stage >= 4 ? `${petal(0, -50, 10, '#E8F5E9', 0)}<circle cx="0" cy="-50" r="4" fill="#FFEB3B" opacity="0.7"/>` : ''}
    </g>
  </svg>`;
}

function svgGinkgo(stage) {
  const h = 40 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <rect x="96" y="${240-h}" width="8" height="${h}" rx="3" fill="#8D6E63"/>
    ${stage >= 1 ? `<line x1="100" y1="${240-h*0.6}" x2="80" y2="${240-h*0.7}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 2 ? `<line x1="100" y1="${240-h*0.5}" x2="125" y2="${240-h*0.6}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 3 ? `<ellipse cx="100" cy="${240-h-10}" rx="30" ry="25" fill="#FDD835" opacity="0.5"/>` : ''}
    ${stage >= 4 ? `${Array.from({length:8}, (_, i) => {
      const a = (Math.PI*2*i)/8;
      const r = 25 + (i%2)*8;
      const cx = 100 + Math.cos(a)*r*0.7;
      const cy = (240-h-10) + Math.sin(a)*r*0.6;
      return `<path d="M${cx} ${cy} Q${cx-5} ${cy-10} ${cx} ${cy-12} Q${cx+5} ${cy-10} ${cx} ${cy}" fill="#FDD835" opacity="0.8"/>`;
    }).join('')}
    <ellipse cx="100" cy="${240-h-10}" rx="35" ry="28" fill="#FFEB3B" opacity="0.4"/>` : ''}
  </svg>`;
}

function svgBamboo(stage) {
  const segments = 1 + stage;
  const sway = stage >= 4 ? 'style="animation:plantSway 2.5s ease-in-out infinite"' : '';
  let segs = '';
  const segH = 35;
  for (let i = 0; i < segments; i++) {
    const y = 240 - (i+1)*segH;
    segs += `<rect x="95" y="${y}" width="10" height="${segH-2}" rx="4" fill="#4CAF50"/>`;
    segs += `<line x1="93" y1="${y+segH-1}" x2="107" y2="${y+segH-1}" stroke="#388E3C" stroke-width="2"/>`;
  }
  const topY = 240 - segments*segH;
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    ${segs}
    ${stage >= 2 ? `<path d="M105 ${topY+15} Q125 ${topY+5} 140 ${topY+10}" stroke="#66BB6A" stroke-width="1.5" fill="none"/>
    <ellipse cx="135" cy="${topY+8}" rx="12" ry="4" fill="#66BB6A" transform="rotate(15 135 ${topY+8})"/>` : ''}
    ${stage >= 3 ? `<path d="M95 ${topY+25} Q75 ${topY+15} 60 ${topY+20}" stroke="#66BB6A" stroke-width="1.5" fill="none"/>
    <ellipse cx="65" cy="${topY+18}" rx="12" ry="4" fill="#66BB6A" transform="rotate(-15 65 ${topY+18})"/>` : ''}
    ${stage >= 4 ? `<path d="M105 ${topY+5} Q130 ${topY-10} 145 ${topY}" stroke="#81C784" stroke-width="1.5" fill="none"/>
    <ellipse cx="140" cy="${topY-2}" rx="14" ry="4" fill="#81C784" transform="rotate(10 140 ${topY-2})"/>
    <path d="M95 ${topY+5} Q70 ${topY-10} 55 ${topY}" stroke="#81C784" stroke-width="1.5" fill="none"/>
    <ellipse cx="60" cy="${topY-2}" rx="14" ry="4" fill="#81C784" transform="rotate(-10 60 ${topY-2})"/>` : ''}
  </svg>`;
}

function svgLavender(stage) {
  const h = 30 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 2.5s ease-in-out infinite"' : '';
  const stems = stage >= 2 ? 3 : 1;
  let content = '';
  for (let i = 0; i < stems; i++) {
    const ox = (i - 1) * 20;
    const sh = h - i * 10;
    content += `<line x1="${100+ox}" y1="240" x2="${100+ox}" y2="${240-sh}" stroke="#66BB6A" stroke-width="2" stroke-linecap="round"/>`;
    if (stage >= 3) {
      for (let j = 0; j < 4; j++) {
        const by = 240 - sh + j * 8;
        content += `<ellipse cx="${100+ox}" cy="${by}" rx="4" ry="3" fill="#9C27B0" opacity="0.7"/>`;
      }
    }
    if (stage >= 4) {
      for (let j = 0; j < 6; j++) {
        const by = 240 - sh - 5 + j * 6;
        content += `<ellipse cx="${100+ox}" cy="${by}" rx="5" ry="3.5" fill="#AB47BC"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    ${content}
    ${stage >= 1 ? `<ellipse cx="90" cy="232" rx="10" ry="4" fill="#66BB6A" transform="rotate(-20 90 232)"/>
    <ellipse cx="110" cy="230" rx="10" ry="4" fill="#66BB6A" transform="rotate(20 110 230)"/>` : ''}
  </svg>`;
}

function svgMaple(stage) {
  const h = 40 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <rect x="95" y="${240-h}" width="10" height="${h}" rx="4" fill="#8D6E63"/>
    ${stage >= 1 ? `<line x1="100" y1="${240-h*0.6}" x2="75" y2="${240-h*0.7}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 2 ? `<line x1="100" y1="${240-h*0.5}" x2="130" y2="${240-h*0.55}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 3 ? `<ellipse cx="100" cy="${240-h-5}" rx="35" ry="30" fill="#E53935" opacity="0.4"/>` : ''}
    ${stage >= 4 ? `<ellipse cx="100" cy="${240-h-5}" rx="40" ry="35" fill="#E53935" opacity="0.6"/>
    <ellipse cx="85" cy="${240-h}" rx="25" ry="20" fill="#F44336" opacity="0.5"/>
    <ellipse cx="115" cy="${240-h+5}" rx="25" ry="20" fill="#C62828" opacity="0.5"/>
    ${Array.from({length:5}, (_, i) => {
      const a = (Math.PI*2*i)/5 - Math.PI/2;
      const cx = 100 + Math.cos(a)*20;
      const cy = (240-h-5) + Math.sin(a)*15;
      return `<path d="M${cx} ${cy} l-3 -8 l3 -3 l3 3 z" fill="#FF5722" opacity="0.7"/>`;
    }).join('')}` : ''}
  </svg>`;
}

function svgCherryBlossom(stage) {
  const h = 40 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <path d="M97 240 Q95 ${240-h*0.5} 90 ${240-h}" stroke="#8D6E63" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M103 240 Q105 ${240-h*0.5} 110 ${240-h}" stroke="#8D6E63" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${stage >= 1 ? `<line x1="95" y1="${240-h*0.6}" x2="75" y2="${240-h*0.65}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 2 ? `<line x1="105" y1="${240-h*0.5}" x2="130" y2="${240-h*0.55}" stroke="#8D6E63" stroke-width="3" stroke-linecap="round"/>` : ''}
    ${stage >= 3 ? `<ellipse cx="100" cy="${240-h-5}" rx="30" ry="25" fill="#F8BBD0" opacity="0.5"/>` : ''}
    ${stage >= 4 ? `<ellipse cx="100" cy="${240-h-5}" rx="38" ry="32" fill="#F8BBD0" opacity="0.6"/>
    ${Array.from({length:8}, (_, i) => {
      const a = (Math.PI*2*i)/8;
      const cx = 100 + Math.cos(a)*22;
      const cy = (240-h-5) + Math.sin(a)*18;
      return `<circle cx="${cx}" cy="${cy}" r="5" fill="#F48FB1" opacity="0.7"/>`;
    }).join('')}
    <circle cx="100" cy="${240-h-5}" r="6" fill="#FCE4EC"/>
    <!-- falling petals -->
    <ellipse cx="75" cy="${240-h+30}" rx="3" ry="2" fill="#F48FB1" opacity="0.6" class="falling-leaf"/>
    <ellipse cx="125" cy="${240-h+40}" rx="3" ry="2" fill="#F48FB1" opacity="0.5" class="falling-leaf"/>` : ''}
  </svg>`;
}

function svgRedwood(stage) {
  const h = 50 + stage * 35;
  const sway = stage >= 4 ? 'style="animation:plantSway 4s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <rect x="93" y="${240-h}" width="14" height="${h}" rx="5" fill="#5D4037"/>
    ${stage >= 1 ? `<path d="M100 ${240-h} L80 ${240-h+30} L120 ${240-h+30} Z" fill="#2E7D32" opacity="0.6"/>` : ''}
    ${stage >= 2 ? `<path d="M100 ${240-h-15} L75 ${240-h+20} L125 ${240-h+20} Z" fill="#388E3C" opacity="0.6"/>` : ''}
    ${stage >= 3 ? `<path d="M100 ${240-h-30} L70 ${240-h+10} L130 ${240-h+10} Z" fill="#2E7D32" opacity="0.7"/>` : ''}
    ${stage >= 4 ? `<path d="M100 ${240-h-45} L65 ${240-h} L135 ${240-h} Z" fill="#1B5E20" opacity="0.8"/>
    <path d="M100 ${240-h-35} L70 ${240-h+10} L130 ${240-h+10} Z" fill="#2E7D32" opacity="0.7"/>
    <path d="M100 ${240-h-20} L75 ${240-h+20} L125 ${240-h+20} Z" fill="#388E3C" opacity="0.6"/>` : ''}
  </svg>`;
}

function svgGlowingMushroom(stage) {
  const s = 0.3 + stage * 0.175;
  const sway = stage >= 4 ? 'style="animation:plantSway 3s ease-in-out infinite"' : '';
  return `<svg viewBox="0 0 200 260" ${sway}>
    ${svgSoil()}
    <g transform="translate(100,230) scale(${s})">
      <!-- stem -->
      <rect x="-8" y="-40" width="16" height="40" rx="6" fill="#E0E0E0"/>
      <!-- cap -->
      <ellipse cx="0" cy="-45" rx="35" ry="22" fill="#42A5F5" opacity="0.8"/>
      <ellipse cx="0" cy="-50" rx="28" ry="16" fill="#64B5F6" opacity="0.6"/>
      ${stage >= 2 ? `<circle cx="-12" cy="-48" r="4" fill="#BBDEFB" opacity="0.7"/>
      <circle cx="10" cy="-42" r="3" fill="#BBDEFB" opacity="0.6"/>` : ''}
      ${stage >= 3 ? `<circle cx="0" cy="-55" r="3" fill="#E3F2FD" opacity="0.8"/>
      <circle cx="-18" cy="-40" r="2.5" fill="#E3F2FD" opacity="0.7"/>` : ''}
      ${stage >= 4 ? `<!-- glow -->
      <ellipse cx="0" cy="-45" rx="45" ry="30" fill="#42A5F5" opacity="0.15"/>
      <ellipse cx="0" cy="-45" rx="55" ry="38" fill="#42A5F5" opacity="0.08"/>
      <!-- floating particles -->
      <circle cx="-25" cy="-65" r="2" fill="#64B5F6" opacity="0.8">
        <animate attributeName="cy" values="-65;-75;-65" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="-70" r="1.5" fill="#90CAF9" opacity="0.7">
        <animate attributeName="cy" values="-70;-82;-70" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="5" cy="-60" r="2" fill="#BBDEFB" opacity="0.6">
        <animate attributeName="cy" values="-60;-72;-60" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="-15" cy="-75" r="1.5" fill="#64B5F6" opacity="0.5">
        <animate attributeName="cy" values="-75;-88;-75" dur="3s" repeatCount="indefinite"/>
      </circle>` : ''}
    </g>
  </svg>`;
}

// === Sound System (Web Audio API) ===
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function startWhiteNoise() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  // Create brown noise buffer for softer sound
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // normalize
  }

  noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  noiseGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);

  noiseNode.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseNode.start();
}

function stopWhiteNoise() {
  if (noiseGain && audioCtx) {
    noiseGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (noiseNode) {
        try { noiseNode.stop(); } catch(e) {}
        noiseNode = null;
      }
      noiseGain = null;
    }, 600);
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');

  if (soundEnabled) {
    btn.classList.add('active');
    iconOff.style.display = 'none';
    iconOn.style.display = 'block';
    startWhiteNoise();
  } else {
    btn.classList.remove('active');
    iconOff.style.display = 'block';
    iconOn.style.display = 'none';
    stopWhiteNoise();
  }
}

function playCompletionSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Play a pleasant chime sequence (3 notes)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.2 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 1);
    });
  } catch(e) { /* Audio not available */ }
}

// === Desktop Notification ===
function sendDesktopNotification(harvestCount, dateStr) {
  if (Notification.permission === 'granted') {
    const plantName = selectedPlant ? selectedPlant.name : '植物';
    new Notification('FocusTree - 专注完成！', {
      body: `恭喜！你收获了 ${harvestCount} 颗${plantName}`,
      icon: '🌳',
      tag: 'focus-complete'
    });
  }
}

function requestNotification() {
  if (!('Notification' in window)) {
    alert('此浏览器不支持桌面通知');
    return;
  }
  Notification.requestPermission().then(permission => {
    updateSettingsUI();
    if (permission === 'granted') {
      new Notification('FocusTree', { body: '通知已开启，专注完成时会提醒你' });
    }
  });
}

// === Theme Toggle (Dark Mode) ===
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('focusTree_darkMode', isDarkMode ? '1' : '0');
}

function loadTheme() {
  const saved = localStorage.getItem('focusTree_darkMode');
  if (saved === '1') {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
  }
}

// === Settings Page ===
function updateSettingsUI() {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.checked = isDarkMode;

  // Notification button
  const notifBtn = document.getElementById('notif-btn');
  if (notifBtn) {
    if (!('Notification' in window)) {
      notifBtn.textContent = '不支持';
      notifBtn.disabled = true;
    } else if (Notification.permission === 'granted') {
      notifBtn.textContent = '已开启';
      notifBtn.disabled = true;
    } else if (Notification.permission === 'denied') {
      notifBtn.textContent = '已拒绝';
      notifBtn.disabled = true;
    } else {
      notifBtn.textContent = '开启';
      notifBtn.disabled = false;
    }
  }
}

function showClearConfirm() {
  document.getElementById('clear-modal').style.display = 'flex';
}

function hideClearConfirm() {
  document.getElementById('clear-modal').style.display = 'none';
}

function confirmClearData() {
  localStorage.removeItem('focusTree_forest');
  hideClearConfirm();
  alert('所有森林数据已清除');
  navigateTo('landing');
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  updateLandingTreeCount();
  updateTimeDisplay();
  startIdleLeaves();
});
