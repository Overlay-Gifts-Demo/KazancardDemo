/* ══════════════════════════════════════
    DISH DATA SETUP
   ══════════════════════════════════════ */
const dishes = [
  { name: "ramenshoyu",      folder: "ramenshoyu",      model: "ramenshoyu.glb",     thumb: "ramenshoyu.png",     scale: "11 11 11",     rotation: "90 90 90" },
  { name: "ramenshio",       folder: "ramenshio",       model: "ramenshio.glb",      thumb: "ramenshio.png",      scale: "1.3 1.3 1.3",  rotation: "90 90 90" },
  { name: "rameshkaramiso", folder: "rameshkaramiso", model: "rameshkaramiso.glb", thumb: "rameshkaramiso.png", scale: "1.3 1.3 1.3",  rotation: "90 90 90" },
];

let currentIndex   = -1;
let arStarted      = false;
let modelTimeout   = null;
let swipeHintShown = false;
let tableModeOn    = false;

const tableEntity    = document.querySelector('#tableEntity');
const tableBtn       = document.querySelector('#tableBtn');
const tableBtnText   = document.querySelector('#tableBtnText');
const tableBadge     = document.querySelector('#tableBadge');
const tableShadow    = document.querySelector('#tableShadow');
const modelEntity    = document.querySelector('#modelEntity');
const dishLabel      = document.querySelector('#dishLabel');
const dishLabelText  = document.querySelector('#dishLabelText');
const carousel       = document.querySelector('#dishCarousel');
const logo           = document.querySelector('#logo');
const scanHint       = document.querySelector('#scanHint');
const target         = document.querySelector('#target1');
const arScene        = document.querySelector('#arScene');
const loadingOverlay = document.querySelector('#loadingOverlay');
const loadingStatus  = document.querySelector('#loadingStatus');
const errorOverlay   = document.querySelector('#errorOverlay');
const modelLoader    = document.querySelector('#modelLoader');
const swipeZone      = document.querySelector('#swipeZone');
const swipeHint      = document.querySelector('#swipeHint');
const swipeFlash     = document.querySelector('#swipeFlash');
const dishCounter    = document.querySelector('#dishCounter');

const alwaysVisible = [carousel, logo, dishCounter, tableBtn];
const markerEls     = [dishLabel];

/* ── MUTATION OBSERVER ── */
const videoObserver = new MutationObserver(() => {
  const vid = arScene.querySelector('video');
  if (vid) {
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.setAttribute('muted', '');
    vid.muted = true;
    videoObserver.disconnect();
  }
});
videoObserver.observe(arScene, { childList: true, subtree: true });

/* ── BUILD CAROUSEL ── */
dishes.forEach((dish, i) => {
  const thumb = document.createElement('div');
  thumb.className = 'dish-thumb' + (i === 0 ? ' active' : '');
  thumb.innerHTML = `
    <div class="thumb-img-wrap">
      <img src="3d-model/${dish.folder}/${dish.thumb}"
           onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22%3E%3Crect width=%2250%22 height=%2250%22 rx=%2225%22 fill=%22%231a1510%22/%3E%3C/svg%3E'"
           alt="${dish.name}" draggable="false">
      <div class="thumb-active-ring"></div>
    </div>
    <span>${dish.name}</span>
  `;
  thumb.addEventListener('click', () => selectDish(i));
  carousel.appendChild(thumb);
});

/* ── BUILD COUNTER DOTS ── */
dishes.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'counter-dot' + (i === 0 ? ' active' : '');
  dot.dataset.index = i;
  dishCounter.appendChild(dot);
});

function updateCounterDots(index) {
  document.querySelectorAll('.counter-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

/* ── SELECT DISH ── */
function selectDish(index) {
  if (index === currentIndex) return;
  currentIndex = index;
  const dish = dishes[index];

  if (modelTimeout) { clearTimeout(modelTimeout); modelTimeout = null; }

  modelLoader.classList.add('show');
  modelEntity.removeAttribute('gltf-model');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modelEntity.setAttribute('gltf-model', `3d-model/${dish.folder}/${dish.model}`);
      modelEntity.setAttribute('scale',    dish.scale);
      modelEntity.setAttribute('rotation', dish.rotation);
      modelEntity.setAttribute('position', '0 0 0');
    });
  });

  const onModelLoaded = () => {
    modelLoader.classList.remove('show');
    if (modelTimeout) { clearTimeout(modelTimeout); modelTimeout = null; }
    modelEntity.removeEventListener('model-error', onModelError);
  };
  const onModelError = () => {
    modelLoader.classList.remove('show');
    if (modelTimeout) { clearTimeout(modelTimeout); modelTimeout = null; }
    console.warn('Model failed to load:', dish.model);
    modelEntity.removeEventListener('model-loaded', onModelLoaded);
  };
  modelEntity.addEventListener('model-loaded', onModelLoaded, { once: true });
  modelEntity.addEventListener('model-error',  onModelError,  { once: true });

  modelTimeout = setTimeout(() => modelLoader.classList.remove('show'), 8000);

  dishLabelText.textContent = dish.name;

  document.querySelectorAll('.dish-thumb').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.dish-thumb')[index]
    .scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

  updateCounterDots(index);

  if (tableModeOn) {
    syncTableEntity(dish);
  }
}

