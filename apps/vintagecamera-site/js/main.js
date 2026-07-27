(() => {
  const TEMPLATE = 'images/template.png';

  // Те же look-фильтры, что в приложении
  const filters = [
    { id: 'look_original_clear', label: 'Original', overlay: null, opacity: 0, blend: 'screen', swatch: null },
    { id: 'look_edge_decay', label: 'Edge Decay', overlay: 'images/filters/edge_decay.png', opacity: 0.72, blend: 'screen' },
    { id: 'look_flare_burn', label: 'Flare Burn', overlay: 'images/filters/flare_burn.png', opacity: 0.78, blend: 'screen' },
    { id: 'look_strip_burn', label: 'Strip Burn', overlay: 'images/filters/strip_burn.png', opacity: 0.42, blend: 'soft-light' },
    { id: 'look_prism_leak', label: 'Prism Leak', overlay: 'images/filters/prism_leak.png', opacity: 0.7, blend: 'screen' },
    { id: 'look_gate_weave', label: 'Gate Weave', overlay: 'images/filters/gate_weave.png', opacity: 0.62, blend: 'screen' },
    { id: 'look_ruby_grit', label: 'Ruby Grit', overlay: 'images/filters/ruby_grit.png', opacity: 0.75, blend: 'screen' },
    { id: 'look_violet_grit', label: 'Violet Grit', overlay: 'images/filters/violet_grit.png', opacity: 0.7, blend: 'screen' },
    { id: 'look_mono_fog', label: 'Mono Fog', overlay: 'images/filters/mono_fog.png', opacity: 0.68, blend: 'screen' },
    { id: 'look_hairline', label: 'Hairline', overlay: 'images/filters/hairline.png', opacity: 0.8, blend: 'screen' },
    { id: 'look_field_leak', label: 'Field Leak', overlay: 'images/filters/field_leak.png', opacity: 0.48, blend: 'soft-light' }
  ];

  const frames = [
    { id: 'none', label: 'None' },
    { id: 'cool_instant', label: 'Cool Instant' },
    { id: 'sun_chrome', label: 'Sun Chrome' }
  ];

  const state = {
    filterId: 'look_original_clear',
    frame: 'cool_instant',
    sourceMode: 'image',
    stream: null
  };

  const overlayCache = {};
  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: false }) : null;
  const video = document.getElementById('cameraVideo');
  const image = new Image();
  image.crossOrigin = 'anonymous';

  let rafId = 0;

  function preloadOverlays() {
    filters.forEach(filter => {
      if (!filter.overlay) return;
      const img = new Image();
      img.src = filter.overlay;
      overlayCache[filter.id] = img;
    });
  }

  function buildWall() {
    const track = document.getElementById('wallTrack');
    if (!track) return;
    // Стена галереи — шаблон + остальные сэмплы для атмосферы
    const wallSources = [
      TEMPLATE,
      ...Array.from({ length: 12 }, (_, i) => `images/sample-${String(i + 1).padStart(2, '0')}.png`)
    ];
    const stamps = ['11:23', '11:47', '11:22', '12:04', '09:18', '18:41'];
    const items = [...wallSources, ...wallSources];
    track.innerHTML = items.map((src, index) => `
      <figure class="wall-card">
        <img src="${src}" alt="Film sample ${index + 1}" loading="lazy" />
        <figcaption>2026 / 07 / 24  ${stamps[index % stamps.length]}</figcaption>
      </figure>
    `).join('');
  }

  const SLOT_SCALES = [0.64, 0.84, 1.14, 0.84, 0.64];

  function accordionSlots() {
    const selectedIndex = Math.max(0, filters.findIndex(f => f.id === state.filterId));
    const centerSlot = 2;
    return SLOT_SCALES.map((scale, slot) => {
      const filterIndex = (selectedIndex - centerSlot + slot + filters.length) % filters.length;
      return { filter: filters[filterIndex], scale, isCenter: slot === centerSlot };
    });
  }

  function buildFilters() {
    const root = document.getElementById('filterRail');
    if (!root) return;
    const slots = accordionSlots();
    root.innerHTML = slots.map(({ filter, scale, isCenter }) => {
      const swatch = filter.overlay
        ? `<img src="${filter.overlay}" alt="" />`
        : '';
      return `
        <button type="button"
          class="filter-chip${isCenter ? ' is-center' : ''}"
          data-id="${filter.id}"
          style="--slot-scale:${scale};"
          aria-pressed="${isCenter}">
          <span class="filter-swatch${filter.overlay ? '' : ' original'}">${swatch}</span>
          <span class="label">${filter.label}</span>
        </button>
      `;
    }).join('');

    root.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.dataset.id === state.filterId) return;
        state.filterId = chip.dataset.id;
        buildFilters();
        if (state.sourceMode !== 'camera') renderFrame();
      });
    });
  }

  function buildFrames() {
    const root = document.getElementById('frameRail');
    if (!root) return;
    root.innerHTML = frames.map(frame => {
      let swatch = '<span class="frame-swatch none"></span>';
      if (frame.id === 'cool_instant') {
        swatch = '<span class="frame-swatch polaroid"></span>';
      } else if (frame.id === 'sun_chrome') {
        swatch = `
          <span class="frame-swatch film35">
            <span class="sprocket-mini"></span>
            <span class="film-mid"></span>
            <span class="sprocket-mini"></span>
          </span>
        `;
      }
      return `
        <button type="button" class="frame-chip${frame.id === state.frame ? ' active' : ''}" data-id="${frame.id}">
          ${swatch}
          <span class="label">${frame.label}</span>
        </button>
      `;
    }).join('');

    root.querySelectorAll('.frame-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        root.querySelectorAll('.frame-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.frame = chip.dataset.id;
        if (state.sourceMode !== 'camera') renderFrame();
      });
    });
  }

  function setSourceActive(which) {
    document.getElementById('btnUpload')?.classList.toggle('active', which === 'upload');
    document.getElementById('btnCamera')?.classList.toggle('active', which === 'camera');
    document.getElementById('btnSample')?.classList.toggle('active', which === 'sample');
  }

  function loadImage(src) {
    state.sourceMode = 'image';
    image.onload = () => renderFrame();
    image.src = src;
  }

  async function startCamera() {
    try {
      if (state.stream) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      });
      state.stream = stream;
      state.sourceMode = 'camera';
      video.srcObject = stream;
      await video.play();
      setSourceActive('camera');
      loopCamera();
    } catch (error) {
      alert('Camera access was denied or is unavailable in this browser.');
    }
  }

  function stopCamera() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      state.stream = null;
    }
    video.srcObject = null;
  }

  function loopCamera() {
    if (state.sourceMode !== 'camera') return;
    renderFrame();
    rafId = requestAnimationFrame(loopCamera);
  }

  function frameInsets() {
    const { width, height } = canvas;
    if (state.frame === 'cool_instant') {
      return {
        t: Math.max(12, height * 0.05),
        r: Math.max(12, width * 0.06),
        b: Math.max(42, height * 0.16),
        l: Math.max(12, width * 0.06)
      };
    }
    // Sun Chrome: плёнка поверх фото — кадр на весь холст
    return { t: 0, r: 0, b: 0, l: 0 };
  }

  function polaroidStampText() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()} / ${pad(d.getMonth() + 1)} / ${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function drawCoverInto(source, sw, sh, inset, mirrorX = false) {
    const cw = canvas.width - inset.l - inset.r;
    const ch = canvas.height - inset.t - inset.b;
    const scale = Math.max(cw / sw, ch / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = inset.l + (cw - dw) / 2;
    const dy = inset.t + (ch - dh) / 2;
    if (mirrorX) {
      // Снимаем зеркало с фронтальной камеры браузера
      ctx.save();
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(source, 0, 0, dw, dh);
      ctx.restore();
      return;
    }
    ctx.drawImage(source, dx, dy, dw, dh);
  }

  function currentFilter() {
    return filters.find(f => f.id === state.filterId) || filters[0];
  }

  function drawFilterOverlay(inset) {
    const filter = currentFilter();
    if (!filter.overlay) return;
    const overlay = overlayCache[filter.id];
    if (!overlay || !overlay.complete || !overlay.naturalWidth) return;

    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    ctx.save();
    ctx.globalAlpha = filter.opacity;
    ctx.globalCompositeOperation = filter.blend;
    ctx.drawImage(overlay, x, y, w, h);
    ctx.restore();
  }

  function drawCoolInstantFrame() {
    const { width, height } = canvas;
    const inset = frameInsets();
    ctx.fillStyle = '#f3ebe0';
    ctx.fillRect(0, 0, width, inset.t);
    ctx.fillRect(0, 0, inset.l, height);
    ctx.fillRect(width - inset.r, 0, inset.r, height);
    ctx.fillRect(0, height - inset.b, width, inset.b);

    // Лёгкая «бумажная» тень по внутреннему краю
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      inset.l + 1,
      inset.t + 1,
      width - inset.l - inset.r - 2,
      height - inset.t - inset.b - 2
    );
    ctx.restore();

    // Актуальная дата/время — как на Polaroid в приложении
    const stamp = polaroidStampText();
    const stampFont = Math.max(14, width * 0.032);
    ctx.save();
    ctx.fillStyle = '#2a231c';
    ctx.font = `600 ${stampFont}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    const stampX = width - inset.r - 4;
    const stampY = height - Math.max(12, inset.b * 0.34);
    ctx.fillText(stamp, stampX, stampY);
    ctx.restore();
  }

  function drawFilmStripWithHoles(bandTop, edge, holeW, holeH, pitch) {
    const { width } = canvas;
    const originY = bandTop + (edge - holeH) * 0.5;

    // Полоса плёнки с вырезанными дырками — сквозь них видно фото
    ctx.beginPath();
    ctx.rect(0, bandTop, width, edge);
    for (let x = 10; x < width - 8; x += pitch) {
      roundRect(ctx, x, originY, holeW, holeH, 2.2);
    }
    const stripGrad = ctx.createLinearGradient(0, bandTop, 0, bandTop + edge);
    stripGrad.addColorStop(0, '#1c1814');
    stripGrad.addColorStop(0.5, '#151311');
    stripGrad.addColorStop(1, '#0f0d0b');
    ctx.fillStyle = stripGrad;
    ctx.fill('evenodd');

    // Лёгкий ободок дырок
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (let x = 10; x < width - 8; x += pitch) {
      roundRect(ctx, x, originY, holeW, holeH, 2.2);
      ctx.stroke();
    }
  }

  function drawSunChromeFrame() {
    const { width, height } = canvas;
    const edge = Math.max(28, height * 0.085);
    const holeH = Math.max(8, edge * 0.38);
    const holeW = holeH * 1.35;
    const gap = holeW * 0.42;
    const pitch = holeW + gap;

    // Плёнка поверх полного кадра; в перфорации видно изображение
    drawFilmStripWithHoles(0, edge, holeW, holeH, pitch);
    drawFilmStripWithHoles(height - edge, edge, holeW, holeH, pitch);

    ctx.fillStyle = 'rgba(224, 191, 132, 0.72)';
    ctx.font = '600 13px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('KEY 22', 18, edge - 8);
    ctx.fillText('→23A', width * 0.38, edge - 8);
    ctx.fillText('KEY 22', 18, height - 10);
    ctx.fillText('→23A', width * 0.38, height - 10);

    ctx.fillStyle = 'rgba(224, 191, 132, 0.45)';
    const barY = height - edge * 0.42;
    for (let i = 0; i < 18; i++) {
      const bw = i % 3 === 0 ? 2 : 1;
      ctx.fillRect(width * 0.5 - 40 + i * 4.5, barY, bw, 10);
    }
  }

  function roundRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function renderFrame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const inset = frameInsets();

    ctx.save();
    ctx.beginPath();
    ctx.rect(inset.l, inset.t, canvas.width - inset.l - inset.r, canvas.height - inset.t - inset.b);
    ctx.clip();

    if (state.sourceMode === 'camera' && video && video.readyState >= 2) {
      // Фронтальная камера в браузере часто зеркалит кадр — снимаем отражение
      const facing = state.stream?.getVideoTracks?.()[0]?.getSettings?.().facingMode;
      const unmirror = facing !== 'environment';
      drawCoverInto(
        video,
        video.videoWidth || 1280,
        video.videoHeight || 720,
        inset,
        unmirror
      );
    } else if (image.complete && image.naturalWidth) {
      drawCoverInto(image, image.naturalWidth, image.naturalHeight, inset);
    }

    drawFilterOverlay(inset);
    ctx.restore();

    if (state.frame === 'cool_instant') drawCoolInstantFrame();
    if (state.frame === 'sun_chrome') drawSunChromeFrame();
  }

  function bindUI() {
    buildWall();
    if (!canvas || !ctx) return;

    preloadOverlays();
    buildFilters();
    buildFrames();

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnUpload')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      stopCamera();
      setSourceActive('upload');
      loadImage(URL.createObjectURL(file));
    });

    document.getElementById('btnSample')?.addEventListener('click', () => {
      stopCamera();
      setSourceActive('sample');
      loadImage(TEMPLATE);
    });

    document.getElementById('btnCamera')?.addEventListener('click', () => {
      if (state.sourceMode === 'camera' && state.stream) {
        stopCamera();
        setSourceActive('sample');
        loadImage(TEMPLATE);
        return;
      }
      startCamera();
    });

    setSourceActive('sample');

    // Перерисовка когда оверлеи догрузятся
    filters.forEach(filter => {
      if (!filter.overlay) return;
      const img = overlayCache[filter.id];
      if (img) {
        img.onload = () => {
          if (state.sourceMode !== 'camera') renderFrame();
        };
      }
    });

    loadImage(TEMPLATE);
  }

  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');

  function updateScrollEffects() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${amount * 100}%`;
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }

  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  updateScrollEffects();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  window.addEventListener('pagehide', stopCamera);
  bindUI();
})();
