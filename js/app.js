/* =========================================================================
   ANISH NIROULA — ELECTRICAL ENGINEERING PORTFOLIO (anish-niroula.com.np)
   APPLICATION LOGIC: ROUTING, IEC SLD INTERLOCK, ACADEMIC ROUTE & LIGHTBOX
   ========================================================================= */

/* -------------------------------------------------------------------------
   0. THEME MANAGEMENT (DARK / LIGHT MODE)
   Synchronizes local storage, OS media query, and meta theme-color for iOS/Android
   ------------------------------------------------------------------------- */
function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem('site-theme');
  } catch (e) {}
  // Default is strictly Light Mode; Dark Mode only activates when explicitly selected
  const isDark = (saved === 'dark');
  applyTheme(isDark);
}

function applyTheme(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update theme-color meta tag for Safari iOS and Chrome Android status bars
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#0B0F17' : '#F6F5F0');
  }
  const metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (metaAppleStatus) {
    metaAppleStatus.setAttribute('content', isDark ? 'black-translucent' : 'default');
  }

  // Update toggle button states and icons
  const toggleBtn = document.getElementById('themeToggleBtn');
  const toggleText = document.getElementById('themeToggleText');
  const iconMoon = document.getElementById('themeIconMoon');
  const iconSun = document.getElementById('themeIconSun');
  const footerLabel = document.getElementById('footerThemeLabel');

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    toggleBtn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  }
  if (toggleText) {
    toggleText.textContent = isDark ? 'Light' : 'Dark';
  }
  if (iconMoon && iconSun) {
    if (isDark) {
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    } else {
      iconMoon.classList.remove('hidden');
      iconSun.classList.add('hidden');
    }
  }
  if (footerLabel) {
    footerLabel.textContent = `Theme: ${isDark ? 'Light Mode ☀' : 'Dark Mode ☾'}`;
  }

  // Invalidate Leaflet map size if already open
  if (typeof nepalMapInstance !== 'undefined' && nepalMapInstance) {
    setTimeout(() => {
      try { nepalMapInstance.invalidateSize(); } catch (e) {}
    }, 120);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextState = !isDark;
  try {
    localStorage.setItem('site-theme', nextState ? 'dark' : 'light');
  } catch (e) {}
  applyTheme(nextState);
}

function scrollSldToBay(bayId) {
  const container = document.getElementById('careerSldScrollWrapper');
  if (!container) return;
  const bayOffsets = {
    'bay01': 0,
    'bay02': 280,
    'bay03': 600,
    'bay04': 920
  };
  if (typeof bayOffsets[bayId] !== 'undefined') {
    container.scrollTo({ left: bayOffsets[bayId], behavior: 'smooth' });
  }
}

function scrollAcadToNode(nodeId) {
  const container = document.getElementById('academicSvgScrollWrapper');
  if (!container) return;
  const nodeOffsets = {
    't01': 0,
    't02': 230,
    't03': 460,
    'nec1977': 680,
    't04': 920
  };
  if (typeof nodeOffsets[nodeId] !== 'undefined') {
    container.scrollTo({ left: nodeOffsets[nodeId], behavior: 'smooth' });
  }
}

/* -------------------------------------------------------------------------
   1. MULTI-VIEW NAVIGATION & ROUTING
   ------------------------------------------------------------------------- */
const VIEW_IDS = ['overview', 'career-sld', 'academics', 'research', 'projects', 'calculators'];

const VIEW_TITLES = {
  'overview': 'Anish Niroula — High Voltage Electrical Engineer & EPC Project Manager',
  'career-sld': 'Career Single-Line Diagram — Anish Niroula | anish-niroula.com.np',
  'academics': 'Academics & Licensure Route — Anish Niroula | anish-niroula.com.np',
  'research': 'Research & Publications — Anish Niroula | anish-niroula.com.np',
  'projects': 'Projects & Site Archive — Anish Niroula | anish-niroula.com.np',
  'calculators': 'Electrical Engineering Calculators (IEC, NBC 207, IS, BS | 400V - 400kV) — Anish Niroula | anish-niroula.com.np'
};

function switchView(viewId, updateHash = true) {
  if (!VIEW_IDS.includes(viewId)) viewId = 'overview';

  VIEW_IDS.forEach(id => {
    const el = document.getElementById(`view-${id}`);
    if (!el) return;
    if (id === viewId) {
      el.classList.remove('active');
      void el.offsetWidth; // Force DOM reflow to re-trigger transition
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Update navigation pill active highlights
  document.querySelectorAll('.nav-pill, .mobile-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === viewId);
  });

  // Update page document title
  if (VIEW_TITLES[viewId]) {
    document.title = VIEW_TITLES[viewId];
  }

  // Update URL hash for sharing / deep-linking
  if (updateHash) {
    if (window.location.hash !== `#${viewId}`) {
      window.location.hash = `#${viewId}`;
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  triggerRevealCheck();

  // Auto-scroll horizontal diagram wrapper on mobile (< 768px) to center active node
  if (window.innerWidth < 768) {
    if (viewId === 'career-sld') {
      setTimeout(() => {
        scrollSldToBay(typeof activeBayId !== 'undefined' && activeBayId ? activeBayId : 'bay04');
      }, 250);
    } else if (viewId === 'academics') {
      setTimeout(() => {
        scrollAcadToNode(typeof activeAcademicNodeId !== 'undefined' && activeAcademicNodeId ? activeAcademicNodeId : 'nec1977');
      }, 250);
    }
  }

  if (viewId === 'projects') {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!nepalMapInstance) {
          initNepalMap();
        } else {
          // If instance was created with 0x0 dimensions while hidden, reset it
          if (nepalMapInstance.getSize().x === 0 || nepalMapInstance.getSize().y === 0) {
            nepalMapInstance.remove();
            nepalMapInstance = null;
            initNepalMap();
          } else {
            nepalMapInstance.invalidateSize(true);
          }
        }
      }, 150);
      setTimeout(() => {
        if (nepalMapInstance) {
          nepalMapInstance.invalidateSize(true);
        }
      }, 600);
    });
  }
}

function jumpToContact() {
  switchView('overview');
  setTimeout(() => {
    const contactEl = document.getElementById('contact-section');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 120);
}

window.addEventListener('hashchange', () => {
  const h = window.location.hash.replace('#', '');
  if (VIEW_IDS.includes(h)) {
    switchView(h, false);
  }
});

/* -------------------------------------------------------------------------
   2. SCROLL REVEAL OBSERVER
   ------------------------------------------------------------------------- */
let revealObserver = null;

function initScrollReveal() {
  const blocks = document.querySelectorAll('.reveal-block');
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    blocks.forEach(b => revealObserver.observe(b));
  } else {
    blocks.forEach(b => b.classList.add('is-visible'));
  }
}

function triggerRevealCheck() {
  document.querySelectorAll('.reveal-block').forEach(b => {
    const rect = b.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96) {
      b.classList.add('is-visible');
    }
  });
}

/* -------------------------------------------------------------------------
   3. MULTI-PHOTO STORAGE & CLIENT-SIDE IMAGE COMPRESSION ENGINE
   IndexedDB backed with in-memory caching & HTML5 Canvas downsampling.
   Allows uploading 5, 10, 15+ high-res camera photos smoothly without quota issues.
   ------------------------------------------------------------------------- */
const DB_NAME = 'AniroulaPortfolioPhotosDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

let dbInstance = null;
const CUSTOM_PHOTOS_CACHE = {
  bay01: [],
  bay02: [],
  bay03: [],
  bay04: [],
  prasauni: [],
  chilime: [],
  trishuli3b: [],
  nagdhunga: [],
  samundratar: [],
  tamor: [],
  portrait: []
};

function getPhotoDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise(resolve => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported; using in-memory and local storage fallback.');
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
        }
      };
      req.onsuccess = e => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(null);
    }
  });
}

async function loadAllCustomPhotosFromDB() {
  const db = await getPhotoDB();
  if (!db) {
    try {
      const saved = localStorage.getItem('aniroula_custom_photos_json');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          if (CUSTOM_PHOTOS_CACHE[k]) CUSTOM_PHOTOS_CACHE[k] = parsed[k];
        });
      }
    } catch (e) { }
    return;
  }
  return new Promise(resolve => {
    try {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        // Reset cache arrays
        Object.keys(CUSTOM_PHOTOS_CACHE).forEach(k => CUSTOM_PHOTOS_CACHE[k] = []);
        list.forEach(item => {
          const cat = item.category || 'prasauni';
          if (!CUSTOM_PHOTOS_CACHE[cat]) {
            CUSTOM_PHOTOS_CACHE[cat] = [];
          }
          CUSTOM_PHOTOS_CACHE[cat].push(item);
        });
        resolve();
      };
      req.onerror = () => resolve();
    } catch (err) {
      resolve();
    }
  });
}

async function persistCustomPhoto(photoObj) {
  const cat = photoObj.category || 'prasauni';
  if (!CUSTOM_PHOTOS_CACHE[cat]) {
    CUSTOM_PHOTOS_CACHE[cat] = [];
  }
  CUSTOM_PHOTOS_CACHE[cat].unshift(photoObj);

  const db = await getPhotoDB();
  if (db) {
    try {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).put(photoObj);
    } catch (e) {
      console.warn('Error saving to IndexedDB:', e);
    }
  } else {
    try {
      localStorage.setItem('aniroula_custom_photos_json', JSON.stringify(CUSTOM_PHOTOS_CACHE));
    } catch (e) { }
  }
}

async function deleteCustomPhotoFromDB(photoId, category) {
  if (CUSTOM_PHOTOS_CACHE[category]) {
    CUSTOM_PHOTOS_CACHE[category] = CUSTOM_PHOTOS_CACHE[category].filter(p => p.id !== photoId);
  }
  const db = await getPhotoDB();
  if (db) {
    try {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(photoId);
    } catch (e) { }
  } else {
    try {
      localStorage.setItem('aniroula_custom_photos_json', JSON.stringify(CUSTOM_PHOTOS_CACHE));
    } catch (e) { }
  }
}

// Client-side HTML5 Canvas Image Downsampler (handles 5, 10, 15+ camera uploads smoothly)
function compressImageFile(file, maxWidth = 1600, maxHeight = 1200, quality = 0.82) {
  return new Promise(resolve => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

const memoryPhotos = {};

function getStoredPhoto(slotKey) {
  if (memoryPhotos[slotKey]) return memoryPhotos[slotKey];
  try {
    const local = localStorage.getItem('aniroula_v5_photo_' + slotKey);
    // Only accept user-uploaded local storage if it's a valid data URL
    if (local && (local.startsWith('data:image/') || local.startsWith('http://') || local.startsWith('https://'))) {
      return local;
    }
  } catch (e) { }
  return STATIC_IMAGE_REGISTRY[slotKey] || null;
}

function saveStoredPhoto(slotKey, dataUrl) {
  memoryPhotos[slotKey] = dataUrl;
  try {
    localStorage.setItem('aniroula_v5_photo_' + slotKey, dataUrl);
  } catch (e) {
    console.warn('localStorage quota reached or unavailable; storing in session memory.', e);
  }
}

function handlePhotoUpload(event, slotKey, refreshBay = false) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  compressImageFile(file, 1400, 1400, 0.85).then(dataUrl => {
    if (!dataUrl) return;
    saveStoredPhoto(slotKey, dataUrl);
    syncHeroPortrait();
    renderSitePhotoArchive();
    if (refreshBay) {
      renderCareerBayDetail();
    }
  });
}

function syncHeroPortrait() {
  const custom = getStoredPhoto('slot_portrait');
  const targetSrc = (custom && custom.startsWith('data:image/'))
    ? custom
    : (STATIC_IMAGE_REGISTRY.slot_portrait || 'assets/images/portrait.jpg?v=3.4');

  const img = document.getElementById('heroPortraitImg');
  const fallback = document.getElementById('heroPortraitFallback');
  if (!img) return;

  // Resolve target to absolute URL to compare properly
  const resolvedTarget = new URL(targetSrc, window.location.href).href;
  if (img.src !== resolvedTarget) {
    img.src = targetSrc;
  }

  // Ensure image element is visible by default
  img.classList.remove('hidden');
  if (fallback) fallback.classList.add('hidden');

  img.onload = () => {
    img.classList.remove('hidden');
    if (fallback) fallback.classList.add('hidden');
  };

  img.onerror = () => {
    console.warn('Hero portrait load error for:', img.src);
    if (!img.naturalWidth) {
      img.classList.add('hidden');
      if (fallback) fallback.classList.remove('hidden');
    }
  };

  if (img.complete && img.naturalWidth > 0) {
    img.classList.remove('hidden');
    if (fallback) fallback.classList.add('hidden');
  }
}

/* -------------------------------------------------------------------------
   FULL-FEATURED LIGHTBOX WITH ALBUM SLIDER NAVIGATION
   ------------------------------------------------------------------------- */
let lightboxAlbum = [];
let lightboxIndex = 0;

function openAlbumLightbox(album, startIndex = 0) {
  if (!album || !album.length) return;
  lightboxAlbum = album;
  lightboxIndex = Math.max(0, Math.min(startIndex, album.length - 1));
  updateLightboxContent();
  document.getElementById('siteLightbox').classList.add('open');
}

function updateLightboxContent() {
  if (!lightboxAlbum.length) return;
  const item = lightboxAlbum[lightboxIndex];
  const imgEl = document.getElementById('lightboxImageEl');
  const titleEl = document.getElementById('lightboxTitleEl');
  const capEl = document.getElementById('lightboxCaptionEl');
  const countEl = document.getElementById('lightboxCounterEl');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (imgEl) imgEl.src = item.src || '';
  if (titleEl) titleEl.textContent = item.title || '';
  if (capEl) {
    const text = item.caption || item.desc || '';
    capEl.textContent = text;
    capEl.style.display = text ? 'block' : 'none';
  }
  if (countEl) countEl.textContent = `${lightboxIndex + 1} / ${lightboxAlbum.length}`;

  const hasMultiple = lightboxAlbum.length > 1;
  if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
}

function navigateLightbox(direction) {
  if (!lightboxAlbum.length) return;
  lightboxIndex = (lightboxIndex + direction + lightboxAlbum.length) % lightboxAlbum.length;
  updateLightboxContent();
}

function openLightbox(slotKey, caption) {
  let src = getStoredPhoto(slotKey);
  if (slotKey === 'slot_portrait' && (!src || !src.startsWith('data:image/'))) {
    src = 'assets/images/portrait.jpg?v=3.4';
  }
  if (!src) return;

  let title = caption || 'Site Photograph';
  let desc = '';
  if (slotKey === 'slot_portrait') {
    title = 'A Day in the Life';
    desc = '';
  }

  openAlbumLightbox([{
    src: src,
    title: title,
    caption: desc
  }], 0);
}

function closeLightbox() {
  const box = document.getElementById('siteLightbox');
  if (box) box.classList.remove('open');
}

function closeLightboxBackdrop(event) {
  if (event.target.id === 'siteLightbox') {
    closeLightbox();
  }
}

document.addEventListener('keydown', e => {
  const box = document.getElementById('siteLightbox');
  const isOpen = box && box.classList.contains('open');
  if (!isOpen) return;

  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1);
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1);
  }
});

