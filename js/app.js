/* MeNotch landing — vanilla JS, no dependencies. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ---------- The app's six colour presets (ThemeStore.swift) ---------- */
  const PRESETS = {
    lime:     { accent: '#C8E64A', top: '#C7F55C', bottom: '#52E6C7', blush: '#FF73A8' },
    candy:    { accent: '#FF8CC6', top: '#FFC2E2', bottom: '#FF6FB0', blush: '#FF9E7A' },
    sky:      { accent: '#72C8FF', top: '#B3E8FF', bottom: '#4DA3FF', blush: '#FF8FB8' },
    peach:    { accent: '#FFB079', top: '#FFDA8A', bottom: '#FF7E5F', blush: '#FF6F91' },
    lavender: { accent: '#BBA6FF', top: '#E0D4FF', bottom: '#9A80FF', blush: '#FF8FC7' },
    lemon:    { accent: '#FFE45E', top: '#FFF4A6', bottom: '#FFC93D', blush: '#FF8C7A' },
  };
  let userPreset = PRESETS[store.get('menotch.theme')] ? store.get('menotch.theme') : 'lime';

  function paint(el, name) {
    const p = PRESETS[name] || PRESETS.lime;
    el.style.setProperty('--a', p.accent);
    el.style.setProperty('--eye-top', p.top);
    el.style.setProperty('--eye-bottom', p.bottom);
    el.style.setProperty('--blush', p.blush);
  }

  /* ---------- Face (MascotEyes.swift, redrawn in SVG) ---------- */
  let faceCount = 0;
  function faceSVG(mood) {
    const n = ++faceCount;
    const g = `g${n}`;
    const grad = `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--eye-top)"/><stop offset="1" style="stop-color:var(--eye-bottom)"/></linearGradient>`;
    const st = `fill="none" stroke="url(#${g})" stroke-linecap="round" stroke-linejoin="round"`;
    const star = (cx) => `<path fill="url(#${g})" d="M${cx} 2.5 Q${cx + .9} 7.1 ${cx + 5.5} 8 Q${cx + .9} 8.9 ${cx} 13.5 Q${cx - .9} 8.9 ${cx - 5.5} 8 Q${cx - .9} 7.1 ${cx} 2.5Z"/>`;
    return `<svg class="face" viewBox="0 0 23.5 18" data-mood="${mood}" aria-hidden="true" focusable="false"><defs>${grad}</defs>
      <g class="blush"><ellipse cx="3" cy="14.8" rx="3" ry="1.3" style="fill:var(--blush)"/><ellipse cx="20.5" cy="14.8" rx="3" ry="1.3" style="fill:var(--blush)"/></g>
      <g class="eyes">
        <g class="m m-open"><g class="eye"><rect x="2" y="1.75" width="8" height="12.5" rx="4" fill="url(#${g})"/><circle cx="4.7" cy="4.95" r="1.2" fill="#fff"/></g><g class="eye"><rect x="13.5" y="1.75" width="8" height="12.5" rx="4" fill="url(#${g})"/><circle cx="16.2" cy="4.95" r="1.2" fill="#fff"/></g></g>
        <g class="m m-surprised"><g class="eye"><rect x="1" y="2.5" width="10" height="11" rx="5" fill="url(#${g})"/><circle cx="4" cy="5.6" r="1.3" fill="#fff"/></g><g class="eye"><rect x="12.5" y="2.5" width="10" height="11" rx="5" fill="url(#${g})"/><circle cx="15.5" cy="5.6" r="1.3" fill="#fff"/></g></g>
        <g class="m m-sleepy"><g class="eye"><rect x="1.75" y="8.9" width="8.5" height="3.2" rx="1.6" fill="url(#${g})"/></g><g class="eye"><rect x="13.25" y="8.9" width="8.5" height="3.2" rx="1.6" fill="url(#${g})"/></g></g>
        <g class="m m-happy"><path ${st} stroke-width="2.4" d="M2 10.5 Q6 3 10 10.5"/><path ${st} stroke-width="2.4" d="M13.5 10.5 Q17.5 3 21.5 10.5"/><path ${st} stroke-width="1.6" d="M9 15.2 Q11.75 17.6 14.5 15.2"/></g>
        <g class="m m-squeeze"><path ${st} stroke-width="2.2" d="M3.5 4 L8.5 8 L3.5 12"/><path ${st} stroke-width="2.2" d="M20 4 L15 8 L20 12"/></g>
        <g class="m m-sparkle">${star(6)}${star(17.5)}</g>
      </g>
      <g class="zz"><text x="24" y="7">z</text><text x="27" y="3">z</text><text x="30" y="-1">Z</text></g>
    </svg>`;
  }

  const faces = [];
  $$('.face-slot').forEach((slot) => {
    slot.outerHTML = faceSVG(slot.dataset.mood || 'open').replace('<svg class="face"', `<svg class="face" data-role="${slot.dataset.face}"`);
  });
  $$('svg.face').forEach((f) => faces.push(f));
  const islandFace = $('svg.face[data-role="island"]');
  const islandOpenFace = $('svg.face[data-role="island-open"]');
  const bigFace = $('svg.face[data-role="big"]');

  /* eyes follow the pointer, wherever it is on the page */
  let mx = innerWidth / 2, my = innerHeight / 3, lookQueued = false;
  function look() {
    lookQueued = false;
    for (const f of faces) {
      const r = f.getBoundingClientRect();
      if (r.bottom < -40 || r.top > innerHeight + 40) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const lx = Math.max(-1, Math.min(1, (mx - cx) / (innerWidth * 0.42)));
      const ly = Math.max(-1, Math.min(1, (my - cy) / (innerHeight * 0.5)));
      const eyes = f.querySelector('.eyes');
      eyes.style.transform = `translate(${(lx * 2.6).toFixed(2)}px, ${(ly * 2.2).toFixed(2)}px)`;
    }
  }
  const queueLook = () => { if (!lookQueued) { lookQueued = true; requestAnimationFrame(look); } };
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; queueLook(); wake(); }, { passive: true });
  addEventListener('scroll', queueLook, { passive: true });
  look();

  /* blinking, like Mascot.swift: every 2.2–5.5 s, slower when sleepy */
  function blinkLoop() {
    const wait = 2200 + Math.random() * 3300;
    setTimeout(() => {
      faces.forEach((f) => {
        const m = f.dataset.mood;
        if (m !== 'open' && m !== 'sleepy') return;
        f.dataset.blink = '1';
        setTimeout(() => { f.dataset.blink = '0'; }, m === 'sleepy' ? 320 : 120);
      });
      blinkLoop();
    }, wait);
  }
  if (!reduced) blinkLoop();

  /* ---------- Home tab content (clock, now playing, month, agenda) ---------- */
  const now = new Date();
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  const fmtMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
  const clock = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`; };

  function monthGrid() {
    const y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1).getDay(); // Sunday first, like id_ID
    const days = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const events = new Set([now.getDate(), (now.getDate() + 2) % days || days, (now.getDate() + 5) % days || days, (now.getDate() + 9) % days || days]);
    let cells = ['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((w) => `<span class="wd">${w}</span>`).join('');
    for (let i = first - 1; i >= 0; i--) cells += `<span class="d out">${prevDays - i}</span>`;
    for (let d = 1; d <= days; d++) {
      const cls = ['d', d === now.getDate() ? 'today' : '', events.has(d) && d !== now.getDate() ? 'ev' : ''].join(' ').trim();
      cells += `<span class="${cls}">${d}</span>`;
    }
    const total = first + days, pad = (7 - (total % 7)) % 7;
    for (let d = 1; d <= pad && total + d <= 42; d++) cells += `<span class="d out">${d}</span>`;
    return cells;
  }

  function homeHTML() {
    return `
      <div class="home-left">
        <div><div class="clock t-1" data-clock>${clock()}</div><div class="date t-2">${fmtDate.format(now)}</div></div>
        <div class="np">
          <span class="np__art"></span>
          <span><div class="np__t t-1">Sore di Teras</div><div class="np__a t-2">Nada Kopi</div></span>
          <span class="bars"><i></i><i></i><i></i><i></i></span>
        </div>
      </div>
      <div class="hair"></div>
      <div class="month">
        <div class="month__h"><span class="t-1">${fmtMonth.format(now)}</span><span><span>‹</span><span>›</span></span></div>
        <div class="month__g">${monthGrid()}</div>
      </div>
      <div class="agenda">
        <div class="agenda__h t-1">Hari ini <em>3</em></div>
        <div class="ev"><i></i><div><b>Standup tim</b><span>09.30 – 09.45</span></div></div>
        <div class="ev"><i></i><div><b>Makan siang bareng Dina</b><span>12.00 – 13.00</span></div></div>
        <div class="ev"><i></i><div><b>Review desain</b><span>15.00 – 16.00</span></div></div>
      </div>`;
  }
  $$('[data-home]').forEach((el) => { el.innerHTML = homeHTML(); });
  setInterval(() => $$('[data-clock]').forEach((c) => { c.textContent = clock(); }), 10000);

  /* ---------- The island ---------- */
  const island = $('#island');
  const body = $('#islandBody');
  const peekText = $('#peekText');
  const peekTitle = $('.layer--peek b');
  const peekIcon = $('.layer--peek .peek__icon use');
  const chapters = $$('[data-chapter]');
  let current = null, hover = false, pinnedByTap = false, peekUntil = 0, moodOverride = null, moodTimer = 0;

  const canPinOpen = () => innerWidth >= 1360;
  function baseState() {
    if (hover || pinnedByTap) return 'open';
    if (Date.now() < peekUntil) return 'peek';
    if (current && current.dataset.chapter === 'hero' && canPinOpen() && scrollY < innerHeight * 0.3) return 'open';
    if (current && current.dataset.chapter === 'footer') return 'tucked';
    return 'closed';
  }
  function setFaceMood(m) {
    [islandFace, islandOpenFace].forEach((f) => { if (f) f.dataset.mood = m; });
  }
  function islandMood() {
    if (moodOverride) return moodOverride;
    if (current && current.dataset.chapter === 'mascot') return bigFace.dataset.mood;
    if (current && current.dataset.slot === 'bolt') return 'sparkle';
    return (current && current.dataset.mood) || 'open';
  }
  function render() {
    const state = baseState();
    island.dataset.state = state;
    body.setAttribute('aria-expanded', String(state === 'open'));
    $('.layer--open').setAttribute('aria-hidden', String(state !== 'open'));
    island.dataset.slot = current ? current.dataset.slot : 'none';
    // On narrow screens the open island is scaled to fit.
    island.style.setProperty('--os', state === 'open' && innerWidth < 680 ? ((innerWidth - 12) / 640).toFixed(3) : '1');
    setFaceMood(islandMood());
  }

  function chapterAtTop() {
    const y = 16;
    for (const c of chapters) {
      const r = c.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return c;
    }
    return chapters[0];
  }
  function onScroll() {
    const c = chapterAtTop();
    if (c !== current) {
      current = c;
      paint(island, c.dataset.preset === 'user' ? userPreset : c.dataset.preset);
    }
    render();
  }
  addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  addEventListener('resize', onScroll);

  let openT = 0, closeT = 0;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  body.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(closeT);
    openT = setTimeout(() => { hover = true; render(); }, 100);
  });
  body.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(openT);
    closeT = setTimeout(() => { hover = false; render(); }, 300);
  });
  function poke() {
    moodOverride = 'squeeze';
    clearTimeout(moodTimer);
    render();
    moodTimer = setTimeout(() => { moodOverride = null; render(); }, 700);
  }
  body.addEventListener('click', (e) => {
    if (e.target.closest('svg.face')) { poke(); return; }
    if (!finePointer) { pinnedByTap = !pinnedByTap; render(); }
  });
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinnedByTap = !pinnedByTap; render(); }
    if (e.key === 'Escape') { pinnedByTap = false; hover = false; render(); }
  });
  document.addEventListener('pointerdown', (e) => {
    if (pinnedByTap && !body.contains(e.target)) { pinnedByTap = false; render(); }
  });

  function showPeek(title, text, icon) {
    peekTitle.textContent = title;
    peekText.textContent = text;
    peekIcon.setAttribute('href', `#${icon}`);
    peekUntil = Date.now() + 2600;
    moodOverride = 'happy';
    clearTimeout(moodTimer);
    render();
    moodTimer = setTimeout(() => { moodOverride = null; render(); }, 2600);
  }

  // Copying anything on the page shows the real "Disalin" peek.
  document.addEventListener('copy', () => {
    const t = String(getSelection() || '').replace(/\s+/g, ' ').trim();
    if (t) showPeek('Disalin', t.length > 60 ? `${t.slice(0, 60)}…` : t, 'i-copy');
  });
  // Dragging a file over the page opens the shelf peek, like the app.
  document.addEventListener('dragenter', (e) => {
    if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) showPeek('Lepaskan untuk menambahkan', 'Rak terbuka saat kamu menyeret file', 'i-tray');
  });

  // Going quiet for 45 s makes the face sleepy (Mascot.sleepAfter).
  let idleT = 0;
  function wake() {
    if (moodOverride === 'sleepy') { moodOverride = null; render(); }
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (!moodOverride) { moodOverride = 'sleepy'; render(); } }, 45000);
  }
  addEventListener('scroll', wake, { passive: true });
  wake();

  // A demo peek once the endless rows are on screen (the heading has passed by then).
  const firstRail = $('.rail');
  if (firstRail && 'IntersectionObserver' in window) {
    const pio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && firstRail.getBoundingClientRect().top < innerHeight * 0.5) {
        showPeek('Disalin', 'Psst, coba salin teks di halaman ini', 'i-copy');
        pio.disconnect();
      }
    }, { threshold: [0.5, 0.8, 1] });
    pio.observe(firstRail);
  }

  /* focus countdown shown in the closed island */
  let remain = 24 * 60 + 59;
  const ringFg = $('#ringFg');
  const pillTimer = $('#pillTimer');
  setInterval(() => {
    remain = remain > 0 ? remain - 1 : 25 * 60;
    pillTimer.textContent = `${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, '0')}`;
    ringFg.style.strokeDashoffset = (28.9 * (1 - remain / 1500)).toFixed(2);
  }, 1000);

  /* ---------- The mascot chapter: moods and colour presets ---------- */
  const bigStage = $('#bigStage');
  const moodBtns = $$('#moods .chip');
  let chosenMood = 'open';
  function setBigMood(m) {
    chosenMood = m;
    bigFace.dataset.mood = m;
    moodBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mood === m)));
    render();
  }
  moodBtns.forEach((b) => b.addEventListener('click', () => setBigMood(b.dataset.mood)));
  let bigPokeT = 0;
  bigStage.addEventListener('click', () => {
    const back = chosenMood;
    bigFace.dataset.mood = 'squeeze';
    bigFace.dataset.blush = '1';
    clearTimeout(bigPokeT);
    render();
    bigPokeT = setTimeout(() => { bigFace.dataset.mood = back; bigFace.dataset.blush = '0'; render(); }, 700);
  });
  bigStage.addEventListener('pointerenter', () => { bigFace.dataset.blush = '1'; });
  bigStage.addEventListener('pointerleave', () => { bigFace.dataset.blush = '0'; });

  const themeBtns = $$('#themes .chip');
  function applyUser(name) {
    userPreset = name;
    store.set('menotch.theme', name);
    themeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === name)));
    $$('[data-preset="user"]').forEach((sec) => paint(sec, name));
    if (current && current.dataset.preset === 'user') paint(island, name);
  }
  themeBtns.forEach((b) => b.addEventListener('click', () => applyUser(b.dataset.theme)));

  // Fixed-colour chapters paint their own fragments; black chapters follow the visitor's pick.
  chapters.forEach((c) => paint(c, c.dataset.preset === 'user' ? userPreset : c.dataset.preset));
  $$('.mini').forEach((m) => { if (!m.style.getPropertyValue('--a')) paint(m, 'lime'); else { const a = m.style.getPropertyValue('--a'); paint(m, 'lime'); m.style.setProperty('--a', a); } });
  paint($('.welcome'), 'lime');
  applyUser(userPreset);

  /* ---------- Five tabs showcase ---------- */
  const TABS = {
    home: { i: 0, desc: 'Jam, lagu yang sedang diputar, dan agenda hari ini. Semua dalam sekali lirik.', facts: ['Lagu dari Spotify, Apple Music, YouTube, dan lainnya', 'Ketuk tanggal, lihat acaranya', 'Kalendermu tetap di Mac-mu'] },
    focus: { i: 1, desc: 'Pomodoro yang tidak ribet. Atur waktu, tekan mulai, kerjakan satu hal dulu.', facts: ['Hitung mundur tetap terlihat saat notch tertutup', 'Geser penggaris untuk atur menit atau detik', 'Daftar tugas kecil untuk hari ini'] },
    prompt: { i: 2, desc: 'Teleprompter tepat di bawah kamera. Kamu membaca, penonton mengira kamu hafal.', facts: ['Atur kecepatan gulir sesukamu', 'Tidak ikut terlihat saat share screen', 'Simpan beberapa naskah sekaligus'] },
    shelf: { i: 4, desc: 'Tempat titip file sementara. Seret ke notch, ambil lagi kapan saja.', facts: ['Terbuka sendiri saat kamu menyeret file', 'Disimpan 1 jam, lalu dibereskan otomatis', 'Kirim semuanya lewat AirDrop'] },
    clip: { i: 3, desc: 'Riwayat salinan yang tahu diri. Muncul sebentar, lalu bersih sendiri.', facts: ['Klik untuk menyalin ulang teks atau gambar', 'Terhapus otomatis setelah 5 menit', 'Password tidak pernah disimpan'] },
  };
  const tabBtns = $$('#tabNames [role="tab"]');
  const keys = tabBtns.map((b) => b.dataset.panel);
  const pin = $('#tab');
  const stage = $('.show__stage');
  const frag = $('#frag');
  const fragTabs = $$('#fragTabs .tab');
  const bar = $('#tabProgress');
  // What the closed island shows while each tab is on screen.
  const SLOT = { home: 'bars', focus: 'timer', prompt: 'none', shelf: 'tray', clip: 'none' };
  let activeKey = 'home', swapT = 0;

  function selectTab(key, dir = 1) {
    const t = TABS[key];
    if (!t || key === activeKey) return;
    activeKey = key;
    tabBtns.forEach((b) => {
      const on = b.dataset.panel === key;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    pin.dataset.slot = SLOT[key];
    render();
    const swap = () => {
      $$('.panel', frag).forEach((p) => p.classList.toggle('is-on', p.id === `p-${key}`));
      fragTabs.forEach((el, i) => el.classList.toggle('is-on', i === t.i));
      $('#tabDesc').textContent = t.desc;
      $('#tabFacts').innerHTML = t.facts.map((f) => `<li>${f}</li>`).join('');
    };
    if (reduced) { swap(); return; }
    // old content leaves in the scroll direction, new content arrives from the other side
    stage.style.setProperty('--dir', dir);
    stage.classList.remove('is-in');
    stage.classList.add('is-out');
    clearTimeout(swapT);
    swapT = setTimeout(() => {
      swap();
      stage.classList.remove('is-out');
      stage.classList.add('is-in');
      void stage.offsetWidth;
      requestAnimationFrame(() => stage.classList.remove('is-in'));
    }, 180);
  }

  // Scroll position inside the pinned section picks the tab: down = next, up = previous.
  const pinRange = () => pin.offsetHeight - innerHeight;
  function pinProgress() {
    const r = pin.getBoundingClientRect();
    return Math.max(0, Math.min(1, -r.top / Math.max(1, pinRange())));
  }
  function onPinScroll() {
    const p = pinProgress();
    bar.style.transform = `scaleX(${p.toFixed(3)})`;
    const i = Math.min(keys.length - 1, Math.floor(p * keys.length));
    const cur = keys.indexOf(activeKey);
    if (i !== cur) selectTab(keys[i], i > cur ? 1 : -1);
  }
  addEventListener('scroll', () => requestAnimationFrame(onPinScroll), { passive: true });
  addEventListener('resize', onPinScroll);

  // Clicking a name (or a footer link) scrolls to that tab's stretch of the section.
  function scrollToTab(key) {
    const i = keys.indexOf(key);
    if (i < 0) return;
    const top = pin.getBoundingClientRect().top + scrollY + pinRange() * ((i + 0.5) / keys.length);
    scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  }
  tabBtns.forEach((b, i) => {
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener('click', () => scrollToTab(b.dataset.panel));
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const next = tabBtns[(i + d + tabBtns.length) % tabBtns.length];
      next.focus();
      scrollToTab(next.dataset.panel);
    });
  });
  $$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollToTab(a.dataset.go); }));
  onPinScroll();

  /* ---------- Endless rows of moments ---------- */
  let lastY = scrollY, lastT = performance.now(), scrollV = 0, scrollDir = 1;
  addEventListener('scroll', () => {
    const t = performance.now(), dy = scrollY - lastY, dt = Math.max(16, t - lastT);
    scrollV = dy / dt * 1000; // px per second
    if (Math.abs(dy) > 1) scrollDir = dy > 0 ? 1 : -1;
    lastY = scrollY; lastT = t;
  }, { passive: true });

  $$('.rail').forEach((rail) => {
    const track = $('.track', rail);
    const dir = Number(rail.dataset.dir) || -1;
    [...track.children].forEach((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); });
    // Faces inside the clones need their own gradient ids.
    $$('svg.face', track).slice(track.children.length / 2 * 0).forEach((f) => {
      if (!f.closest('[aria-hidden="true"]')) return;
      const mood = f.dataset.mood;
      const tmp = document.createElement('span');
      tmp.innerHTML = faceSVG(mood);
      const nf = tmp.firstElementChild;
      f.replaceWith(nf);
      faces.push(nf);
    });

    let x = 0, speed = 0, visible = false, dragging = false, px = 0, dragV = 0, last = performance.now();
    const half = () => track.scrollWidth / 2;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(rail);

    rail.addEventListener('pointerdown', (e) => {
      dragging = true; px = e.clientX; dragV = 0;
      rail.setPointerCapture(e.pointerId);
      rail.classList.add('is-drag');
    });
    rail.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - px; px = e.clientX;
      x += dx; dragV = dx * 60;
    });
    const end = () => { if (!dragging) return; dragging = false; speed = dragV; rail.classList.remove('is-drag'); };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);

    function frame(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (visible) {
        if (!dragging) {
          const base = reduced ? 0 : 36;
          const boost = reduced ? 0 : Math.min(1400, Math.abs(scrollV) * 0.55);
          const target = dir * scrollDir * (base + boost);
          speed += (target - speed) * Math.min(1, dt * 3);
          x += speed * dt;
        }
        const h = half();
        if (h > 0) { x %= h; if (x > 0) x -= h; }
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      }
      scrollV *= Math.pow(0.04, dt); // fade the scroll boost
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });

  /* ---------- Entrances, once per element ---------- */
  const rises = $$('.rise');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rises.forEach((r) => io.observe(r));
    const sweep = () => { for (const r of rises) if (!r.classList.contains('in') && r.getBoundingClientRect().top < innerHeight) r.classList.add('in'); };
    addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
    sweep();
  } else {
    rises.forEach((r) => r.classList.add('in'));
  }

  /* ---------- The notch photograph settles as it scrolls through ---------- */
  const beforeImg = $('#beforeImg');
  if (beforeImg && !reduced) {
    const drift = () => {
      const r = beforeImg.parentElement.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - (r.top + r.height) / (innerHeight + r.height)));
      beforeImg.style.transform = `scale(${(1.14 - p * 0.14).toFixed(4)}) translateY(${(-p * 3).toFixed(2)}%)`;
    };
    addEventListener('scroll', () => requestAnimationFrame(drift), { passive: true });
    drift();
  }

  /* ---------- Footer wordmark fitted to the content width ---------- */
  const fname = $('.foot__name span');
  function fitName() {
    if (!fname) return;
    const box = fname.parentElement;
    fname.style.fontSize = '100px';
    const w = fname.scrollWidth;
    const size = Math.floor(100 * box.clientWidth / w * 0.995);
    box.style.setProperty('--fn', `${size}px`);
    fname.style.fontSize = '';
  }
  addEventListener('resize', fitName);
  document.fonts && document.fonts.ready.then(fitName);
  fitName();

  onScroll();
})();
