/* =========================================================================
   ANISH NIROULA — ELECTRICAL ENGINEERING PORTFOLIO (aniroula.com.np)
   APPLICATION LOGIC: ROUTING, IEC SLD INTERLOCK, ACADEMIC ROUTE & LIGHTBOX
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. MULTI-VIEW NAVIGATION & ROUTING
   ------------------------------------------------------------------------- */
const VIEW_IDS = ['overview', 'career-sld', 'academics', 'research', 'projects'];

const VIEW_TITLES = {
  'overview': 'Anish Niroula — High Voltage Electrical Engineer & EPC Project Manager',
  'career-sld': 'Career Single-Line Diagram — Anish Niroula | aniroula.com.np',
  'academics': 'Academics & Licensure Route — Anish Niroula | aniroula.com.np',
  'research': 'Research & Publications — Anish Niroula | aniroula.com.np',
  'projects': 'Projects & Site Archive — Anish Niroula | aniroula.com.np'
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
   3. HYBRID IMAGE RESOLUTION (STATIC PATHS + LOCAL IN-MEMORY DRAFTING)
   ------------------------------------------------------------------------- */
const memoryPhotos = {};

function getStoredPhoto(slotKey) {
  if (memoryPhotos[slotKey]) return memoryPhotos[slotKey];
  try {
    const local = localStorage.getItem('aniroula_v4_photo_' + slotKey);
    if (local) return local;
  } catch (e) {}
  return STATIC_IMAGE_REGISTRY[slotKey] || null;
}

function saveStoredPhoto(slotKey, dataUrl) {
  memoryPhotos[slotKey] = dataUrl;
  try {
    localStorage.setItem('aniroula_v4_photo_' + slotKey, dataUrl);
  } catch (e) {
    console.warn('localStorage quota reached or unavailable; storing in session memory.', e);
  }
}

function handlePhotoUpload(event, slotKey, refreshBay = false) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    saveStoredPhoto(slotKey, e.target.result);
    syncHeroPortrait();
    renderSitePhotoArchive();
    if (refreshBay) {
      renderCareerBayDetail();
    }
  };
  reader.readAsDataURL(file);
}

function handleFieldBannerUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    saveStoredPhoto('slot_field_banner', e.target.result);
    syncFieldBanner();
  };
  reader.readAsDataURL(file);
}

function syncHeroPortrait() {
  const src = getStoredPhoto('slot_portrait');
  const img = document.getElementById('heroPortraitImg');
  const fallback = document.getElementById('heroPortraitFallback');
  if (!img || !fallback) return;

  if (src) {
    img.src = src;
    img.onload = () => {
      img.classList.remove('hidden');
      fallback.classList.add('hidden');
    };
    img.onerror = () => {
      // If local file not yet placed in assets/images/, show refined CAD placeholder
      img.classList.add('hidden');
      fallback.classList.remove('hidden');
    };
  } else {
    img.classList.add('hidden');
    fallback.classList.remove('hidden');
  }
}

function syncFieldBanner() {
  const src = getStoredPhoto('slot_field_banner');
  const wrap = document.getElementById('fieldBannerContainer');
  const img = document.getElementById('fieldBannerImg');
  if (!wrap || !img) return;

  if (src) {
    img.src = src;
    img.onload = () => {
      wrap.classList.remove('hidden');
    };
    img.onerror = () => {
      wrap.classList.add('hidden');
    };
  } else {
    wrap.classList.add('hidden');
  }
}

function openLightbox(slotKey, caption) {
  const src = getStoredPhoto(slotKey);
  if (!src) return;
  const lightboxImg = document.getElementById('lightboxImageEl');
  const lightboxCap = document.getElementById('lightboxCaptionEl');
  lightboxImg.src = src;
  lightboxCap.textContent = caption || '';
  document.getElementById('siteLightbox').classList.add('open');
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
  if (e.key === 'Escape') {
    closeLightbox();
  }
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
  const photoSrc = getStoredPhoto(bay.photoSlot);

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
          <div class="relative aspect-[4/3] rounded-xl bg-linen border border-hairline overflow-hidden flex items-center justify-center">
            <img id="bayDetailImg" src="${photoSrc || ''}" alt="${bay.photoTitle}" class="w-full h-full object-cover cursor-zoom-in ${photoSrc ? '' : 'hidden'}" onclick="openLightbox('${bay.photoSlot}', '${bay.photoTitle.replace(/'/g, "\\'")}')" />
            <div id="bayDetailFallback" class="text-center p-5 ${photoSrc ? 'hidden' : ''}">
              <div class="font-mono text-xs font-bold text-cerulean">${bay.ds} / ${bay.cb} SITE PHOTO SLOT</div>
              <p class="text-xs text-slate-600 mt-1.5">${bay.photoTitle}</p>
              <p class="text-[10.5px] font-mono text-slate-500 mt-1">Place photo in assets/images/ or attach</p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2.5 pt-3 px-1">
            <span class="text-xs text-slate-600 truncate">
              ${bay.photoTitle}
            </span>
            <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-stone-300 hover:border-cerulean text-ink hover:text-cerulean font-mono text-[11px] font-semibold cursor-pointer flex-shrink-0 transition-colors">
              <span class="text-cerulean font-bold">+</span>
              <span>Attach Photo</span>
              <input type="file" accept="image/*" class="hidden" onchange="handlePhotoUpload(event, '${bay.photoSlot}', true)" />
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach error handler to bay image if the static file is missing
  const imgEl = document.getElementById('bayDetailImg');
  const fallbackEl = document.getElementById('bayDetailFallback');
  if (imgEl && fallbackEl) {
    imgEl.onerror = () => {
      imgEl.classList.add('hidden');
      fallbackEl.classList.remove('hidden');
    };
  }
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
    const pill = document.getElementById(`acad-pill-${id}`);
    const stat = document.getElementById(`acad-stat-${id}`);

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
      if (pill) {
        pill.setAttribute('fill', '#E0F2FE');
        pill.setAttribute('stroke', '#0369A1');
      }
      if (stat) stat.setAttribute('fill', '#0369A1');
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
      if (pill) {
        pill.setAttribute('fill', '#F6F5F0');
        pill.setAttribute('stroke', '#DCD8CD');
      }
      if (stat) stat.setAttribute('fill', '#64748B');
    }
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
        <a href="${NEC_LICENSE_URL}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-cerulean hover:bg-sky-800 text-white text-sm font-semibold shadow-sm transition-all">
          <span>Verify NEC License #1977 Online &nearr;</span>
        </a>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------
   6. SITE PHOTO ARCHIVE
   ------------------------------------------------------------------------- */