/* Mobile Touch Swipe Gestures for Lightbox (iOS Safari & Android Chrome) */
let lightboxTouchStartX = 0;
let lightboxTouchStartY = 0;

document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('siteLightbox');
  if (!box) return;

  box.addEventListener('touchstart', e => {
    if (!e.touches || !e.touches[0]) return;
    lightboxTouchStartX = e.touches[0].clientX;
    lightboxTouchStartY = e.touches[0].clientY;
  }, { passive: true });

  box.addEventListener('touchend', e => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const diffX = e.changedTouches[0].clientX - lightboxTouchStartX;
    const diffY = e.changedTouches[0].clientY - lightboxTouchStartY;
    // Horizontal swipe threshold 45px
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        navigateLightbox(1);  // Swipe left -> next image
      } else {
        navigateLightbox(-1); // Swipe right -> previous image
      }
    } else if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX)) {
      closeLightbox(); // Swipe down -> close
    }
  }, { passive: true });
});

/* -------------------------------------------------------------------------
   4. CAREER SLD (MUTUAL-EXCLUSION INTERLOCK LOGIC)
   ------------------------------------------------------------------------- */
const BAY_SWITCH_STATE = {
  bay01: { dsClosed: false, cbClosed: false },
  bay02: { dsClosed: false, cbClosed: false },
  bay03: { dsClosed: false, cbClosed: false },
  bay04: { dsClosed: true, cbClosed: true } // Initializes with current role closed
};

let selectedBayId = 'bay04';

function isolateOtherBays(activeBayId) {
  Object.keys(BAY_SWITCH_STATE).forEach(id => {
    if (id !== activeBayId) {
      BAY_SWITCH_STATE[id].dsClosed = false;
      BAY_SWITCH_STATE[id].cbClosed = false;
    }
  });
}

function toggleDisconnector(bayId) {
  const st = BAY_SWITCH_STATE[bayId];
  if (!st) return;

  const wasClosed = st.dsClosed && st.cbClosed;
  if (wasClosed) {
    st.dsClosed = false;
    st.cbClosed = false;
    selectedBayId = null;
  } else {
    isolateOtherBays(bayId);
    st.dsClosed = true;
    st.cbClosed = true;
    selectedBayId = bayId;
  }
  syncSldVisuals();
  renderCareerBayDetail();
}

function toggleBreaker(bayId) {
  toggleDisconnector(bayId);
}

function selectAndEnergizeBay(bayId) {
  const st = BAY_SWITCH_STATE[bayId];
  if (!st) return;

  isolateOtherBays(bayId);
  st.dsClosed = true;
  st.cbClosed = true;
  selectedBayId = bayId;
  syncSldVisuals();
  renderCareerBayDetail();
}

function syncSldVisuals() {
  Object.keys(BAY_SWITCH_STATE).forEach(id => {
    const st = BAY_SWITCH_STATE[id];
    const x = BAY_X[id];
    const isClosed = st.dsClosed && st.cbClosed;

    const dsBar = document.getElementById(`ds-bar-${id}`);
    const dsTopDot = document.getElementById(`ds-topdot-${id}`);
    const dsBlade = document.getElementById(`ds-blade-${id}`);
    const dsLabel = document.getElementById(`ds-label-${id}`);
    const dsCbLink = document.getElementById(`ds-cb-link-${id}`);

    const cbRect = document.getElementById(`cb-rect-${id}`);
    const cbMark = document.getElementById(`cb-mark-${id}`);
    const cbLabel = document.getElementById(`cb-label-${id}`);

    const feederLine = document.getElementById(`feeder-line-${id}`);
    const feederArrow = document.getElementById(`feeder-arrow-${id}`);

    const bayBox = document.getElementById(`bay-box-${id}`);
    const bayPill = document.getElementById(`bay-pill-${id}`);
    const bayStat = document.getElementById(`bay-stat-${id}`);

    if (isClosed) {
      if (dsBar) dsBar.setAttribute('stroke', '#0369A1');
      if (dsTopDot) dsTopDot.setAttribute('fill', '#0369A1');
      if (dsBlade) {
        dsBlade.setAttribute('x2', String(x));
        dsBlade.setAttribute('y2', '66');
        dsBlade.setAttribute('stroke', '#0369A1');
      }
      if (dsLabel) dsLabel.setAttribute('fill', '#0369A1');
      if (dsCbLink) dsCbLink.setAttribute('stroke', '#0369A1');

      if (cbRect) {
        cbRect.setAttribute('fill', '#0369A1');
        cbRect.setAttribute('stroke', '#182230');
      }
      if (cbMark) {
        cbMark.setAttribute('x1', String(x));
        cbMark.setAttribute('y1', '117');
        cbMark.setAttribute('x2', String(x));
        cbMark.setAttribute('y2', '135');
        cbMark.setAttribute('stroke', '#FFFFFF');
      }
      if (cbLabel) cbLabel.setAttribute('fill', '#0369A1');

      if (feederLine) {
        feederLine.setAttribute('stroke', '#0369A1');
        feederLine.setAttribute('stroke-width', '3.2');
        feederLine.classList.add('energized-conductor');
      }
      if (feederArrow) feederArrow.setAttribute('fill', '#0369A1');

      if (bayBox) {
        bayBox.setAttribute('fill', '#F0F9FF');
        bayBox.setAttribute('stroke', '#0369A1');
        bayBox.setAttribute('stroke-width', '2.2');
      }
      if (bayPill) {
        bayPill.setAttribute('fill', '#E0F2FE');
        bayPill.setAttribute('stroke', '#0369A1');
      }
      if (bayStat) {
        bayStat.textContent = 'CLOSED';
        bayStat.setAttribute('fill', '#0369A1');
      }
    } else {
      if (dsBar) dsBar.setAttribute('stroke', '#64748B');
      if (dsTopDot) dsTopDot.setAttribute('fill', '#64748B');
      if (dsBlade) {
        dsBlade.setAttribute('x2', String(x + 14));
        dsBlade.setAttribute('y2', '69');
        dsBlade.setAttribute('stroke', '#64748B');
      }
      if (dsLabel) dsLabel.setAttribute('fill', '#475569');
      if (dsCbLink) dsCbLink.setAttribute('stroke', '#94A3B8');

      if (cbRect) {
        cbRect.setAttribute('fill', '#FFFFFF');
        cbRect.setAttribute('stroke', '#64748B');
      }
      if (cbMark) {
        cbMark.setAttribute('x1', String(x - 8));
        cbMark.setAttribute('y1', '126');
        cbMark.setAttribute('x2', String(x + 8));
        cbMark.setAttribute('y2', '126');
        cbMark.setAttribute('stroke', '#64748B');
      }
      if (cbLabel) cbLabel.setAttribute('fill', '#475569');

      if (feederLine) {
        feederLine.setAttribute('stroke', '#94A3B8');
        feederLine.setAttribute('stroke-width', '2.5');
        feederLine.classList.remove('energized-conductor');
      }
      if (feederArrow) feederArrow.setAttribute('fill', '#94A3B8');

      if (bayBox) {
        bayBox.setAttribute('fill', '#FFFFFF');
        bayBox.setAttribute('stroke', '#DCD8CD');
        bayBox.setAttribute('stroke-width', '1.5');
      }
      if (bayPill) {
        bayPill.setAttribute('fill', '#F6F5F0');
        bayPill.setAttribute('stroke', '#DCD8CD');
      }
      if (bayStat) {
        bayStat.textContent = 'OPEN';
        bayStat.setAttribute('fill', '#64748B');
      }
    }
  });

  // Sync mobile feeder bay selector pills
  document.querySelectorAll('.mobile-bay-pill').forEach(btn => {
    const bay = btn.getAttribute('data-bay');
    const isActive = bay === selectedBayId;
    btn.classList.toggle('active', isActive);
  });
}

const baySlideIndex = { bay01: 0, bay02: 0, bay03: 0, bay04: 0 };

function getBayAllPhotos(bayId) {
  const bay = CAREER_BAYS[bayId];
  if (!bay) return [];
  const custom = CUSTOM_PHOTOS_CACHE[bayId] || [];
  const defaults = bay.defaultPhotos || [];
  const combined = [...custom, ...defaults];

  // If no photos yet, check legacy single slot
  if (combined.length === 0 && bay.photoSlot) {
    const single = getStoredPhoto(bay.photoSlot);
    if (single) {
      combined.push({
        id: `legacy_${bayId}`,
        src: single,
        title: bay.photoTitle || 'Site Photo',
        caption: bay.project || ''
      });
    }
  }
  return combined;
}

function changeBaySlide(bayId, delta) {
  const photos = getBayAllPhotos(bayId);
  if (!photos.length) return;
  const curr = baySlideIndex[bayId] || 0;
  baySlideIndex[bayId] = (curr + delta + photos.length) % photos.length;
  renderCareerBayDetail();
}

function setBaySlide(bayId, index) {
  const photos = getBayAllPhotos(bayId);
  if (!photos.length) return;
  baySlideIndex[bayId] = Math.max(0, Math.min(index, photos.length - 1));
  renderCareerBayDetail();
}

function openBayAlbumLightbox(bayId, startIndex = 0) {
  const photos = getBayAllPhotos(bayId);
  if (!photos.length) return;
  openAlbumLightbox(photos, startIndex);
}

