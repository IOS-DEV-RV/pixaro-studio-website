(() => {
  const SAMPLE_COUNT = 13;
  const samples = Array.from({ length: SAMPLE_COUNT }, (_, i) =>
    `images/sample-${String(i + 1).padStart(2, '0')}.png`
  );

  const looks = [
    { id: 'original', label: 'Original' },
    { id: 'warm', label: 'Warm Film' },
    { id: 'flare', label: 'Flare Burn' },
    { id: 'ruby', label: 'Ruby Grit' },
    { id: 'mono', label: 'Mono' },
    { id: 'faded', label: 'Faded' }
  ];

  const frames = [
    { id: 'none', label: 'None' },
    { id: 'polaroid', label: 'Polaroid' },
    { id: 'film35', label: '35mm' },
    { id: 'matte', label: 'Matte' }
  ];

  const state = {
    look: 'warm',
    frame: 'polaroid',
    grain: 45,
    vignette: 40,
    leak: 35,
    grid: true,
    stamp: true,
    caption: 'City, Country',
    sourceMode: 'image',
    stream: null
  };

  const canvas = document.getElementById('previewCanvas');
  const ctx = canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
  const video = document.getElementById('cameraVideo');
  const image = new Image();
  image.crossOrigin = 'anonymous';

  let rafId = 0;
  let grainNoise = null;
  let cameraTick = 0;

  function buildWall() {
    const track = document.getElementById('wallTrack');
    if (!track) return;
    const stamps = ['11:23', '11:47', '11:22', '12:04', '09:18', '18:41'];
    const items = [...samples, ...samples];
    track.innerHTML = items.map((src, index) => `
      <figure class="wall-card">
        <img src="${src}" alt="Film sample ${index + 1}" loading="lazy" />
        <figcaption>2026 / 07 / 24  ${stamps[index % stamps.length]}</figcaption>
      </figure>
    `).join('');
  }

  function buildChips(containerId, items, activeId, onPick) {
    const root = document.getElementById(containerId);
    if (!root) return;
    root.innerHTML = items.map(item => `
      <button type="button" class="chip${item.id === activeId ? ' active' : ''}" data-id="${item.id}">
        ${item.label}
      </button>
    `).join('');
    root.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        root.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        onPick(chip.dataset.id);
        renderFrame();
      });
    });
  }

  function buildSamples() {
    const root = document.getElementById('samplePick');
    if (!root) return;
    root.innerHTML = samples.slice(0, 8).map((src, index) => `
      <img class="sample-thumb${index === 0 ? ' active' : ''}" src="${src}" data-src="${src}" alt="Sample ${index + 1}" />
    `).join('');
    root.querySelectorAll('.sample-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        root.querySelectorAll('.sample-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        stopCamera();
        loadImage(thumb.dataset.src);
      });
    });
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
      document.getElementById('btnCamera')?.classList.add('active');
      document.getElementById('btnUpload')?.classList.remove('active');
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
    document.getElementById('btnCamera')?.classList.remove('active');
  }

  function loopCamera() {
    if (state.sourceMode !== 'camera') return;
    renderFrame();
    rafId = requestAnimationFrame(loopCamera);
  }

  function ensureGrain() {
    if (grainNoise) return;
    const size = 128;
    const g = document.createElement('canvas');
    g.width = size;
    g.height = size;
    const gctx = g.getContext('2d');
    const data = gctx.createImageData(size, size);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.random() * 255;
      data.data[i] = v;
      data.data[i + 1] = v;
      data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    gctx.putImageData(data, 0, 0);
    grainNoise = g;
  }

  function lookFilterCss() {
    switch (state.look) {
      case 'warm': return 'sepia(0.22) saturate(1.15) contrast(1.05) brightness(1.03)';
      case 'flare': return 'sepia(0.35) saturate(1.35) contrast(1.1) brightness(1.08)';
      case 'ruby': return 'hue-rotate(-12deg) saturate(1.25) contrast(1.08)';
      case 'mono': return 'grayscale(1) contrast(1.1)';
      case 'faded': return 'saturate(0.7) contrast(0.9) brightness(1.08)';
      default: return 'none';
    }
  }

  function drawStamp() {
    if (!state.stamp) return;
    const text = (state.caption || '').trim();
    if (!text) return;
    ctx.save();
    ctx.fillStyle = state.frame === 'polaroid' ? '#2a231c' : '#ff8a3d';
    ctx.font = '500 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'right';
    const x = canvas.width - (state.frame === 'polaroid' ? 36 : 28);
    const y = canvas.height - (state.frame === 'polaroid' ? 34 : 42);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawFrameChrome() {
    const { width, height } = canvas;
    if (state.frame === 'none') return;

    if (state.frame === 'polaroid') {
      const inset = 28;
      const bottom = 78;
      ctx.fillStyle = '#f3ebe0';
      ctx.fillRect(0, 0, width, inset);
      ctx.fillRect(0, 0, inset, height);
      ctx.fillRect(width - inset, 0, inset, height);
      ctx.fillRect(0, height - bottom, width, bottom);
      return;
    }

    if (state.frame === 'matte') {
      const border = 36;
      ctx.fillStyle = '#111010';
      ctx.fillRect(0, 0, width, border);
      ctx.fillRect(0, height - border, width, border);
      ctx.fillRect(0, 0, border, height);
      ctx.fillRect(width - border, 0, border, height);
      return;
    }

    if (state.frame === 'film35') {
      const strip = 54;
      ctx.fillStyle = '#151311';
      ctx.fillRect(0, 0, width, strip);
      ctx.fillRect(0, height - strip, width, strip);
      ctx.fillStyle = '#2a241c';
      const holeW = 18;
      const holeH = 22;
      const gap = 18;
      for (let x = 16; x < width - 16; x += holeW + gap) {
        ctx.fillRect(x, 14, holeW, holeH);
        ctx.fillRect(x, height - 14 - holeH, holeW, holeH);
      }
      ctx.fillStyle = 'rgba(196,162,106,0.55)';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('22  →23A  KEY 22', 20, 48);
      ctx.fillText('22  →23A  KEY 22', 20, height - 18);
    }
  }

  function renderFrame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const insetMap = {
      none: { t: 0, r: 0, b: 0, l: 0 },
      polaroid: { t: 28, r: 28, b: 78, l: 28 },
      matte: { t: 36, r: 36, b: 36, l: 36 },
      film35: { t: 54, r: 0, b: 54, l: 0 }
    };
    const inset = insetMap[state.frame] || insetMap.none;
    const live = state.sourceMode === 'camera';

    ctx.save();
    ctx.beginPath();
    ctx.rect(inset.l, inset.t, canvas.width - inset.l - inset.r, canvas.height - inset.t - inset.b);
    ctx.clip();

    if (live) ctx.filter = lookFilterCss();

    if (live && video && video.readyState >= 2) {
      drawCoverInto(video, video.videoWidth || 1280, video.videoHeight || 720, inset);
    } else if (image.complete && image.naturalWidth) {
      drawCoverInto(image, image.naturalWidth, image.naturalHeight, inset);
    }

    ctx.filter = 'none';

    if (!live) {
      applyLookRegion(inset);
    }

    drawVignetteRegion(inset);
    // Grain every other camera frame for smoother live preview
    cameraTick += 1;
    if (!live || cameraTick % 2 === 0) drawGrainRegion(inset);
    drawLeakRegion(inset);
    drawGridRegion(inset);
    ctx.restore();

    drawFrameChrome();
    drawStamp();
  }

  function drawCoverInto(source, sw, sh, inset) {
    const cw = canvas.width - inset.l - inset.r;
    const ch = canvas.height - inset.t - inset.b;
    const scale = Math.max(cw / sw, ch / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = inset.l + (cw - dw) / 2;
    const dy = inset.t + (ch - dh) / 2;
    ctx.drawImage(source, dx, dy, dw, dh);
  }

  function applyLookRegion(inset) {
    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    if (w <= 0 || h <= 0) return;
    const img = ctx.getImageData(x, y, w, h);
    const d = img.data;
    const look = state.look;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      if (look === 'warm') {
        r = Math.min(255, r * 1.08 + 12);
        g = Math.min(255, g * 1.02 + 4);
        b = b * 0.9;
      } else if (look === 'flare') {
        r = Math.min(255, r * 1.15 + 18);
        g = Math.min(255, g * 1.05 + 8);
        b = b * 0.82;
      } else if (look === 'ruby') {
        r = Math.min(255, r * 1.12 + 8);
        g = g * 0.88;
        b = Math.min(255, b * 1.05 + 10);
      } else if (look === 'mono') {
        const yy = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = yy;
      } else if (look === 'faded') {
        r = r * 0.85 + 40;
        g = g * 0.85 + 36;
        b = b * 0.85 + 32;
      }
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
    ctx.putImageData(img, x, y);
  }

  function drawVignetteRegion(inset) {
    const strength = state.vignette / 100;
    if (strength <= 0.01) return;
    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.22, x + w / 2, y + h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${0.75 * strength})`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  function drawGrainRegion(inset) {
    const amount = state.grain / 100;
    if (amount <= 0.01) return;
    ensureGrain();
    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    ctx.save();
    ctx.globalAlpha = 0.12 + amount * 0.28;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(grainNoise, x, y, w, h);
    ctx.restore();
  }

  function drawLeakRegion(inset) {
    const amount = state.leak / 100;
    if (amount <= 0.01) return;
    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    const grad = ctx.createLinearGradient(x + w * 0.65, y, x + w, y + h);
    grad.addColorStop(0, 'rgba(255,120,40,0)');
    grad.addColorStop(0.55, `rgba(255,90,40,${0.18 * amount})`);
    grad.addColorStop(1, `rgba(255,60,80,${0.42 * amount})`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  function drawGridRegion(inset) {
    if (!state.grid) return;
    const x = inset.l;
    const y = inset.t;
    const w = canvas.width - inset.l - inset.r;
    const h = canvas.height - inset.t - inset.b;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const gx = x + (w / 3) * i;
      const gy = y + (h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Wire UI
  function bindUI() {
    buildWall();
    if (!canvas || !ctx) return;

    buildSamples();
    buildChips('lookChips', looks, state.look, id => { state.look = id; });
    buildChips('frameChips', frames, state.frame, id => { state.frame = id; });

    const fileInput = document.getElementById('fileInput');
    document.getElementById('btnUpload')?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      stopCamera();
      document.getElementById('btnUpload')?.classList.add('active');
      const url = URL.createObjectURL(file);
      loadImage(url);
    });

    document.getElementById('btnCamera')?.addEventListener('click', () => {
      if (state.sourceMode === 'camera' && state.stream) {
        stopCamera();
        loadImage(samples[0]);
        return;
      }
      startCamera();
    });

    const bindSlider = (id, key, labelId) => {
      const el = document.getElementById(id);
      const label = document.getElementById(labelId);
      el?.addEventListener('input', () => {
        state[key] = Number(el.value);
        if (label) label.textContent = String(state[key]);
        if (state.sourceMode !== 'camera') renderFrame();
      });
    };
    bindSlider('grainSlider', 'grain', 'grainVal');
    bindSlider('vignetteSlider', 'vignette', 'vignetteVal');
    bindSlider('leakSlider', 'leak', 'leakVal');

    const gridToggle = document.getElementById('gridToggle');
    gridToggle?.addEventListener('click', () => {
      state.grid = !state.grid;
      gridToggle.classList.toggle('active', state.grid);
      if (state.sourceMode !== 'camera') renderFrame();
    });

    const stampToggle = document.getElementById('stampToggle');
    stampToggle?.addEventListener('click', () => {
      state.stamp = !state.stamp;
      stampToggle.classList.toggle('active', state.stamp);
      if (state.sourceMode !== 'camera') renderFrame();
    });

    const caption = document.getElementById('captionInput');
    caption?.addEventListener('input', () => {
      state.caption = caption.value;
      if (state.sourceMode !== 'camera') renderFrame();
    });

    loadImage(samples[0]);
  }

  // Scroll / reveal
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