function renderSitePhotoArchive() {
  const container = document.getElementById('sitePhotoArchiveList');
  if (!container) return;

  container.innerHTML = ARCHIVE_SLOTS.map(item => {
    const src = getStoredPhoto(item.key);
    const hasImg = Boolean(src);

    return `
      <div class="bg-white/92 backdrop-blur-md border border-hairline rounded-2xl p-4 flex items-center justify-between gap-3.5 shadow-sm">
        <div class="flex items-center gap-3.5 min-w-0">
          ${hasImg
            ? `<img src="${src}" alt="${item.title}" class="w-16 h-12 rounded-lg object-cover border border-hairline cursor-zoom-in flex-shrink-0" onclick="openLightbox('${item.key}', '${item.title.replace(/'/g, "\\'")} — ${item.desc.replace(/'/g, "\\'")}')" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
               <div class="w-16 h-12 rounded-lg bg-alabaster border border-hairline items-center justify-center flex-shrink-0 font-mono text-[11px] font-bold text-cerulean hidden">
                 ${item.label.slice(0, 2)}
               </div>`
            : `<div class="w-16 h-12 rounded-lg bg-alabaster border border-hairline flex items-center justify-center flex-shrink-0 font-mono text-[11px] font-bold text-cerulean">
                ${item.label.slice(0, 2)}
              </div>`
          }
          <div class="min-w-0">
            <div class="font-mono text-[10.5px] font-bold text-amberHv">${item.label}</div>
            <div class="text-[14.5px] font-bold text-ink truncate">${item.title}</div>
            <div class="text-xs text-slate-600 truncate">${item.desc}</div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button type="button" onclick="openLightbox('${item.key}', '${item.title.replace(/'/g, "\\'")} — ${item.desc.replace(/'/g, "\\'")}')" class="px-2.5 py-1.5 rounded-lg bg-alabaster border border-stone-300 hover:border-cerulean hover:text-cerulean font-mono text-[11px] font-semibold text-ink cursor-pointer">View</button>
          <label class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-sky-50 border border-stone-300 hover:border-cerulean text-ink hover:text-cerulean font-mono text-[11px] font-semibold cursor-pointer transition-colors">
            <span class="text-cerulean font-bold">+</span>
            <span>Attach</span>
            <input type="file" accept="image/*" class="hidden" onchange="handlePhotoUpload(event, '${item.key}')" />
          </label>
        </div>
      </div>
    `;
  }).join('');
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
    <div class="font-semibold">Message Prepared for diaryofanish@gmail.com</div>
    <div class="mt-1 text-slate-700">Thank you, ${name}. If your email client does not open automatically, you can also write directly to <a href="mailto:diaryofanish@gmail.com" class="text-cerulean underline font-bold">diaryofanish@gmail.com</a>.</div>
  `;

  const subject = encodeURIComponent(`[aniroula.com.np] ${topic} — ${name} (${org})`);
  const body = encodeURIComponent(`Hello Anish,\n\nName: ${name}\nOrganization: ${org}\nSubject: ${topic}\n\nMessage:\n${msg}\n\n---\nSent via aniroula.com.np portfolio`);
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
  } catch (e) {}
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
function initApp() {
  // Sync External Links
  const overviewNec = document.getElementById('overviewNecLink');
  if (overviewNec) overviewNec.href = NEC_LICENSE_URL;

  const linkedinLink = document.getElementById('contactLinkedinLink');
  if (linkedinLink) linkedinLink.href = LINKEDIN_URL;

  // Initialize Modules
  syncHeroPortrait();
  syncFieldBanner();
  syncSldVisuals();
  renderCareerBayDetail();
  syncAcademicRouteVisuals();
  renderAcademicDetail();
  renderSitePhotoArchive();
  initScrollReveal();
  setupKeyboardNavigation();

  // Read URL Hash or default to overview
  const initialHash = window.location.hash.replace('#', '');
  switchView(VIEW_IDS.includes(initialHash) ? initialHash : 'overview', false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