async function handleCareerBayPhotosUpload(event, bayId) {
  const files = event.target.files;
  if (!files || !files.length) return;

  const bay = CAREER_BAYS[bayId];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dataUrl = await compressImageFile(file, 1600, 1200, 0.84);
    if (!dataUrl) continue;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const photoObj = {
      id: `bay_${bayId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      category: bayId,
      src: dataUrl,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      caption: `${bay ? bay.company : 'Project Execution'} &bull; On-Site EPC Field Photo`,
      isCustom: true,
      timestamp: Date.now()
    };
    await persistCustomPhoto(photoObj);
  }

  baySlideIndex[bayId] = 0;
  renderCareerBayDetail();
  // Also sync with project archive so photos appear there too
  renderProjectArchiveSlider();
}

async function handleDeleteCareerPhoto(bayId, photoId) {
  if (!confirm('Remove this photo from your career gallery?')) return;
  await deleteCustomPhotoFromDB(photoId, bayId);
  const photos = getBayAllPhotos(bayId);
  if (baySlideIndex[bayId] >= photos.length) {
    baySlideIndex[bayId] = Math.max(0, photos.length - 1);
  }
  renderCareerBayDetail();
  renderProjectArchiveSlider();
}

function renderCareerBayDetail() {
  const container = document.getElementById('careerBayDetailContainer');
  if (!container) return;

  if (!selectedBayId || !CAREER_BAYS[selectedBayId]) {
    container.innerHTML = `
      <div class="text-center py-7 px-4">
        <span class="inline-block px-3 py-1 rounded-md bg-linen text-ink font-mono text-xs font-bold mb-3">
          ALL FEEDER BAYS ISOLATED (DS OPEN • CB OPEN)
        </span>
        <h3 class="font-serif text-[26px] font-medium text-ink mb-2">
          No Feeder Bay Currently Closed
        </h3>
        <p class="text-[14.5px] text-slate-600 max-w-xl mx-auto">
          Select any disconnecting switch, circuit breaker, or project bay card in the single-line diagram above to close that bay and inspect its full engineering scope.
        </p>
      </div>
    `;
    return;
  }

  const bay = CAREER_BAYS[selectedBayId];
  const allPhotos = getBayAllPhotos(selectedBayId);
  const currIndex = Math.max(0, Math.min(baySlideIndex[selectedBayId] || 0, Math.max(0, allPhotos.length - 1)));
  const currentPhoto = allPhotos[currIndex] || null;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7">
        <div class="flex flex-wrap gap-2 mb-3.5">
          <span class="px-3 py-1 rounded-md bg-amber-100/80 text-amberHv font-mono text-[11.5px] font-bold">${bay.ds} CLOSED • ${bay.cb} CLOSED (ACTIVE BAY)</span>
          <span class="px-3 py-1 rounded-md bg-linen text-ink font-mono text-[11.5px] font-semibold">${bay.period}</span>
        </div>

        <h3 class="font-serif text-[28px] sm:text-[34px] font-medium text-ink leading-tight mb-1.5">
          ${bay.role}
        </h3>
        <div class="text-base font-bold text-cerulean mb-2.5">
          ${bay.company}
        </div>
        <p class="text-[15px] font-semibold text-ink leading-relaxed mb-4">
          ${bay.project}
        </p>

        <div class="px-4 py-2.5 rounded-xl bg-alabaster border border-hairline text-[13px] text-slate-600 mb-4">
          <strong class="font-mono text-[11px] text-ink">FRAMEWORK:</strong> ${bay.funding}
        </div>

        <ul class="list-disc pl-5 space-y-2 text-[14.5px] text-slate-600 leading-relaxed">
          ${bay.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>

      <div class="lg:col-span-5">
        <div class="cad-frame">
          <!-- Slider Header with Counter -->
          <div class="flex items-center justify-between gap-2 pb-2.5 px-1 border-b border-hairline mb-3">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-cerulean">FIELD PHOTOS (${allPhotos.length})</span>
              ${allPhotos.length > 0 ? `<span class="px-2 py-0.5 rounded bg-sky-100 text-cerulean font-mono text-[11px] font-bold">${currIndex + 1} / ${allPhotos.length}</span>` : ''}
            </div>
            <span class="font-mono text-[10.5px] text-slate-400">Click photo to zoom</span>
          </div>

          <!-- Main Slide Viewport -->
          <div class="relative aspect-[4/3] rounded-xl bg-linen border border-hairline overflow-hidden flex items-center justify-center group select-none">
            ${currentPhoto ? `
              <img id="baySlideMainImg" src="${currentPhoto.src}" alt="${currentPhoto.title}" class="w-full h-full object-cover cursor-zoom-in transition-all" onclick="openBayAlbumLightbox('${bay.id}', ${currIndex})" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" />
              <div class="hidden text-center p-5 w-full h-full bg-linen flex flex-col items-center justify-center">
                <div class="font-mono text-xs font-bold text-cerulean">${bay.ds} / ${bay.cb} SITE PHOTO SLOT</div>
                <p class="text-xs text-slate-600 mt-1.5">${currentPhoto.title}</p>
                <p class="text-[10.5px] font-mono text-slate-500 mt-1">High-voltage project archive documentation</p>
              </div>

              <!-- Overlay Navigation Arrows -->
              ${allPhotos.length > 1 ? `
                <button type="button" onclick="changeBaySlide('${bay.id}', -1)" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/75 hover:bg-cerulean text-white flex items-center justify-center text-sm shadow-md cursor-pointer transition-all opacity-85 group-hover:opacity-100" aria-label="Previous photo">&#10094;</button>
                <button type="button" onclick="changeBaySlide('${bay.id}', 1)" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/75 hover:bg-cerulean text-white flex items-center justify-center text-sm shadow-md cursor-pointer transition-all opacity-85 group-hover:opacity-100" aria-label="Next photo">&#10095;</button>
              ` : ''}

              <!-- Bottom Gradient Caption Bar -->
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-3 pt-6 pointer-events-none text-left">
                <div class="text-white text-xs sm:text-[13px] font-bold leading-tight truncate">${currentPhoto.title}</div>
                ${currentPhoto.caption ? `<div class="text-sky-200 text-[11px] truncate mt-0.5">${currentPhoto.caption}</div>` : ''}
              </div>
            ` : `
              <div class="text-center p-5">
                <div class="font-mono text-xs font-bold text-cerulean">${bay.ds} / ${bay.cb} SITE PHOTO ARCHIVE</div>
                <p class="text-xs text-slate-600 mt-1.5">${bay.photoTitle}</p>
                <p class="text-[10.5px] font-mono text-slate-500 mt-1">High-voltage project site documentation</p>
              </div>
            `}
          </div>

          <!-- Thumbnail Ribbon -->
          ${allPhotos.length > 1 ? `
            <div class="flex items-center gap-2 overflow-x-auto py-2.5 px-0.5 no-scrollbar">
              ${allPhotos.map((p, idx) => `
                <button type="button" onclick="setBaySlide('${bay.id}', ${idx})" class="career-thumb-btn w-14 h-10 rounded-lg overflow-hidden border border-hairline flex-shrink-0 cursor-pointer ${idx === currIndex ? 'active ring-2 ring-cerulean' : 'opacity-70 hover:opacity-100'}">
                  <img src="${p.src}" alt="" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2240%22><rect width=%2250%22 height=%2240%22 fill=%22%23ECEAE2%22/><text x=%2225%22 y=%2224%22 font-family=%22monospace%22 font-size=%229%22 fill=%22%2364748B%22 text-anchor=%22middle%22>${idx + 1}</text></svg>'" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------
   5. ACADEMIC & LICENSURE ROUTE (MUTUAL EXCLUSION)
   ------------------------------------------------------------------------- */
let selectedAcademicId = 'nec1977';

function selectAcademicNode(nodeId) {
  if (!ACADEMIC_NODES[nodeId]) return;
  selectedAcademicId = nodeId;
  syncAcademicRouteVisuals();
  renderAcademicDetail();
}

function syncAcademicRouteVisuals() {
  const activeNode = ACADEMIC_NODES[selectedAcademicId];
  const activeSpans = new Set(activeNode ? activeNode.spanIds : []);

  // Reset or energize the 4 route conductor spans
  ['acad-span-1', 'acad-span-2', 'acad-span-3', 'acad-span-4'].forEach(spanId => {
    const spanEl = document.getElementById(spanId);
    if (!spanEl) return;
    if (activeSpans.has(spanId)) {
      spanEl.setAttribute('stroke', '#0369A1');
      spanEl.setAttribute('stroke-width', '3.2');
      spanEl.classList.add('energized-conductor');
    } else {
      spanEl.setAttribute('stroke', '#94A3B8');
      spanEl.setAttribute('stroke-width', '2.4');
      spanEl.classList.remove('energized-conductor');
    }
  });

  // Mutual-exclusion highlight: ONLY selectedAcademicId is highlighted
  Object.keys(ACADEMIC_NODES).forEach(id => {
    const isSelected = id === selectedAcademicId;
    const tower = document.getElementById(`acad-tower-${id}`);
    const dot = document.getElementById(`acad-dot-${id}`);
    const box = document.getElementById(`acad-box-${id}`);

    if (isSelected) {
      if (tower) tower.setAttribute('stroke', '#0369A1');
      if (dot) {
        dot.setAttribute('fill', '#0369A1');
        dot.setAttribute('stroke', '#182230');
      }
      if (box) {
        box.setAttribute('fill', '#F0F9FF');
        box.setAttribute('stroke', '#0369A1');
        box.setAttribute('stroke-width', '2.2');
      }
    } else {
      if (tower) tower.setAttribute('stroke', '#64748B');
      if (dot) {
        dot.setAttribute('fill', '#FFFFFF');
        dot.setAttribute('stroke', '#64748B');
      }
      if (box) {
        box.setAttribute('fill', '#FFFFFF');
        box.setAttribute('stroke', '#DCD8CD');
        box.setAttribute('stroke-width', '1.5');
      }
    }
  });

  // Sync mobile academic route pills
  document.querySelectorAll('.mobile-acad-pill').forEach(btn => {
    const node = btn.getAttribute('data-node');
    const isSelected = node === selectedAcademicId;
    btn.classList.toggle('active', isSelected);
  });
}

function renderAcademicDetail() {
  const container = document.getElementById('academicDetailContainer');
  if (!container) return;

  const node = ACADEMIC_NODES[selectedAcademicId] || ACADEMIC_NODES.nec1977;

  container.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="max-w-3xl">
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="px-3 py-1 rounded-md bg-amber-100/80 text-amberHv font-mono text-[11.5px] font-bold">${node.code} • ${node.year}</span>
          <span class="px-3 py-1 rounded-md bg-linen text-ink font-mono text-[11.5px] font-semibold">${node.level}</span>
          <span class="px-3 py-1 rounded-md bg-sky-100 text-cerulean font-mono text-[11.5px] font-bold">${node.voltage}</span>
        </div>

        <h3 class="font-serif text-[28px] sm:text-[34px] font-medium text-ink leading-tight mb-1.5">
          ${node.degree}
        </h3>
        <div class="text-base font-bold text-cerulean mb-3">
          ${node.institution} • <span class="font-medium text-slate-600">${node.location}</span>
        </div>
        <p class="text-[15px] text-slate-600 leading-relaxed">
          ${node.details}
        </p>
      </div>

      <div class="flex-shrink-0">
        <button type="button" onclick="switchView('career-sld')" class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-sky-50 border border-stone-300 hover:border-cerulean text-ink hover:text-cerulean text-sm font-semibold shadow-sm transition-all cursor-pointer">
          <span>Explore Career SLD &rarr;</span>
        </button>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------
   6. INTERACTIVE NEPAL HIGH-VOLTAGE TRANSMISSION GIS MAP (LEAFLET.JS)
   Loaded on-demand only when opening Projects & Gallery to optimize initial payload
   ------------------------------------------------------------------------- */
let nepalMapInstance = null;
let nepalMapRetryCount = 0;
let leafletLoading = false;

function loadLeaflet(callback) {
  if (typeof L !== 'undefined') {
    if (callback) callback();
    return;
  }
  if (!leafletLoading) {
    leafletLoading = true;
    if (!document.getElementById('leafletCssLink')) {
      const link = document.createElement('link');
      link.id = 'leafletCssLink';
      link.rel = 'stylesheet';
      link.href = 'css/leaflet.css?v=3.9';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.id = 'leafletJsScript';
    script.src = 'js/leaflet.js?v=3.9';
    script.async = true;
    script.onload = () => {
      leafletLoading = false;
      if (callback) callback();
    };
    script.onerror = () => {
      leafletLoading = false;
    };
    document.body.appendChild(script);
  } else {
    setTimeout(() => loadLeaflet(callback), 100);
  }
}

function initNepalMap() {
  const mapContainer = document.getElementById('nepalGisMap');
  if (!mapContainer) return;

  // Do not initialize while parent section is hidden with display:none
  const projectsView = document.getElementById('view-projects');
  if (projectsView && !projectsView.classList.contains('active')) {
    return;
  }

  // Ensure container has rendered non-zero dimensions
  if (mapContainer.clientWidth === 0 || mapContainer.clientHeight === 0) {
    if (nepalMapRetryCount < 30) {
      nepalMapRetryCount++;
      setTimeout(initNepalMap, 150);
    }
    return;
  }

  // Lazy-load Leaflet on demand if not yet loaded
  if (typeof L === 'undefined') {
    loadLeaflet(() => {
      initNepalMap();
    });
    return;
  }

  if (nepalMapInstance) {
    nepalMapInstance.invalidateSize(true);
    return;
  }

  try {
    // Center on Nepal (Kathmandu / Central Grid Corridor) with zoom 7.2
    nepalMapInstance = L.map('nepalGisMap', {
      center: [27.75, 85.35],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16,
      scrollWheelZoom: false
    });

    // Professional Esri World Topographic & Grid Base Layer (100% Free, Zero API Keys, No Watermarks)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &bull; Nepal Transmission GIS',
      maxZoom: 18
    }).addTo(nepalMapInstance);

    // Custom Cerulean Substation Pin
    const customPin = L.divIcon({
      className: 'custom-substation-pin',
      html: `<div style="background-color: #0369A1; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 2px 10px rgba(3,105,161,0.6); cursor: pointer; transition: transform 0.2s ease;"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    if (typeof NEPAL_GRID_PROJECTS !== 'undefined') {
      substationMarkers = {};
      const caseStudyMap = {
        prasauni: 'case-prasauni',
        chilime: 'case-chilime',
        nagdhunga: 'case-nagdhunga',
        samundratar: 'case-samundratar',
        trishuli3b: 'case-chilime'
      };

      NEPAL_GRID_PROJECTS.forEach(p => {
        const marker = L.marker(p.coords, { icon: customPin }).addTo(nepalMapInstance);
        substationMarkers[p.id] = marker;

        const targetCaseId = caseStudyMap[p.id] || null;
        const caseLinkHtml = targetCaseId ? `
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(100,116,139,0.3);">
            <button type="button" onclick="scrollToCaseStudy('${targetCaseId}')" style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background-color: #0369A1; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; transition: background-color 0.2s ease;">
              <span>View Case Study</span> &darr;
            </button>
          </div>
        ` : '';

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px 4px; max-width: 260px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #B45309; text-transform: uppercase; margin-bottom: 2px;">${p.voltage}</div>
            <h4 style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #182230; line-height: 1.3;">${p.title}</h4>
            <div style="font-size: 11px; font-weight: 600; color: #0369A1; margin-bottom: 6px;">${p.contractor} &bull; ${p.location}</div>
            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.45;">${p.desc}</p>
            ${caseLinkHtml}
          </div>
        `);
      });
    }

    setTimeout(() => {
      if (nepalMapInstance) nepalMapInstance.invalidateSize(true);
    }, 250);
  } catch (err) {
    console.warn('Leaflet GIS Map initialization deferred:', err);
  }
}

let substationMarkers = {};

function focusSubstation(id) {
  if (!nepalMapInstance) {
    initNepalMap();
  }
  const project = (typeof NEPAL_GRID_PROJECTS !== 'undefined') && NEPAL_GRID_PROJECTS.find(p => p.id === id);
  if (!project || !nepalMapInstance) return;

  nepalMapInstance.setView(project.coords, 10, { animate: true });
  if (substationMarkers[id]) {
    setTimeout(() => {
      substationMarkers[id].openPopup();
    }, 250);
  }
}

function resetNepalMap() {
  if (!nepalMapInstance) {
    initNepalMap();
  }
  if (nepalMapInstance) {
    nepalMapInstance.setView([27.75, 85.35], 7, { animate: true });
    nepalMapInstance.closePopup();
  }
}

function scrollToCaseStudy(caseId) {
  const el = document.getElementById(caseId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('highlight-case-study');
  setTimeout(() => {
    el.classList.remove('highlight-case-study');
  }, 2200);
}

/* -------------------------------------------------------------------------
   6. MULTI-PROJECT CONTINUOUS SITE PHOTO ARCHIVE SLIDER
   Supports continuous sliding, project filtering, and batch photo uploads (5, 10, 15+).
   ------------------------------------------------------------------------- */
let activeProjectFilter = 'all';
let siteSliderInterval = null;
let isSiteSliderPaused = false;

function getFilteredProjectPhotos() {
  const customAll = [];
  const validProjectKeys = ['prasauni', 'chilime', 'trishuli3b', 'nagdhunga', 'samundratar', 'tamor'];
  validProjectKeys.forEach(cat => {
    (CUSTOM_PHOTOS_CACHE[cat] || []).forEach(p => customAll.push(p));
  });

  const defaults = typeof PROJECT_SITE_ARCHIVES !== 'undefined' ? PROJECT_SITE_ARCHIVES : [];
  const combined = [...customAll, ...defaults];

  if (activeProjectFilter === 'all') {
    return combined;
  }
  return combined.filter(p => p.projectId === activeProjectFilter || p.category === activeProjectFilter);
}

function setProjectArchiveFilter(filterId) {
  activeProjectFilter = filterId;
  renderProjectArchiveSlider();
  const track = document.getElementById('projectSliderTrack');
  if (track) track.scrollTo({ left: 0, behavior: 'smooth' });
}

function renderProjectArchiveSlider() {
  const pillsContainer = document.getElementById('projectArchiveFilterPills');
  const track = document.getElementById('projectSliderTrack');
  const totalBadge = document.getElementById('sitePhotoTotalBadge');
  const countText = document.getElementById('projectSliderCountText');

  const photos = getFilteredProjectPhotos();
  const filters = typeof PROJECT_ARCHIVE_FILTERS !== 'undefined' ? PROJECT_ARCHIVE_FILTERS : [
    { id: 'all', label: 'All Projects' }
  ];

  // Render Filter Pills
  if (pillsContainer) {
    pillsContainer.innerHTML = filters.map(f => {
      const isActive = f.id === activeProjectFilter;
      return `
        <button type="button" onclick="setProjectArchiveFilter('${f.id}')" class="project-filter-pill px-3 py-1.5 rounded-lg border font-mono text-[11px] font-semibold cursor-pointer transition-colors ${isActive ? 'active bg-cerulean text-white border-cerulean' : 'bg-alabaster text-ink border-stone-300 hover:border-cerulean hover:text-cerulean'}">
          ${f.label}
        </button>
      `;
    }).join('');
  }

  // Update Badges
  if (totalBadge) {
    totalBadge.textContent = `${photos.length} PHOTOGRAPHS`;
  }
  if (countText) {
    const activeLabel = filters.find(f => f.id === activeProjectFilter)?.label || 'All Projects';
    countText.textContent = `Showing ${photos.length} photos (${activeLabel})`;
  }

  // Render Slider Track
  if (track) {
    if (!photos.length) {
      track.innerHTML = `
        <div class="w-full text-center py-12 px-4 bg-white border border-hairline rounded-2xl">
          <div class="font-mono text-xs font-bold text-cerulean mb-1.5">SITE PHOTOGRAPHS IN PREPARATION</div>
          <p class="text-sm text-slate-600">Field documentation for this project is currently being cataloged.</p>
        </div>
      `;
      return;
    }

    track.innerHTML = photos.map((item, idx) => {
      return `
        <div class="photo-slider-card w-[290px] sm:w-[330px] rounded-2xl bg-white border border-hairline shadow-sm overflow-hidden flex flex-col justify-between flex-shrink-0">
          <div class="relative aspect-[16/10] bg-linen overflow-hidden cursor-zoom-in group select-none" onclick="openProjectAlbumLightbox(${idx})">
            <img src="${item.src}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" />
            <div class="hidden w-full h-full bg-linen flex items-center justify-center font-mono text-xs text-cerulean font-bold">${item.voltage || 'SITE PHOTO'}</div>
            
            <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-ink/80 text-white font-mono text-[10px] font-bold shadow">
              ${item.voltage || 'HIGH VOLTAGE'}
            </div>

            <div class="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span class="text-white text-xs font-bold font-mono">&#128269; View High-Resolution</span>
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="font-mono text-[10.5px] font-bold text-amberHv mb-1 uppercase truncate">${item.contractor || item.projectTitle || ''}</div>
              <h4 class="font-bold text-[14px] text-ink leading-snug line-clamp-2 mb-1.5">${item.title}</h4>
              <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${item.desc || item.caption || ''}</p>
            </div>
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-hairline text-[11px] font-mono text-slate-500">
              <span class="truncate max-w-[170px]">${item.location || 'Nepal Grid'}</span>
              <span class="flex-shrink-0">${item.date || ''}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openProjectAlbumLightbox(index) {
  const photos = getFilteredProjectPhotos();
  if (!photos.length) return;
  openAlbumLightbox(photos, index);
}

function slideProjectArchive(direction) {
  const track = document.getElementById('projectSliderTrack');
  if (!track) return;

  const cardWidth = 340;
  const maxScroll = track.scrollWidth - track.clientWidth;
  const currentScroll = track.scrollLeft;

  if (direction > 0 && currentScroll >= maxScroll - 10) {
    // End reached, loop smoothly back to start
    track.scrollTo({ left: 0, behavior: 'smooth' });
  } else if (direction < 0 && currentScroll <= 10) {
    // Start reached, loop to end
    track.scrollTo({ left: maxScroll, behavior: 'smooth' });
  } else {
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }
}

function startSiteSlider() {
  stopSiteSlider();
  siteSliderInterval = setInterval(() => {
    if (!isSiteSliderPaused) {
      slideProjectArchive(1);
    }
  }, 3500);
}

function stopSiteSlider() {
  if (siteSliderInterval) {
    clearInterval(siteSliderInterval);
    siteSliderInterval = null;
  }
}

function toggleSiteSliderAutoplay() {
  const icon = document.getElementById('sliderPlayPauseIcon');
  const text = document.getElementById('sliderPlayPauseText');

  if (siteSliderInterval) {
    stopSiteSlider();
    if (icon) icon.innerHTML = '&#9654;';
    if (text) text.textContent = 'Resume Auto-Slide';
  } else {
    isSiteSliderPaused = false;
    startSiteSlider();
    if (icon) icon.innerHTML = '&#9646;&#9646;';
    if (text) text.textContent = 'Pause Auto-Slide';
  }
}

async function handleProjectArchiveUpload(event) {
  const files = event.target.files;
  if (!files || !files.length) return;

  const targetCategory = activeProjectFilter === 'all' ? 'prasauni' : activeProjectFilter;
  const targetProject = (typeof NEPAL_GRID_PROJECTS !== 'undefined') && NEPAL_GRID_PROJECTS.find(p => p.id === targetCategory);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dataUrl = await compressImageFile(file, 1600, 1200, 0.84);
    if (!dataUrl) continue;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const photoObj = {
      id: `proj_${targetCategory}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      category: targetCategory,
      projectId: targetCategory,
      src: dataUrl,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      desc: targetProject ? `${targetProject.title} &bull; ${targetProject.desc}` : 'High-Voltage EPC Substation Field Execution Photo',
      voltage: targetProject ? targetProject.voltage.split(',')[0] : '132 kV EPC',
      contractor: targetProject ? targetProject.contractor : 'CREGC / High Voltage EPC',
      location: targetProject ? targetProject.location : 'Nepal Grid Corridor',
      date: '2024–Present',
      isCustom: true,
      timestamp: Date.now()
    };
    await persistCustomPhoto(photoObj);
  }

  renderProjectArchiveSlider();
  const track = document.getElementById('projectSliderTrack');
  if (track) {
    track.scrollTo({ left: 0, behavior: 'smooth' });
  }
}

async function handleDeleteProjectPhoto(photoId, category) {
  if (!confirm('Remove this photo from the site archive?')) return;
  await deleteCustomPhotoFromDB(photoId, category);
  renderProjectArchiveSlider();
}

function renderSitePhotoArchive() {
  renderProjectArchiveSlider();
}

/* -------------------------------------------------------------------------
   7. DIRECT CONTACT FORM & UTILITIES
   ------------------------------------------------------------------------- */
function handleDirectMessage(event) {
  event.preventDefault();
  const name = document.getElementById('senderName').value.trim();
  const org = document.getElementById('senderOrg').value.trim();
  const topic = document.getElementById('senderSubject').value;
  const msg = document.getElementById('senderMessage').value.trim();

  const confirmBox = document.getElementById('messageConfirmation');
  confirmBox.classList.remove('hidden');
  confirmBox.innerHTML = `
    <div class="font-semibold text-ink dark:text-[#F8FAFC]">Message Prepared for diaryofanish@gmail.com</div>
    <div class="mt-1 text-slate-700 dark:text-[#94A3B8]">Thank you, ${name}. If your email client does not open automatically, you can also write directly to <a href="mailto:diaryofanish@gmail.com" class="text-cerulean dark:text-[#38BDF8] underline font-bold">diaryofanish@gmail.com</a>.</div>
  `;

  const subject = encodeURIComponent(`[anish-niroula.com.np] ${topic} — ${name} (${org})`);
  const body = encodeURIComponent(`Hello Anish,\n\nName: ${name}\nOrganization: ${org}\nSubject: ${topic}\n\nMessage:\n${msg}\n\n---\nSent via Anish Niroula Engineering Portfolio (anish-niroula.com.np)`);
  window.location.href = `mailto:diaryofanish@gmail.com?subject=${subject}&body=${body}`;
}

function copyText(elementId, btn) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent.trim();
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1800);
  } catch (e) { }
  document.body.removeChild(temp);
}

/* -------------------------------------------------------------------------
   8. KEYBOARD ACCESSIBILITY INITIALIZATION
   ------------------------------------------------------------------------- */
function setupKeyboardNavigation() {
  document.querySelectorAll('[data-keyboard-action]').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

/* -------------------------------------------------------------------------
   9. INITIALIZATION ON DOM READY
   ------------------------------------------------------------------------- */
async function initApp() {
  // Initialize Theme (Dark / Light)
  initTheme();

  // Sync External Links
  const overviewNec = document.getElementById('overviewNecLink');
  if (overviewNec) overviewNec.href = NEC_LICENSE_URL;

  const linkedinLink = document.getElementById('contactLinkedinLink');
  if (linkedinLink) linkedinLink.href = LINKEDIN_URL;

  // Load custom photos from IndexedDB
  await loadAllCustomPhotosFromDB();

  // Initialize Modules
  syncHeroPortrait();
  syncSldVisuals();
  renderCareerBayDetail();
  syncAcademicRouteVisuals();
  renderAcademicDetail();
  renderProjectArchiveSlider();
  initScrollReveal();
  setupKeyboardNavigation();

  // Start continuous site slider auto-play with pause-on-hover
  const track = document.getElementById('projectSliderTrack');
  if (track) {
    track.addEventListener('mouseenter', () => { isSiteSliderPaused = true; });
    track.addEventListener('mouseleave', () => { isSiteSliderPaused = false; });
    track.addEventListener('touchstart', () => { isSiteSliderPaused = true; }, { passive: true });
    track.addEventListener('touchend', () => { isSiteSliderPaused = false; }, { passive: true });
  }
  startSiteSlider();

  // Initialize perimeter mascot runner
  initMascot();

  // Initialize Electrical Engineering & Grid Calculators Suite
  initCalculators();

  // Read URL Hash or default to overview
  const initialHash = window.location.hash.replace('#', '');
  switchView(VIEW_IDS.includes(initialHash) ? initialHash : 'overview', false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* -------------------------------------------------------------------------
   8. VISIBILITY CHANGE & BATTERY OPTIMIZATION (MOBILE & ACCESSIBILITY)
   Freezes animations, mascot loop, and SVG paths only when tab is hidden.
   ------------------------------------------------------------------------- */
function updateSvgAnimationState() {
  const bgSvg = document.querySelector('.global-backdrop-container svg');
  const bgContainer = document.querySelector('.global-backdrop-container');
  const shouldPause = document.hidden;

  if (shouldPause) {
    if (bgSvg && typeof bgSvg.pauseAnimations === 'function') {
      try { bgSvg.pauseAnimations(); } catch (e) {}
    }
    if (bgContainer) {
      bgContainer.classList.add('backdrop-paused');
    }
    if (window.mascotEngine) {
      window.mascotEngine.pause();
    }
  } else {
    if (bgSvg && typeof bgSvg.unpauseAnimations === 'function') {
      try { bgSvg.unpauseAnimations(); } catch (e) {}
    }
    if (bgContainer) {
      bgContainer.classList.remove('backdrop-paused');
    }
    if (window.mascotEngine) {
      window.mascotEngine.resume();
    }
  }
}

document.addEventListener('visibilitychange', updateSvgAnimationState);
updateSvgAnimationState();

/* -------------------------------------------------------------------------
   10. FIELD ENGINEER MASCOT (COMPACT, RELAXED LIVING COMPANION WITH BLACK LABRADOR)
   - Skyfall physics entrance from top of webpage down to floor
   - Slow, peaceful stroll & living his life (never frantic sprinting)
   - Articulated Black Labrador companion with animated moving legs & wagging tail
   - Interactive dog play routines (ball fetch, pouncing, affectionate pats)
   - Stationary grounded position during webpage scroll (no racing side-to-side)
   - Zero layout shift, root body stacking context (z-index: 9999)
   ------------------------------------------------------------------------- */
class FieldEngineerMascot {
  constructor() {
    this.container = document.getElementById('engineerMascotContainer');
    this.wrapper = document.getElementById('mascotCharacterWrapper');
    this.sprite = document.getElementById('mascotSprite');
    this.badge = document.getElementById('mascotStatusBadge');
    this.football = document.getElementById('mascotFootball');
    this.dog = document.getElementById('mascotDog');
    this.dogCorner = document.getElementById('mascotDogCorner');

    this.enabled = true;
    this.posX = 60;
    this.posY = 0;
    this.scrollOffset = 0;
    this.targetScrollOffset = 0;
    this.direction = 1; // 1 = right, -1 = left
    this.baseSpeed = 1.30; // Natural comfortable walking pace: ~78px per second
    this.currentSpeed = 1.30;

    // State flags
    this.isPaused = false;
    this.isFacingFront = false;
    this.isTurning = false;
    this.isDragging = false;
    this.isFallingEntrance = false;
    this.dragMoved = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartPosX = 0;
    this.dragStartPosY = 0;

    // Interaction states
    this.currentAction = null;
    this.isKicking = false;
    this.isDogPlaying = false;
    this.dogNapping = false;
    this.actionTimer = null;
    this.lifeRoutineTimer = null;
    this.hoverResumeTimer = null;

    // Sequential click state machine (completely silent / zero music):
    // 0 = Ready for Football kick
    // 1 = Ready for Black Labrador dog interaction & nap in corner
    this.clickSequence = 0;
    this.clickState = 0;

    this.lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    this.scrollTimeout = null;
    this.redTransformTimer = null;
    this.isRedVariant = false;
    this.animFrameId = null;
    this.prefersReducedMotion = false;
  }

  get isInteracting() {
    return !!this.currentAction;
  }

  init() {
    if (!this.container || !this.sprite) return;

    // Load persisted state
    try {
      const saved = localStorage.getItem('mascot-enabled');
      if (saved !== null) this.enabled = (saved === 'true');
    } catch (e) {}

    // Check prefers-reduced-motion
    try {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = motionQuery.matches;
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', (e) => {
          this.prefersReducedMotion = e.matches;
        });
      }
    } catch (e) {}

    this.applyState(this.enabled);
    if (!this.enabled) return;

    this.setupGroundPosition();
    if (this.dog) {
      this.dog.style.left = '0';
      const dogOffset = this.direction === 1 ? -32 : 24;
      const dogScale = this.direction === 1 ? 1 : -1;
      this.dog.style.transform = `translate3d(${dogOffset}px, 0, 0) scaleX(${dogScale})`;
      this.dog.classList.remove('is-idle');
      this.dog.classList.add('is-walking');
    }
    this.setupEvents();
    this.startLoop();
    this.startLivingRoutine();
    this.scheduleRedTransformation();
  }

  setupGroundPosition() {
    const isMobile = window.innerWidth < 768;
    this.groundBottom = isMobile ? 74 : 24;
    this.container.style.bottom = `${this.groundBottom}px`;
    if (this.dogCorner) {
      this.dogCorner.style.bottom = `${this.groundBottom}px`;
    }
    this.updateTransform();
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.setupGroundPosition();
      this.keepInBounds();
    });

    // Webpage Scrolling:
    // Anish and his Labrador stay relaxed and comfortably grounded at the bottom of the screen.
    // Absolutely NO frantic horizontal racing across the page!
    window.addEventListener('scroll', () => {
      if (!this.enabled || this.isDragging || this.isFallingEntrance || this.prefersReducedMotion) return;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const deltaY = currentScrollY - this.lastScrollY;
      this.lastScrollY = currentScrollY;

      // Subtle, gentle vertical cushion that absorbs scroll inertia (+-3px)
      const scrollCushion = Math.max(-5, Math.min(5, -deltaY * 0.04));
      this.targetScrollOffset = Math.max(-6, Math.min(6, this.targetScrollOffset + scrollCushion));
    }, { passive: true });

    // Desktop hover: brief friendly front-facing greeting without locking walking loop
    this.container.addEventListener('mouseenter', () => {
      if (!this.isDragging && !this.currentAction && !this.isFallingEntrance) {
        this.setFacingFront(true);
        if (this.hoverResumeTimer) clearTimeout(this.hoverResumeTimer);
        this.hoverResumeTimer = setTimeout(() => {
          if (!this.isDragging && !this.currentAction && !this.isFallingEntrance) {
            this.setFacingFront(false);
            this.updateWalkingState(true);
          }
        }, 1600);
      }
    });
    this.container.addEventListener('mouseleave', () => {
      if (this.hoverResumeTimer) clearTimeout(this.hoverResumeTimer);
      if (!this.isDragging && !this.currentAction && !this.isFallingEntrance) {
        this.setFacingFront(false);
        this.updateWalkingState(true);
      }
    });

    // Pointer Dragging (Mouse & Touch)
    this.wrapper.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
  }

  /* -------------------------------------------------------------------------
     SKYFALL ENTRANCE:
     Mascot and Black Labrador fall down smoothly from above the top of the webpage,
     landing with a gentle 2-bounce landing, dust/sparks, and a cheerful wave!
     ------------------------------------------------------------------------- */
  triggerSkyfallEntrance() {
    this.isFallingEntrance = true;
    this.isPaused = true;
    this.container.classList.add('is-falling');
    this.updateWalkingState(false);

    // Start well above top of viewport
    this.posY = -window.innerHeight - 80;
    this.posX = Math.max(50, Math.min(window.innerWidth - 130, Math.floor(window.innerWidth * 0.28)));
    this.updateTransform();

    let velY = 1.0;
    const gravity = 0.85;
    const airDrag = 0.99;
    let bounces = 0;

    const dropStep = () => {
      if (!this.isFallingEntrance) return;
      velY = (velY + gravity) * airDrag;
      this.posY += velY;

      if (this.posY >= 0) {
        this.posY = 0;
        bounces++;
        if (bounces <= 2) {
          velY = -velY * 0.36; // Soft landing bounce
          this.emitSparks(3, ['⚡', '✨', '🐾']);
          if (this.wrapper) {
            this.wrapper.classList.remove('is-landing-squash');
            void this.wrapper.offsetWidth;
            this.wrapper.classList.add('is-landing-squash');
          }
        } else {
          // Settled on ground cleanly
          this.posY = 0;
          this.updateTransform();
          this.container.classList.remove('is-falling');
          this.emitSparks(5, ['⚡', '✨', '🐾', '🐶']);

          // Cheerful wave and greeting
          this.setFacingFront(true);
          if (this.dog) {
            this.dog.classList.remove('is-walking');
            this.dog.classList.add('is-idle');
          }

          setTimeout(() => {
            this.setFacingFront(false);
            this.isPaused = false;
            this.isFallingEntrance = false;
            this.updateFacing();
            this.startLivingRoutine();
          }, 1800);
          return;
        }
      }

      this.updateTransform();
      requestAnimationFrame(dropStep);
    };

    requestAnimationFrame(dropStep);
  }

  /* -------------------------------------------------------------------------
     LIVING LIFE STATE MACHINE:
     Anish slowly strolls, pauses to enjoy life, plays fetch with his black Labrador,
     and inspects equipment — instead of sprinting back and forth on an endless loop!
     ------------------------------------------------------------------------- */
  startLivingRoutine() {
    if (this.lifeRoutineTimer) clearTimeout(this.lifeRoutineTimer);
    if (!this.enabled || this.isDragging || this.isFallingEntrance) return;

    // Resume peaceful stroll
    this.isPaused = false;
    this.currentAction = null;
    this.setFacingFront(false);
    this.updateWalkingState(true);

    // Stroll across the webpage for 9 to 14 seconds before a brief mini-activity
    const strollDuration = Math.floor(Math.random() * 5000) + 9000;

    this.lifeRoutineTimer = setTimeout(() => {
      if (!this.enabled || this.isDragging || this.currentAction || this.isFallingEntrance) {
        this.startLivingRoutine();
        return;
      }

      // Pick a relaxing life activity:
      // 55% chance: Play with black Labrador (ball toss & fetch!)
      // 30% chance: Pause and enjoy life facing front with a smile
      // 15% chance: Inspect tools / clipboard
      const roll = Math.random();
      if (roll < 0.55) {
        this.performDogPlaySession();
      } else if (roll < 0.85) {
        this.performRelaxPause();
      } else {
        this.performInspectPause();
      }
    }, strollDuration);
  }

  // 1. Play with Black Labrador Dog (Toss ball, dog fetches & trots back, Anish pats pup)
  performDogPlaySession() {
    this.isPaused = true;
    this.currentAction = 'playing_with_dog';
    this.updateWalkingState(false);

    if (this.badge) {
      this.badge.textContent = '⚽';
      this.badge.classList.remove('hidden');
    }

    if (this.football) {
      const tossDir = this.direction;
      const ballStartX = tossDir === 1 ? 16 : -16;
      const ballTargetX = tossDir === 1 ? 48 : -48;

      this.football.classList.add('is-active');
      this.football.style.transform = `translate3d(${ballStartX}px, -4px, 0)`;

      if (this.sprite) this.sprite.classList.add('is-kicking');
      this.emitSparks(3, ['✨', '⚽']);

      // Ball rolls out smoothly
      setTimeout(() => {
        if (this.football) {
          this.football.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
          this.football.style.transform = `translate3d(${ballTargetX}px, 0, 0) rotate(${tossDir * 360}deg)`;
        }
      }, 150);

      // Black Labrador perks up, wags tail, and trots forward to fetch ball!
      setTimeout(() => {
        if (this.dog) {
          this.dog.classList.remove('is-idle');
          this.dog.classList.add('is-walking', 'is-playing');
          this.dog.style.left = '0';
          this.dog.style.transform = `translate3d(${tossDir === 1 ? 40 : -40}px, 0, 0) scaleX(${tossDir})`;
        }
      }, 300);

      // Dog reaches ball, pounces and bounces happily!
      setTimeout(() => {
        if (this.dog) {
          this.dog.classList.remove('is-walking');
          this.dog.classList.add('is-bouncing');
          this.emitSparks(4, ['💖', '🐾', '🐶']);
        }
        if (this.badge) this.badge.textContent = '🐾';
      }, 950);

      // Dog trots back to Anish with ball!
      setTimeout(() => {
        if (this.dog) {
          this.dog.classList.remove('is-bouncing');
          this.dog.classList.add('is-walking');
          this.dog.style.left = '0';
          this.dog.style.transform = `translate3d(${tossDir === 1 ? -24 : 20}px, 0, 0) scaleX(${tossDir})`;
        }
        if (this.football) {
          this.football.style.transition = 'transform 0.5s ease, opacity 0.3s ease';
          this.football.style.transform = `translate3d(0px, 0, 0)`;
          this.football.style.opacity = '0';
        }
      }, 2000);

      // Anish pats puppy on head with affection!
      setTimeout(() => {
        if (this.sprite) this.sprite.classList.remove('is-kicking');
        this.setFacingFront(true);
        this.emitSparks(4, ['💖', '✨', '🐾']);
        if (this.football) {
          this.football.classList.remove('is-active');
          this.football.style.transition = '';
          this.football.style.opacity = '';
        }
        if (this.dog) {
          this.dog.classList.remove('is-walking', 'is-playing');
          this.dog.classList.add('is-idle');
          this.dog.style.transition = '';
        }
      }, 2600);

      // Wrap up and resume peaceful stroll across the screen in current direction
      setTimeout(() => {
        if (this.badge) this.badge.classList.add('hidden');
        this.setFacingFront(false);
        this.currentAction = null;
        this.isPaused = false;
        this.updateFacing();
        this.updateWalkingState(true);
        this.startLivingRoutine();
      }, 3800);
    }
  }

  // 2. Pause and Enjoy Life (facing front with warm smile, dog sits beside him)
  performRelaxPause() {
    this.isPaused = true;
    this.currentAction = 'relaxing';
    this.updateWalkingState(false);
    this.setFacingFront(true);

    if (this.dog) {
      this.dog.classList.remove('is-walking');
      this.dog.classList.add('is-idle');
    }
    this.emitSparks(2, ['🌤️', '✨']);

    setTimeout(() => {
      this.setFacingFront(false);
      this.currentAction = null;
      this.isPaused = false;
      this.startLivingRoutine();
    }, 3200);
  }

  // 3. Inspect Tools / Clipboard Check
  performInspectPause() {
    this.isPaused = true;
    this.currentAction = 'inspecting';
    this.updateWalkingState(false);

    if (this.sprite) {
      this.sprite.style.backgroundImage = "url('assets/images/anish-inspect-sprite.png?v=4.8')";
      this.sprite.classList.remove('is-paused');
    }
    if (this.dog) {
      this.dog.classList.remove('is-walking');
      this.dog.classList.add('is-idle');
    }

    setTimeout(() => {
      if (this.sprite) {
        this.sprite.style.backgroundImage = '';
      }
      this.currentAction = null;
      this.isPaused = false;
      this.startLivingRoutine();
    }, 2800);
  }

  updateWalkingState(isWalking) {
    if (this.sprite) {
      if (isWalking) {
        this.sprite.classList.remove('is-paused');
      } else {
        this.sprite.classList.add('is-paused');
      }
    }
    if (this.dog) {
      if (isWalking) {
        this.dog.classList.remove('is-idle');
        this.dog.classList.add('is-walking');
      } else {
        this.dog.classList.remove('is-walking');
        this.dog.classList.add('is-idle');
      }
    }
  }

  keepInBounds() {
    const isMobile = window.innerWidth < 768;
    const minX = 28;
    const maxX = window.innerWidth - (isMobile ? 50 : 65);
    if (this.posX > maxX) this.posX = maxX;
    if (this.posX < minX) this.posX = minX;
  }

  startLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const step = () => {
      if (this.enabled) {
        // Natural 60 FPS LERP damping for vertical scroll cushion
        if (!this.isDragging && !this.isFallingEntrance) {
          this.scrollOffset += (this.targetScrollOffset - this.scrollOffset) * 0.12;
          this.targetScrollOffset *= 0.90;
          if (Math.abs(this.targetScrollOffset) < 0.04) this.targetScrollOffset = 0;
          if (Math.abs(this.scrollOffset) < 0.04) this.scrollOffset = 0;

          this.posY = this.scrollOffset;
          this.updateTransform();
        }

        // Horizontal peaceful stroll across the entire screen from edge to edge
        if (!this.isPaused && !this.currentAction && !this.isDragging && !this.isTurning && !this.isFacingFront && !this.isFallingEntrance) {
          const isMobile = window.innerWidth < 768;
          const minX = 28;
          const maxX = window.innerWidth - (isMobile ? 50 : 65);

          this.posX += this.direction * this.baseSpeed;

          // Graceful edge detection: reach full screen edge before turning around
          if (this.direction === 1 && this.posX >= maxX) {
            this.posX = maxX;
            this.turnAround(-1);
          } else if (this.direction === -1 && this.posX <= minX) {
            this.posX = minX;
            this.turnAround(1);
          }

          this.updateTransform();
        }
      }
      this.animFrameId = requestAnimationFrame(step);
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  setFacingFront(front) {
    this.isFacingFront = front;
    if (!this.sprite || !this.wrapper) return;

    if (front) {
      this.sprite.classList.add('is-facing-front', 'is-front-facing');
      this.wrapper.style.transform = 'scaleX(1)';
    } else {
      this.sprite.classList.remove('is-facing-front', 'is-front-facing');
      this.updateFacing();
    }
  }

  turnAround(newDir) {
    if (this.isTurning) return;
    this.isTurning = true;
    this.updateWalkingState(false);
    this.setFacingFront(true);

    setTimeout(() => {
      this.direction = newDir;
      this.updateFacing();
      this.setFacingFront(false);
      this.isTurning = false;
      this.updateWalkingState(true);
    }, 450);
  }

  // Periodic Crimson Red Mascot Transformation (every ~55 seconds for 15 seconds)
  scheduleRedTransformation() {
    if (this.redTransformTimer) clearTimeout(this.redTransformTimer);
    const interval = 55000;
    this.redTransformTimer = setTimeout(() => {
      if (this.enabled && !this.isDragging && !this.isFallingEntrance) {
        this.triggerRedTransformation();
      } else {
        this.scheduleRedTransformation();
      }
    }, interval);
  }

  triggerRedTransformation() {
    this.isRedVariant = true;
    if (this.sprite) {
      this.sprite.classList.add('is-red-variant');
    }
    this.emitSparks(4, ['🔴', '⚡', '✨', '🔥']);

    setTimeout(() => {
      this.isRedVariant = false;
      if (this.sprite) {
        this.sprite.classList.remove('is-red-variant');
      }
      this.scheduleRedTransformation();
    }, 15000);
  }

  updateFacing() {
    if (this.wrapper) {
      if (this.isFacingFront) {
        this.wrapper.style.transform = 'scaleX(1)';
      } else {
        this.wrapper.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
      }
    }
    if (this.dog && !this.isDogPlaying && this.currentAction !== 'dog') {
      const dogOffset = this.direction === 1 ? -32 : 24;
      const dogScale = this.direction === 1 ? 1 : -1;
      this.dog.style.left = '0';
      this.dog.style.transform = `translate3d(${dogOffset}px, 0, 0) scaleX(${dogScale})`;
    }
  }

  updateTransform() {
    if (!this.container) return;
    this.container.style.transform = `translate3d(${Math.round(this.posX)}px, ${Math.round(this.posY)}px, 0)`;
  }

  jump() {
    if (!this.wrapper) return;
    this.wrapper.classList.remove('is-jumping');
    void this.wrapper.offsetWidth;
    this.wrapper.classList.add('is-jumping');
    this.emitSparks(3);
    setTimeout(() => {
      if (this.wrapper) this.wrapper.classList.remove('is-jumping');
    }, 550);
  }

  emitSparks(count = 3, emojis = ['⚡', '✨', '💡', '🐾']) {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'mascot-spark';
      spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      spark.style.left = `${8 + Math.random() * 14}px`;
      spark.style.top = `${4 + Math.random() * 16}px`;
      spark.style.setProperty('--tx', `${(Math.random() - 0.5) * 32}px`);
      this.wrapper.appendChild(spark);
      setTimeout(() => spark.remove(), 750);
    }
  }

  onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    if (this.currentAction || this.isFallingEntrance) return;
    this.isDragging = true;
    this.dragMoved = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartPosX = this.posX;
    this.dragStartPosY = this.posY;

    this.container.classList.add('mascot-in-air');
    this.updateWalkingState(false);
    try { this.wrapper.setPointerCapture(e.pointerId); } catch (err) {}
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      this.dragMoved = true;
    }

    const isMobile = window.innerWidth < 768;
    this.posX = Math.max(20, Math.min(window.innerWidth - (isMobile ? 40 : 60), this.dragStartPosX + dx));
    this.posY = Math.min(0, this.dragStartPosY + dy);
    this.updateTransform();
  }

  onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    try { this.wrapper.releasePointerCapture(e.pointerId); } catch (err) {}

    this.container.classList.remove('mascot-in-air');

    if (this.posY < 0) {
      this.animateDropToGround();
    } else {
      this.posY = 0;
      this.updateTransform();
      this.updateWalkingState(true);
    }
  }

  animateDropToGround() {
    let velocity = 0;
    const gravity = 1.2;
    const bounceFactor = -0.35;
    let currentY = this.posY;

    const fallStep = () => {
      velocity += gravity;
      currentY += velocity;

      if (currentY >= 0) {
        currentY = 0;
        if (Math.abs(velocity) > 4) {
          velocity *= bounceFactor;
          this.emitSparks(2, ['⚡', '✨', '🐾']);
        } else {
          this.posY = 0;
          this.updateTransform();
          this.updateWalkingState(true);
          this.emitSparks(3, ['⚡', '🐾', '🐶']);
          return;
        }
      }

      this.posY = currentY;
      this.updateTransform();
      requestAnimationFrame(fallStep);
    };

    requestAnimationFrame(fallStep);
  }

  /* -------------------------------------------------------------------------
     SEQUENTIAL CLICK INTERACTIONS (Completely Silent / Zero Audio):
     1. Football Kick (Chelsea FC / Soccer) with dynamic physics & sparks
     2. Black Labrador Dog Companion & Napping in the Corner
     Subsequent clicks cycle smoothly: 0 -> 1 -> 0.
     ------------------------------------------------------------------------- */
  handleMascotClick(e) {
    this.handleClick(e);
  }

  handleClick(e) {
    if (this.dragMoved) return;

    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
      this.actionTimer = null;
    }

    const nextStep = this.clickSequence % 2;
    if (nextStep === 0) {
      this.triggerFootballAction();
    } else {
      this.triggerDogAction();
    }
  }

  cleanupCurrentActions() {
    if (this.actionTimer) {
      clearTimeout(this.actionTimer);
      this.actionTimer = null;
    }
    if (this.sprite) {
      this.sprite.classList.remove('is-kicking', 'is-sprinting');
    }
    if (this.football) {
      this.football.classList.remove('is-active');
    }
    if (this.dog) {
      this.dog.classList.remove('is-active', 'is-bouncing', 'is-walking', 'is-playing');
    }
    this.currentAction = null;
    this.isKicking = false;
    this.isDogPlaying = false;
  }

  // 1. Football Kick Interaction with realistic trajectory and bounce
  triggerFootballAction() {
    this.cleanupCurrentActions();
    this.currentAction = 'football';
    this.isKicking = true;
    this.clickSequence = 1;
    this.clickState = 1;

    if (this.badge) {
      this.badge.textContent = '⚽';
      this.badge.classList.remove('hidden');
    }

    if (this.football) {
      const ballOffset = this.direction === 1 ? 28 : -28;
      this.football.style.transform = `translate3d(${ballOffset}px, 0, 0) rotate(0deg)`;
      this.football.classList.add('is-active');
    }

    if (this.sprite) {
      this.sprite.classList.add('is-sprinting', 'is-kicking');
    }
    this.jump();
    this.emitSparks(5, ['⚽', '💙', '⚡', '✨']);

    if (this.football) {
      let ballX = this.direction === 1 ? 28 : -28;
      let ballY = 0;
      let ballVelX = this.direction === 1 ? 8.5 : -8.5;
      let ballVelY = -8.0;
      const ballGravity = 0.65;
      let ballRot = 0;

      const animateBall = () => {
        if (this.currentAction !== 'football') return;
        ballVelY += ballGravity;
        ballX += ballVelX;
        ballY += ballVelY;
        ballRot += this.direction * 16;

        if (ballY >= 0) {
          ballY = 0;
          ballVelY = -ballVelY * 0.55;
          ballVelX *= 0.88;
        }

        if (this.football) {
          this.football.style.transform = `translate3d(${ballX}px, ${ballY}px, 0) rotate(${ballRot}deg)`;
        }

        if (Math.abs(ballVelX) > 0.3 || Math.abs(ballVelY) > 0.5) {
          requestAnimationFrame(animateBall);
        } else {
          if (this.football) this.football.classList.remove('is-active');
        }
      };

      requestAnimationFrame(animateBall);
    }

    this.actionTimer = setTimeout(() => {
      if (this.football) this.football.classList.remove('is-active');
      if (this.sprite) this.sprite.classList.remove('is-sprinting', 'is-kicking');
      this.setFacingFront(false);
      if (this.badge) {
        this.badge.textContent = '⚡';
        this.badge.classList.add('hidden');
      }
      this.isKicking = false;
      if (this.currentAction === 'football') this.currentAction = null;
    }, 2500);
  }

  // 3. Black Labrador Dog Companion Interaction & Napping in the Corner
  triggerDogAction() {
    this.cleanupCurrentActions();
    this.currentAction = 'dog';
    this.isDogPlaying = true;
    this.clickSequence = 0;
    this.clickState = 0;

    if (this.badge) {
      this.badge.textContent = '🐾';
      this.badge.classList.remove('hidden');
    }

    // Boundary-safe companion positioning
    if (this.dog) {
      const isMobile = window.innerWidth < 768;
      const mascotWidth = isMobile ? 25 : 30;
      const dogWidth = 36;
      const screenMargin = 8;

      // Default relative offset: ahead of Anish
      let dogOffset = this.direction === 1 ? (mascotWidth + 4) : (-dogWidth - 4);
      let dogFacingScale = this.direction === 1 ? -1 : 1; // Dog faces Anish

      // Left edge boundary safety: if posX + dogOffset plunges off-screen, flip to right side
      if (this.posX + dogOffset < screenMargin) {
        dogOffset = mascotWidth + 6;
        dogFacingScale = -1; // Face left towards Anish
      } else if (this.posX + dogOffset + dogWidth > window.innerWidth - screenMargin) {
        // Right edge boundary safety: flip to left side
        dogOffset = -dogWidth - 6;
        dogFacingScale = 1; // Face right towards Anish
      }

      // Strict boundary clamping guard
      const minOffset = screenMargin - this.posX;
      const maxOffset = window.innerWidth - screenMargin - dogWidth - this.posX;
      dogOffset = Math.max(minOffset, Math.min(maxOffset, dogOffset));

      this.dog.style.left = '0';
      this.dog.style.transform = `translate3d(${dogOffset}px, 0, 0) scaleX(${dogFacingScale})`;
      this.dog.classList.add('is-active', 'is-bouncing');
    }

    this.setFacingFront(true);
    this.emitSparks(5, ['🐾', '🐶', '💖', '✨']);

    this.actionTimer = setTimeout(() => {
      if (this.dog) {
        this.dog.classList.remove('is-bouncing', 'is-active');
      }
      if (this.dogCorner) {
        this.dogCorner.classList.add('is-visible');
        this.dogNapping = true;
      }
      this.setFacingFront(false);
      if (this.badge) {
        this.badge.textContent = '⚡';
        this.badge.classList.add('hidden');
      }
      this.isDogPlaying = false;
      if (this.currentAction === 'dog') this.currentAction = null;
    }, 3200);
  }

  // Action aliases
  playFootballKick() { this.triggerFootballAction(); }
  playWithLabradorDog() { this.triggerDogAction(); }

  applyState(enabled) {
    this.enabled = enabled;
    const root = document.documentElement;
    const label = document.getElementById('footerMascotLabel');

    if (enabled) {
      root.classList.remove('mascot-disabled');
      if (this.container) {
        this.container.style.display = 'block';
        this.container.style.opacity = '1';
        this.container.style.visibility = 'visible';
      }
      if (label) label.textContent = 'Mascot: On ⚡';
      if (!this.animFrameId) this.startLoop();
    } else {
      root.classList.add('mascot-disabled');
      if (this.container) {
        this.container.style.display = 'none';
      }
      if (this.dogCorner) {
        this.dogCorner.classList.remove('is-visible');
      }
      if (label) label.textContent = 'Mascot: Off';
    }
  }

  toggle() {
    const nextState = !this.enabled;
    this.applyState(nextState);
    try {
      localStorage.setItem('mascot-enabled', nextState ? 'true' : 'false');
    } catch (e) {}
  }

  pause() {
    this.isPaused = true;
    this.updateWalkingState(false);
  }

  resume() {
    this.isPaused = false;
    this.updateWalkingState(true);
  }
}

// Global functions exposed to inline handlers in HTML
function initMascot() {
  window.mascotEngine = new FieldEngineerMascot();
  window.mascotEngine.init();
}

function toggleMascot() {
  if (window.mascotEngine) {
    window.mascotEngine.toggle();
  }
}

function handleMascotClick(e) {
  if (window.mascotEngine) {
    window.mascotEngine.handleClick(e);
  }
}

function handleDogClick(e) {
  if (e) e.stopPropagation();
  if (window.mascotEngine) {
    window.mascotEngine.performDogPlaySession();
  }
}

function handleNappingDogClick(e) {
  if (e) e.stopPropagation();
  if (window.mascotEngine) {
    window.mascotEngine.emitSparks(3, ['💤', '🐾', '✨']);
  }
}


/* =========================================================================
   ELECTRICAL ENGINEERING & GRID CALCULATOR SUITE ENGINE (400V - 400kV)
   Multi-Standard Compliant: IEC, NBC 207:2003 (Nepal), IS, BS 7671
   ========================================================================= */

window.currentCalcStandard = 'IEC';

const STD_CITATIONS = {
  'IEC': 'IEC 60364 / IEC 60287 / IEC 60909 Global Baseline',
  'NBC': 'Nepal National Building Code NBC 207:2003 & NEA Grid Code',
  'IS': 'IS 732 / IS 694 / IS 2026 / IS 3043 Standards',
  'BS': 'BS 7671:2018+A2:2022 IET Wiring Regulations'
};

function setCalcStandard(std) {
  if (!STD_CITATIONS[std]) std = 'IEC';
  window.currentCalcStandard = std;

  // Sync select dropdown if present
  const select = document.getElementById('calcStandardSelect');
  if (select && select.value !== std) {
    select.value = std;
  }

  const citationEl = document.getElementById('activeStdCitationText');
  if (citationEl) {
    citationEl.textContent = STD_CITATIONS[std];
  }

  // Re-run relevant modules to reflect standard rules
  runMod1();
  runMod11();
}

function applyVoltagePreset(vkv, label) {
  // Update volt pills UI
  const pills = document.querySelectorAll('.calc-volt-pill');
  pills.forEach(p => {
    if (p.textContent.includes(vkv >= 1 ? `${vkv} kV` : `${vkv * 1000} V`)) {
      p.classList.add('active', 'border-cerulean', 'bg-cerulean', 'text-white');
    } else {
      p.classList.remove('active', 'border-cerulean', 'bg-cerulean', 'text-white');
    }
  });

  // Apply to Module 3 (AC Power)
  const m3V = document.getElementById('m3_vkv');
  if (m3V) { m3V.value = vkv; runMod3(); }

  // Apply to Module 4 (Transformers)
  const m4V1 = document.getElementById('m4_v1');
  if (m4V1 && vkv > 0.4) { m4V1.value = vkv; runMod4(); }

  // Apply to Module 5 (Fault Level)
  const m5V = document.getElementById('m5_vkv');
  if (m5V) { m5V.value = vkv; runMod5(); }

  // Apply to Module 8 (Transmission SIL)
  const m8V = document.getElementById('m8_vkv');
  if (m8V && (vkv === 66 || vkv === 132 || vkv === 220 || vkv === 400)) {
    m8V.value = String(vkv); runMod8();
  }

  // Apply to Module 10 (Surge Arrester)
  const m10V = document.getElementById('m10_vn');
  if (m10V && (vkv === 11 || vkv === 33 || vkv === 66 || vkv === 132 || vkv === 220 || vkv === 400)) {
    m10V.value = String(vkv); runMod10();
  }
}

function filterCalcCategory(cat) {
  // Update filter pills UI
  const pills = document.querySelectorAll('.calc-filter-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === cat) {
      p.classList.add('active', 'bg-ink', 'text-white', 'dark:bg-white', 'dark:text-ink');
      p.classList.remove('bg-linen', 'dark:bg-[#1E293B]', 'text-slate-700', 'dark:text-[#CBD5E1]');
    } else {
      p.classList.remove('active', 'bg-ink', 'text-white', 'dark:bg-white', 'dark:text-ink');
      p.classList.add('bg-linen', 'dark:bg-[#1E293B]', 'text-slate-700', 'dark:text-[#CBD5E1]');
    }
  });

  const cards = document.querySelectorAll('.calc-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

/* =========================================================================
   MODULE 0: ENERGY & POWER UNIT CONVERSION & DURATION (E = P * t)
   ========================================================================= */
function runMod0() {
  const pVal = parseFloat(document.getElementById('m0_powerVal')?.value) || 0;
  const pUnit = document.getElementById('m0_powerUnit')?.value || 'kW';
  const dVal = parseFloat(document.getElementById('m0_durationVal')?.value) || 0;
  const dUnit = document.getElementById('m0_durationUnit')?.value || 'hours';

  // Convert power to Watts
  let powerW = 0;
  if (pUnit === 'W') powerW = pVal;
  else if (pUnit === 'kW') powerW = pVal * 1e3;
  else if (pUnit === 'MW') powerW = pVal * 1e6;
  else if (pUnit === 'hp') powerW = pVal * 745.69987;
  else if (pUnit === 'PS') powerW = pVal * 735.49875;
  else if (pUnit === 'BTU_h') powerW = pVal * 0.293071;
  else if (pUnit === 'J_s') powerW = pVal;

  // Convert duration to seconds
  let durSec = 0;
  if (dUnit === 'seconds') durSec = dVal;
  else if (dUnit === 'minutes') durSec = dVal * 60;
  else if (dUnit === 'hours') durSec = dVal * 3600;
  else if (dUnit === 'days') durSec = dVal * 86400;
  else if (dUnit === 'months') durSec = dVal * 86400 * 30;
  else if (dUnit === 'years') durSec = dVal * 86400 * 365;

  const energyJoules = powerW * durSec;
  const energyKwh = energyJoules / 3.6e6;
  const energyMj = energyJoules / 1e6;
  const energyBtu = energyKwh * 3412.14;
  const energyHph = energyJoules / (745.7 * 3600);
  const hpImp = powerW / 745.69987;
  const kcalTotal = energyJoules / 4184;

  const elKwh = document.getElementById('m0_res_kwh');
  if (elKwh) elKwh.textContent = energyKwh >= 1e6 ? `${(energyKwh / 1e6).toFixed(2)} GWh` : energyKwh >= 1e3 ? `${(energyKwh / 1e3).toFixed(2)} MWh` : `${energyKwh.toFixed(1)} kWh`;

  const elMj = document.getElementById('m0_res_mj');
  if (elMj) elMj.textContent = energyMj >= 1e3 ? `${(energyMj / 1e3).toFixed(2)} GJ` : `${energyMj.toFixed(1)} MJ`;

  const elBtu = document.getElementById('m0_res_btu');
  if (elBtu) elBtu.textContent = `${Math.round(energyBtu).toLocaleString()} BTU`;

  const elHph = document.getElementById('m0_res_hph');
  if (elHph) elHph.textContent = `${energyHph.toFixed(1)} hp•h`;

  const elW = document.getElementById('m0_res_w');
  if (elW) elW.textContent = `${Math.round(powerW).toLocaleString()} W`;

  const elHp = document.getElementById('m0_res_hp');
  if (elHp) elHp.textContent = `${hpImp.toFixed(2)} hp`;

  const elKcal = document.getElementById('m0_res_kcal');
  if (elKcal) elKcal.textContent = `${Math.round(kcalTotal).toLocaleString()} kcal`;
}

/* =========================================================================
   MODULE 1: DOMESTIC APPLIANCE WIRE SIZING & MCB (NBC 207 / IEC)
   ========================================================================= */
const APPLIANCE_PRESETS = {
  'light': { loadW: 300, supply: '230_1ph', length: 20, pf: 0.95 },
  'ac15': { loadW: 1800, supply: '230_1ph', length: 25, pf: 0.85 },
  'geyser': { loadW: 2500, supply: '230_1ph', length: 15, pf: 1.0 },
  'induction': { loadW: 2000, supply: '230_1ph', length: 15, pf: 0.98 },
  'pump': { loadW: 746, supply: '230_1ph', length: 30, pf: 0.80 },
  'ev': { loadW: 7400, supply: '230_1ph', length: 25, pf: 0.99 }
};

function setAppliancePreset(type) {
  const p = APPLIANCE_PRESETS[type];
  if (!p) return;
  const loadEl = document.getElementById('m1_loadW');
  const supEl = document.getElementById('m1_supply');
  const lenEl = document.getElementById('m1_length');
  const pfEl = document.getElementById('m1_pf');

  if (loadEl) loadEl.value = p.loadW;
  if (supEl) supEl.value = p.supply;
  if (lenEl) lenEl.value = p.length;
  if (pfEl) pfEl.value = p.pf;

  runMod1();
}

function runMod1() {
  const loadW = parseFloat(document.getElementById('m1_loadW')?.value) || 0;
  const supply = document.getElementById('m1_supply')?.value || '230_1ph';
  const lengthM = parseFloat(document.getElementById('m1_length')?.value) || 1;
  const pf = parseFloat(document.getElementById('m1_pf')?.value) || 0.85;

  const isThreePhase = supply === '400_3ph';
  const voltage = isThreePhase ? 400 : 230;

  // Current draw
  let currentA = 0;
  if (isThreePhase) {
    currentA = loadW / (Math.sqrt(3) * voltage * pf);
  } else {
    currentA = loadW / (voltage * pf);
  }

  // Standard copper building wire sizes and ampacities (IEC 60228 / IS 694 in conduit)
  const wireTables = [
    { size: 1.0, amp: 11 },
    { size: 1.5, amp: 15 },
    { size: 2.5, amp: 21 },
    { size: 4.0, amp: 28 },
    { size: 6.0, amp: 36 },
    { size: 10.0, amp: 50 },
    { size: 16.0, amp: 68 },
    { size: 25.0, amp: 89 }
  ];

  // Minimum wire size rule (NBC 207 Cl. 5.1 & IEC 60364-5-52):
  // Dedicated power socket circuits, ACs, heaters or loads >= 1000W require min 2.5 mm²
  let minAllowedSize = (loadW >= 1000 || currentA > 5) ? 2.5 : 1.5;

  const rho = 0.0175; // Copper resistivity (ohm*mm2/m)
  let chosenWire = wireTables[wireTables.length - 1];

  // Select wire satisfying ampacity and voltage drop <= 3%
  for (const w of wireTables) {
    if (w.size < minAllowedSize) continue;
    if (w.amp >= currentA) {
      // Check voltage drop
      let rLoop = isThreePhase ? (rho * lengthM) / w.size : (rho * 2 * lengthM) / w.size;
      let vDrop = isThreePhase ? Math.sqrt(3) * currentA * rLoop : currentA * rLoop;
      let vDropPct = (vDrop / voltage) * 100;
      if (vDropPct <= 3.0) {
        chosenWire = w;
        break;
      }
    }
  }

  // Recompute actual voltage drop with chosen wire
  const rLoop = isThreePhase ? (rho * lengthM) / chosenWire.size : (rho * 2 * lengthM) / chosenWire.size;
  const vDrop = isThreePhase ? Math.sqrt(3) * currentA * rLoop : currentA * rLoop;
  const vDropPct = (vDrop / voltage) * 100;
  const lossW = isThreePhase ? 3 * Math.pow(currentA, 2) * rLoop : Math.pow(currentA, 2) * rLoop;

  // MCB Rating Selection
  const mcbRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63];
  let chosenMcb = 63;
  for (const r of mcbRatings) {
    if (r >= currentA * 1.15) {
      chosenMcb = r;
      break;
    }
  }
  const mcbCurve = (loadW >= 1500 || loadW === 746) ? 'Type C' : 'Type B';

  // DOM Updates
  const elI = document.getElementById('m1_res_current');
  if (elI) elI.textContent = `${currentA.toFixed(2)} A`;

  const elWire = document.getElementById('m1_res_wire');
  if (elWire) elWire.textContent = `${chosenWire.size} mm² Cu`;

  const elVdrop = document.getElementById('m1_res_vdrop');
  if (elVdrop) elVdrop.textContent = `${vDrop.toFixed(2)} V (${vDropPct.toFixed(2)}%)`;

  const elMcb = document.getElementById('m1_res_mcb');
  if (elMcb) elMcb.textContent = `${chosenMcb}A (${mcbCurve})`;

  const elBadge = document.getElementById('m1_complianceBadge');
  const elLoss = document.getElementById('m1_lossWatts');
  if (elLoss) elLoss.textContent = `Loss: ${lossW.toFixed(1)} W`;

  if (elBadge) {
    if (vDropPct <= 3.0) {
      elBadge.className = 'mt-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-mono flex items-center justify-between';
      elBadge.firstElementChild.textContent = window.currentCalcStandard === 'NBC'
        ? `✓ NBC 207 Cl. 5.1 Compliant (Drop ${vDropPct.toFixed(2)}% ≤ 3%, Min ${minAllowedSize}mm²)`
        : `✓ IEC 60364-5-52 Compliant (Voltage Drop ${vDropPct.toFixed(2)}% ≤ 3%)`;
    } else {
      elBadge.className = 'mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-mono flex items-center justify-between';
      elBadge.firstElementChild.textContent = `⚠ Voltage Drop ${vDropPct.toFixed(2)}% exceeds 3% recommendation. Consider larger wire.`;
    }
  }
}

/* =========================================================================
   MODULE 2: SUBSTATION DC CONTROL CABLE & TRIP COIL VOLTAGE DROP
   ========================================================================= */
function runMod2() {
  const vbat = parseFloat(document.getElementById('m2_vbat')?.value) || 110;
  const itrip = parseFloat(document.getElementById('m2_itrip')?.value) || 8.5;
  const csize = parseFloat(document.getElementById('m2_csize')?.value) || 2.5;
  const lengthM = parseFloat(document.getElementById('m2_length')?.value) || 120;

  const rho = 0.0175; // copper
  const rLoop = (rho * 2 * lengthM) / csize;
  const vDrop = itrip * rLoop;
  const vTerm = vbat - vDrop;
  const pctNom = (vTerm / vbat) * 100;

  const elR = document.getElementById('m2_res_rloop');
  if (elR) elR.textContent = `${rLoop.toFixed(3)} Ω`;

  const elV = document.getElementById('m2_res_vterm');
  if (elV) elV.textContent = `${vTerm.toFixed(2)} V DC`;

  const elPct = document.getElementById('m2_res_pct');
  if (elPct) {
    elPct.textContent = `${pctNom.toFixed(1)}% (≥ 70%)`;
    elPct.className = pctNom >= 70 ? 'text-sm font-bold text-emerald-600 dark:text-emerald-400' : 'text-sm font-bold text-rose-600 dark:text-rose-400';
  }

  const elBanner = document.getElementById('m2_statusBanner');
  if (elBanner) {
    if (pctNom >= 70) {
      elBanner.className = 'mt-2.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-xs font-mono flex items-center justify-between';
      elBanner.firstElementChild.textContent = '✓ Positive Circuit Breaker Tripping Guaranteed (IEC 62271-100 ≥ 70% Limit)';
    } else {
      elBanner.className = 'mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-mono flex items-center justify-between';
      elBanner.firstElementChild.textContent = '✕ Trip Coil Fail-to-Trip Risk (< 70% Nominal). Increase cable to 4 mm²!';
    }
    elBanner.lastElementChild.textContent = `Drop: ${vDrop.toFixed(2)} V`;
  }
}

/* =========================================================================
   MODULE 3: 3-PHASE AC POWER, CURRENT & CAPACITOR SIZING
   ========================================================================= */
function runMod3() {
  const vkv = parseFloat(document.getElementById('m3_vkv')?.value) || 33;
  const pmw = parseFloat(document.getElementById('m3_pmw')?.value) || 15;
  const pf1 = parseFloat(document.getElementById('m3_pf1')?.value) || 0.82;
  const pf2 = parseFloat(document.getElementById('m3_pf2')?.value) || 0.98;

  const vVolts = vkv * 1000;
  const pWatts = pmw * 1e6;

  const i1 = pWatts / (Math.sqrt(3) * vVolts * pf1);
  const phi1 = Math.acos(Math.min(1, Math.max(0, pf1)));
  const phi2 = Math.acos(Math.min(1, Math.max(0, pf2)));

  const qcMvar = pmw * (Math.tan(phi1) - Math.tan(phi2));
  const i2 = pWatts / (Math.sqrt(3) * vVolts * pf2);
  const lossSaved = (1 - Math.pow(pf1 / pf2, 2)) * 100;

  const elI1 = document.getElementById('m3_res_i1');
  if (elI1) elI1.textContent = `${i1.toFixed(1)} A`;

  const elQc = document.getElementById('m3_res_qc');
  if (elQc) elQc.textContent = `${qcMvar.toFixed(2)} MVAr`;

  const elI2 = document.getElementById('m3_res_i2');
  if (elI2) elI2.textContent = `${i2.toFixed(1)} A`;

  const elLoss = document.getElementById('m3_res_lossSaved');
  if (elLoss) elLoss.textContent = `${Math.max(0, lossSaved).toFixed(1)}%`;
}

/* =========================================================================
   MODULE 4: POWER TRANSFORMER SIZING, LOADING & EFFICIENCY
   ========================================================================= */
function runMod4() {
  const v1 = parseFloat(document.getElementById('m4_v1')?.value) || 132;
  const v2 = parseFloat(document.getElementById('m4_v2')?.value) || 33;
  const loadMva = parseFloat(document.getElementById('m4_loadMva')?.value) || 50;
  const margin = parseFloat(document.getElementById('m4_margin')?.value) || 20;

  const sDesignMva = loadMva * (1 + margin / 100);

  // Standard transformer ratings
  const stdMvaRatings = [
    0.025, 0.05, 0.1, 0.2, 0.315, 0.5, 0.63, 0.8, 1.0, 1.6, 2.0, 2.5,
    3.15, 5.0, 8.0, 10.0, 16.0, 20.0, 25.0, 31.5, 40.0, 50.0, 63.0, 100.0, 160.0, 200.0, 315.0
  ];

  let chosenMva = stdMvaRatings[stdMvaRatings.length - 1];
  for (const r of stdMvaRatings) {
    if (r >= sDesignMva * 0.99) {
      chosenMva = r;
      break;
    }
  }

  const ihv = (chosenMva * 1e6) / (Math.sqrt(3) * v1 * 1e3);
  const ilv = (chosenMva * 1e6) / (Math.sqrt(3) * v2 * 1e3);

  const elReq = document.getElementById('m4_res_sreq');
  if (elReq) elReq.textContent = sDesignMva < 1 ? `${(sDesignMva * 1000).toFixed(0)} kVA` : `${sDesignMva.toFixed(2)} MVA`;

  const elRating = document.getElementById('m4_res_rating');
  if (elRating) elRating.textContent = chosenMva < 1 ? `${(chosenMva * 1000).toFixed(0)} kVA` : `${chosenMva.toFixed(1)} MVA`;

  const elIhv = document.getElementById('m4_res_ihv');
  if (elIhv) elIhv.textContent = `${ihv.toFixed(1)} A`;

  const elIlv = document.getElementById('m4_res_ilv');
  if (elIlv) elIlv.textContent = `${ilv.toFixed(1)} A`;
}

/* =========================================================================
   MODULE 5: BUSBAR SYMMETRICAL FAULT LEVEL & SHORT CIRCUIT (IEC 60909)
   ========================================================================= */
function runMod5() {
  const vkv = parseFloat(document.getElementById('m5_vkv')?.value) || 33;
  const txMva = parseFloat(document.getElementById('m5_txMva')?.value) || 63;
  const zpct = parseFloat(document.getElementById('m5_zpct')?.value) || 12.5;
  const gridMva = parseFloat(document.getElementById('m5_gridMva')?.value) || 2500;

  const baseMva = 100;
  const ztxPu = (zpct / 100) * (baseMva / txMva);
  const zgridPu = baseMva / gridMva;
  const ztotPu = ztxPu + zgridPu;

  const iscKa = baseMva / (Math.sqrt(3) * vkv * ztotPu);
  const faultMva = Math.sqrt(3) * vkv * iscKa;
  const ipeakKa = 2.55 * iscKa;

  const elIsc = document.getElementById('m5_res_isc');
  if (elIsc) elIsc.textContent = `${iscKa.toFixed(2)} kA rms`;

  const elMva = document.getElementById('m5_res_mva');
  if (elMva) elMva.textContent = `${faultMva.toFixed(1)} MVA`;

  const elIpeak = document.getElementById('m5_res_ipeak');
  if (elIpeak) elIpeak.textContent = `${ipeakKa.toFixed(2)} kA peak`;
}

/* =========================================================================
   MODULE 6: POWER CABLE & CONDUCTOR SIZING (XLPE / ACSR)
   ========================================================================= */
function runMod6() {
  const mat = document.getElementById('m6_mat')?.value || 'Cu_XLPE';
  const iload = parseFloat(document.getElementById('m6_iload')?.value) || 450;
  const isc = parseFloat(document.getElementById('m6_isc')?.value) || 25;
  const tfault = parseFloat(document.getElementById('m6_tfault')?.value) || 1.0;

  let kFactor = 143; // Cu/XLPE
  if (mat === 'Al_XLPE') kFactor = 94;
  else if (mat === 'ACSR') kFactor = 78;

  const sMin = (isc * 1e3 * Math.sqrt(tfault)) / kFactor;

  const stdCableSizes = [25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800];
  let sCont = 240;
  if (iload > 600) sCont = 500;
  else if (iload > 450) sCont = 300;
  else if (iload > 300) sCont = 240;
  else if (iload > 200) sCont = 150;
  else sCont = 95;

  const requiredArea = Math.max(sMin, sCont);
  let recSize = stdCableSizes[stdCableSizes.length - 1];
  for (const s of stdCableSizes) {
    if (s >= requiredArea) {
      recSize = s;
      break;
    }
  }

  const elSmin = document.getElementById('m6_res_smin');
  if (elSmin) elSmin.textContent = `${sMin.toFixed(1)} mm²`;

  const elScont = document.getElementById('m6_res_scont');
  if (elScont) elScont.textContent = `${sCont} mm²`;

  const elRec = document.getElementById('m6_res_rec');
  if (elRec) elRec.textContent = `${recSize} mm² ${mat.replace('_', ' ')}`;
}

/* =========================================================================
   MODULE 7: SUBSTATION BUSBAR SIZING & ELECTRODYNAMIC FORCES (IEC 60865)
   ========================================================================= */
function runMod7() {
  const ip = parseFloat(document.getElementById('m7_ip')?.value) || 63;
  const spacingMm = parseFloat(document.getElementById('m7_spacing')?.value) || 1500;
  const spanM = parseFloat(document.getElementById('m7_span')?.value) || 5.0;

  const aMeters = spacingMm / 1000;
  const ipAmps = ip * 1e3;

  // IEC 60865 formula: Fm = (mu0 / 2pi) * (ip^2 / a) = 2e-7 * ip^2 / a
  const fm = (2e-7 * Math.pow(ipAmps, 2)) / aMeters;
  const ftot = fm * spanM;

  const elFm = document.getElementById('m7_res_fm');
  if (elFm) elFm.textContent = `${fm.toFixed(1)} N/m`;

  const elFtot = document.getElementById('m7_res_ftot');
  if (elFtot) elFtot.textContent = `${Math.round(ftot).toLocaleString()} N`;

  const elCheck = document.getElementById('m7_res_check');
  if (elCheck) {
    if (ftot < 8000) {
      elCheck.textContent = '✓ Safe (< 8 kN)';
      elCheck.className = 'text-sm font-bold text-emerald-600 dark:text-emerald-400';
    } else {
      elCheck.textContent = '⚠ High Force (≥ 8 kN)';
      elCheck.className = 'text-sm font-bold text-rose-600 dark:text-rose-400';
    }
  }
}

/* =========================================================================
   MODULE 8: TRANSMISSION LINE SURGE IMPEDANCE LOADING (SIL)
   ========================================================================= */
function runMod8() {
  const vkv = parseFloat(document.getElementById('m8_vkv')?.value) || 132;
  const zc = parseFloat(document.getElementById('m8_zc')?.value) || 380;
  const lengthKm = parseFloat(document.getElementById('m8_len')?.value) || 85;

  const silMw = Math.pow(vkv, 2) / zc;

  // St. Clair factor curve approximation
  let stClairFactor = 1.0;
  if (lengthKm <= 80) stClairFactor = 2.5 - (lengthKm / 80) * 0.7; // ~1.8 to 2.5
  else if (lengthKm <= 250) stClairFactor = 1.8 - ((lengthKm - 80) / 170) * 0.6; // ~1.2 to 1.8
  else stClairFactor = Math.max(0.7, 1.2 - ((lengthKm - 250) / 350) * 0.5);

  const practicalLimitMw = silMw * stClairFactor;

  const elSil = document.getElementById('m8_res_sil');
  if (elSil) elSil.textContent = `${silMw.toFixed(2)} MW`;

  const elFactor = document.getElementById('m8_res_stclair');
  if (elFactor) elFactor.textContent = `${stClairFactor.toFixed(2)} × SIL`;

  const elLimit = document.getElementById('m8_res_limit');
  if (elLimit) elLimit.textContent = `${practicalLimitMw.toFixed(1)} MW`;
}

/* =========================================================================
   MODULE 9: PROTECTION CT KNEE-POINT & SATURATION VALIDATION (IEC 61869)
   ========================================================================= */
function runMod9() {
  const ipri = parseFloat(document.getElementById('m9_ipri')?.value) || 800;
  const isec = parseFloat(document.getElementById('m9_isec')?.value) || 1;
  const ifaultKa = parseFloat(document.getElementById('m9_ifault')?.value) || 31.5;
  const rct = parseFloat(document.getElementById('m9_rct')?.value) || 4.0;

  const ctRatio = ipri / isec;
  const ifSec = (ifaultKa * 1e3) / ctRatio;
  const rLead = 1.0; // typical 1 ohm loop
  const rRelay = 0.5;

  // Vk >= 2 * If_sec * (Rct + 2*Rlead + Rrelay)
  const vk = 2 * ifSec * (rct + rLead + rRelay);

  const elIfsec = document.getElementById('m9_res_ifsec');
  if (elIfsec) elIfsec.textContent = `${ifSec.toFixed(2)} A`;

  const elVk = document.getElementById('m9_res_vk');
  if (elVk) elVk.textContent = `${vk.toFixed(1)} V`;

  const elStat = document.getElementById('m9_res_stat');
  if (elStat) {
    elStat.textContent = vk < 800 ? '✓ Safe Diff Zone' : '⚠ High Vk (> 800V)';
    elStat.className = vk < 800 ? 'text-sm font-bold text-emerald-600 dark:text-emerald-400' : 'text-sm font-bold text-amber-600 dark:text-amber-400';
  }
}

/* =========================================================================
   MODULE 10: SURGE ARRESTER (LA) RATING & MCOV SELECTION (IEC 60099)
   ========================================================================= */
function runMod10() {
  const vn = parseFloat(document.getElementById('m10_vn')?.value) || 132;
  const earthing = document.getElementById('m10_earthing')?.value || 'solid';

  // System Highest Voltage Um
  const umMap = { 11: 12, 33: 36, 66: 72.5, 132: 145, 220: 245, 400: 420 };
  const um = umMap[vn] || (vn * 1.1);

  const kEarth = earthing === 'solid' ? 1.4 : 1.73;

  const mcov = (um / Math.sqrt(3)) * 1.05;
  const ur = kEarth * (um / Math.sqrt(3));

  // Standard ratings lookup
  const stdLas = {
    11: '9 kV / 10 kA',
    33: '30 kV / 10 kA',
    66: '60 kV / 10 kA',
    132: '120 kV / 10 kA',
    220: '198 kV / 10 kA',
    400: '360 kV / 20 kA'
  };

  const elMcov = document.getElementById('m10_res_mcov');
  if (elMcov) elMcov.textContent = `${mcov.toFixed(1)} kV rms`;

  const elUr = document.getElementById('m10_res_ur');
  if (elUr) elUr.textContent = `${Math.ceil(ur)} kV rms`;

  const elStd = document.getElementById('m10_res_std');
  if (elStd) elStd.textContent = stdLas[vn] || `${Math.ceil(ur)} kV / 10 kA`;
}

/* =========================================================================
   MODULE 11: NEPAL NATIONAL BUILDING CODE (NBC 207) COMPLIANCE CHECKER
   ========================================================================= */
function runMod11() {
  const btype = document.getElementById('m11_type')?.value || 'residential';
  const lightKw = parseFloat(document.getElementById('m11_lightKw')?.value) || 0;
  const socketKw = parseFloat(document.getElementById('m11_socketKw')?.value) || 0;
  const hvacKw = parseFloat(document.getElementById('m11_hvacKw')?.value) || 0;
  const earthType = document.getElementById('m11_earthType')?.value || 'pipe';
  const soilRho = parseFloat(document.getElementById('m11_soilRho')?.value) || 50;

  const totKw = lightKw + socketKw + hvacKw;

  // NBC 207 Diversity Factors
  let lightDiv = 0.66;
  let socketDiv = 0.50;
  let hvacDiv = 0.70;

  if (btype === 'commercial') {
    lightDiv = 0.90; socketDiv = 0.70; hvacDiv = 0.85;
  } else if (btype === 'office') {
    lightDiv = 0.80; socketDiv = 0.60; hvacDiv = 0.80;
  }

  const demandKw = (lightKw * lightDiv) + (socketKw * socketDiv) + (hvacKw * hvacDiv);

  // NEA Service sizing
  let serviceMains = '6 mm² (25A MCB)';
  if (demandKw > 15) serviceMains = '25 mm² (63A 3-Ph)';
  else if (demandKw > 10) serviceMains = '16 mm² (40A 3-Ph)';
  else if (demandKw > 6.9) serviceMains = '10 mm² (32A 3-Ph)';
  else if (demandKw > 4.5) serviceMains = '10 mm² (32A 1-Ph)';
  else serviceMains = '6 mm² (25A 1-Ph)';

  // Earthing Resistance (IS 3043 / NBC 207 formula)
  // GI Pipe: R = (rho / 2pi L) * ln(4L / d), L=3m, d=0.04m -> ln(12/0.04) = ln(300) = 5.703
  let earthR = 0;
  if (earthType === 'pipe') {
    earthR = (soilRho / (2 * Math.PI * 3.0)) * Math.log((4 * 3.0) / 0.04);
  } else {
    // Copper plate 600x600 mm (0.36 m2): R = (rho / 4) * sqrt(pi / Area)
    earthR = (soilRho / 4.0) * Math.sqrt(Math.PI / 0.36);
  }

  const elTot = document.getElementById('m11_res_totKw');
  if (elTot) elTot.textContent = `${totKw.toFixed(2)} kW`;

  const elDemand = document.getElementById('m11_res_demandKw');
  if (elDemand) elDemand.textContent = `${demandKw.toFixed(2)} kW`;

  const elService = document.getElementById('m11_res_serviceMains');
  if (elService) elService.textContent = serviceMains;

  const elEarthR = document.getElementById('m11_res_earthR');
  if (elEarthR) elEarthR.textContent = `${earthR.toFixed(1)} Ω`;

  const elEarthStatus = document.getElementById('m11_res_earthStatus');
  if (elEarthStatus) {
    if (earthR <= 5.0) {
      elEarthStatus.textContent = '✓ Pass (≤ 5 Ω)';
      elEarthStatus.className = 'text-sm font-bold text-emerald-600 dark:text-emerald-400';
    } else {
      elEarthStatus.textContent = 'Add 2nd Rod (≤ 5 Ω)';
      elEarthStatus.className = 'text-sm font-bold text-amber-600 dark:text-amber-400';
    }
  }

  const elCatText = document.getElementById('m11_supplyCategoryText');
  if (elCatText) {
    elCatText.textContent = demandKw <= 6.9 ? 'NEA Category: 230 V 1-Phase (Up to 30A / 6.9 kW)' : 'NEA Category: 400 V 3-Phase Supply Required';
  }
}

/* =========================================================================
   COPY CALCULATION SUMMARY TO CLIPBOARD
   ========================================================================= */
function copyCalcReport(modId) {
  const card = document.querySelector(`.calc-card[data-mod="${modId}"]`) || document.querySelector(`#view-calculators`);
  let text = `===========================================================\n`;
  text += `ANISH NIROULA — ELECTRICAL ENGINEERING CALCULATION REPORT\n`;
  text += `Domain: anish-niroula.com.np | Standard: ${window.currentCalcStandard}\n`;
  text += `===========================================================\n\n`;

  if (modId === 'mod0') {
    text += `MODULE 0: ENERGY & POWER UNIT CONVERSION & DURATION\n`;
    text += `Power: ${document.getElementById('m0_powerVal')?.value} ${document.getElementById('m0_powerUnit')?.value}\n`;
    text += `Duration: ${document.getElementById('m0_durationVal')?.value} ${document.getElementById('m0_durationUnit')?.value}\n`;
    text += `Transferred Energy: ${document.getElementById('m0_res_kwh')?.textContent} | ${document.getElementById('m0_res_mj')?.textContent} | ${document.getElementById('m0_res_btu')?.textContent}\n`;
    text += `Mechanical HP: ${document.getElementById('m0_res_hp')?.textContent}\n`;
  } else if (modId === 'mod1') {
    text += `MODULE 1: APPLIANCE LOAD, WIRE SIZING & MCB (NBC 207 / IEC)\n`;
    text += `Load: ${document.getElementById('m1_loadW')?.value} W @ ${document.getElementById('m1_supply')?.value}\n`;
    text += `Operating Current: ${document.getElementById('m1_res_current')?.textContent}\n`;
    text += `Recommended Wire: ${document.getElementById('m1_res_wire')?.textContent}\n`;
    text += `Voltage Drop: ${document.getElementById('m1_res_vdrop')?.textContent}\n`;
    text += `Recommended MCB: ${document.getElementById('m1_res_mcb')?.textContent}\n`;
  } else if (modId === 'mod2') {
    text += `MODULE 2: CONTROL CABLE & BREAKER TRIP COIL SIZING (IEC 62271-100)\n`;
    text += `Battery: ${document.getElementById('m2_vbat')?.value} V DC | Trip Current: ${document.getElementById('m2_itrip')?.value} A\n`;
    text += `Cable Size: ${document.getElementById('m2_csize')?.value} mm² | Length: ${document.getElementById('m2_length')?.value} m\n`;
    text += `Terminal Voltage: ${document.getElementById('m2_res_vterm')?.textContent} (${document.getElementById('m2_res_pct')?.textContent})\n`;
  } else if (modId === 'mod3') {
    text += `MODULE 3: 3-PHASE AC POWER & CAPACITOR SIZING\n`;
    text += `System: ${document.getElementById('m3_vkv')?.value} kV | Load: ${document.getElementById('m3_pmw')?.value} MW\n`;
    text += `Initial Current: ${document.getElementById('m3_res_i1')?.textContent}\n`;
    text += `Capacitor Bank Required: ${document.getElementById('m3_res_qc')?.textContent}\n`;
    text += `Corrected Current: ${document.getElementById('m3_res_i2')?.textContent}\n`;
  } else if (modId === 'mod4') {
    text += `MODULE 4: POWER TRANSFORMER SIZING & FLC (IEC 60076)\n`;
    text += `Voltages: ${document.getElementById('m4_v1')?.value} kV / ${document.getElementById('m4_v2')?.value} kV\n`;
    text += `Load: ${document.getElementById('m4_loadMw')?.value} MW @ PF ${document.getElementById('m4_pf')?.value}\n`;
    text += `Recommended Rating: ${document.getElementById('m4_res_rating')?.textContent}\n`;
    text += `HV FLC: ${document.getElementById('m4_res_ihv')?.textContent} | LV FLC: ${document.getElementById('m4_res_ilv')?.textContent}\n`;
  } else if (modId === 'mod5') {
    text += `MODULE 5: BUSBAR SYMMETRICAL SHORT CIRCUIT (IEC 60909)\n`;
    text += `Bus Voltage: ${document.getElementById('m5_vkv')?.value} kV | Tx: ${document.getElementById('m5_txMva')?.value} MVA, ${document.getElementById('m5_zpct')?.value} %Z\n`;
    text += `Fault Current: ${document.getElementById('m5_res_isc')?.textContent}\n`;
    text += `Short Circuit MVA: ${document.getElementById('m5_res_mva')?.textContent}\n`;
    text += `Peak Making Current: ${document.getElementById('m5_res_ipeak')?.textContent}\n`;
  } else if (modId === 'mod11') {
    text += `MODULE 11: NEPAL NATIONAL BUILDING CODE (NBC 207:2003) COMPLIANCE\n`;
    text += `Occupancy: ${document.getElementById('m11_type')?.value}\n`;
    text += `Connected Load: ${document.getElementById('m11_res_totKw')?.textContent}\n`;
    text += `NBC Max Demand: ${document.getElementById('m11_res_demandKw')?.textContent}\n`;
    text += `NEA Service Mains: ${document.getElementById('m11_res_serviceMains')?.textContent}\n`;
    text += `Earth Resistance: ${document.getElementById('m11_res_earthR')?.textContent} (${document.getElementById('m11_res_earthStatus')?.textContent})\n`;
  } else {
    text += `CALCULATION MODULE: ${modId}\n`;
    text += `Generated online at https://anish-niroula.com.np/#calculators\n`;
  }

  text += `\n---\nReport generated by Anish Niroula Engineering Portfolio (anish-niroula.com.np)`;

  // Copy via navigator or textarea fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Calculation report copied to clipboard!');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert('Calculation report copied to clipboard!');
}

/* =========================================================================
   INITIALIZE ALL CALCULATORS ON LOAD
   ========================================================================= */
function initCalculators() {
  runMod0();
  runMod1();
  runMod2();
  runMod3();
  runMod4();
  runMod5();
  runMod6();
  runMod7();
  runMod8();
  runMod9();
  runMod10();
  runMod11();
  // Default to compact substation category view
  filterCalcCategory('substation');
}