/* ── SYNC TABLE ENTITY ── */
function syncTableEntity(dish) {
  tableEntity.removeAttribute('gltf-model');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tableEntity.setAttribute('gltf-model', `3d-model/${dish.folder}/${dish.model}`);
      const parts  = dish.scale.split(' ').map(Number);
      const factor = 0.35;
      tableEntity.setAttribute('scale', parts.map(v => v * factor).join(' '));
      tableEntity.setAttribute('rotation', dish.rotation);
    });
  });
}

/* ── SEE ON TABLE MODE ── */
function setTableMode(on) {
  tableModeOn = on;
  if (on) {
    const dish = dishes[currentIndex];
    tableEntity.setAttribute('visible', 'true');
    syncTableEntity(dish);
    modelEntity.setAttribute('visible', 'false');
    tableBtn.classList.add('table-active');
    tableBtnText.textContent = 'Back to Card';
    tableBadge.classList.add('visible');
    tableShadow.classList.add('visible');
    dishLabel.style.opacity = '0';
    dishLabel.style.pointerEvents = 'none';
    scanHint.style.opacity = '0';
  } else {
    tableEntity.setAttribute('visible', 'false');
    tableEntity.removeAttribute('gltf-model');
    modelEntity.setAttribute('visible', 'true');
    tableBtn.classList.remove('table-active');
    tableBtnText.textContent = 'See on Table';
    tableBadge.classList.remove('visible');
    tableShadow.classList.remove('visible');
    scanHint.style.opacity = '1';
  }
}

tableBtn.addEventListener('click', (e) => {
  e.preventDefault();
  setTableMode(!tableModeOn);
});

/* ── SWIPE GESTURES ── */
let touchStartX    = 0;
let touchStartY    = 0;
let touchStartTime = 0;
let swipeLocked    = false;

swipeZone.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  touchStartX    = t.clientX;
  touchStartY    = t.clientY;
  touchStartTime = Date.now();
}, { passive: true });

swipeZone.addEventListener('touchend', (e) => {
  if (swipeLocked) return;
  const t     = e.changedTouches[0];
  const dx    = t.clientX - touchStartX;
  const dy    = t.clientY - touchStartY;
  const dt    = Date.now() - touchStartTime;
  if (dt > 500 || Math.abs(dx) < 50 || Math.abs(dy) > 80) return;

  swipeLocked = true;
  setTimeout(() => { swipeLocked = false; }, 300);
  triggerSwipe(dx < 0 ? 'left' : 'right');
}, { passive: true });

function triggerSwipe(direction) {
  const total = dishes.length;
  const next  = direction === 'left' ? (currentIndex + 1) % total : (currentIndex - 1 + total) % total;
  swipeFlash.className = direction + ' flash';
  swipeFlash.addEventListener('animationend', () => { swipeFlash.className = ''; }, { once: true });
  selectDish(next);
}

function showSwipeHintOnce() {
  if (swipeHintShown) return;
  swipeHintShown = true;
  setTimeout(() => {
    swipeHint.classList.add('show');
    setTimeout(() => swipeHint.classList.remove('show'), 2500);
  }, 1200);
}

/* ── START AR PIPELINE ── */
async function startAR() {
  if (arStarted) return;
  loadingOverlay.classList.add('show');
  try {
    arScene.style.visibility  = 'visible';
    arScene.style.opacity     = '1';
    arScene.style.pointerEvents = 'auto';

    let readyFired = false;
    const onReady = () => {
      if (readyFired) return;
      readyFired = true;
      loadingOverlay.classList.remove('show');
      scanHint.style.opacity = '1';
      arStarted = true;
      swipeZone.classList.add('active');
      alwaysVisible.forEach(el => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; });
      selectDish(0);
      showSwipeHintOnce();
    };

    arScene.addEventListener('loaded',   onReady, { once: true });
    arScene.addEventListener('arReady',  onReady, { once: true });
    setTimeout(onReady, 5000);
  } catch (err) {
    loadingOverlay.classList.remove('show');
    errorOverlay.classList.add('show');
  }
}

document.querySelector('#retryBtn').addEventListener('click', (e) => {
  e.preventDefault();
  errorOverlay.classList.remove('show');
  startAR();
});

target.addEventListener('targetFound', () => {
  if (tableModeOn) return;
  markerEls.forEach(el => { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; });
  scanHint.style.opacity = '0';
});

target.addEventListener('targetLost', () => {
  if (tableModeOn) return;
  markerEls.forEach(el => { el.style.opacity = '0'; el.style.pointerEvents = 'none'; });
  scanHint.style.opacity = '1';
});

window.addEventListener('DOMContentLoaded', startAR);
