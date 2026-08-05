(() => {
  const progress = document.getElementById('scrollProgress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in'));
  }

  const STYLE_WORDS = {
    bold: 'EVERY WORD COUNTS',
    minimal: 'keep it simple',
    neon: 'GO VIRAL NOW',
    clean: 'THIS IS **** AMAZING'
  };

  const STYLE_LOOK = {
    bold: {
      weight: '800',
      transform: 'uppercase',
      letter: '-0.03em',
      activeBg: 'linear-gradient(120deg,#7c3aed,#d946ef,#f97316)',
      activeColor: '#120816',
      idleColor: '#ffffff',
      idleShadow: '0 2px 10px rgba(0,0,0,0.45)'
    },
    minimal: {
      weight: '600',
      transform: 'none',
      letter: '-0.01em',
      activeBg: 'rgba(255,255,255,0.92)',
      activeColor: '#120816',
      idleColor: 'rgba(255,255,255,0.92)',
      idleShadow: '0 2px 10px rgba(0,0,0,0.35)'
    },
    neon: {
      weight: '800',
      transform: 'uppercase',
      letter: '0.04em',
      activeBg: 'rgba(57,255,20,0.16)',
      activeColor: '#39ff14',
      idleColor: '#7dffb3',
      idleShadow: '0 0 12px rgba(57,255,20,0.55)',
      activeShadow: '0 0 18px rgba(57,255,20,0.75)'
    },
    clean: {
      weight: '800',
      transform: 'uppercase',
      letter: '-0.02em',
      activeBg: 'linear-gradient(120deg,#ec4899,#d946ef)',
      activeColor: '#ffffff',
      idleColor: '#ffffff',
      idleShadow: '0 2px 10px rgba(0,0,0,0.45)'
    }
  };

  function buildCaption(container, text) {
    if (!container) return [];
    const words = text.split(/\s+/).filter(Boolean);
    container.innerHTML = '';
    container.classList.remove('is-row');
    return words.map((word) => {
      const span = document.createElement('span');
      span.className = 'cap-word';
      span.textContent = word;
      container.appendChild(span);
      return span;
    });
  }

  function applyStyle(nodes, styleKey) {
    const look = STYLE_LOOK[styleKey] || STYLE_LOOK.bold;
    nodes.forEach((node) => {
      node.classList.remove('active');
      node.style.fontWeight = look.weight;
      node.style.textTransform = look.transform;
      node.style.letterSpacing = look.letter;
      node.style.color = look.idleColor;
      node.style.textShadow = look.idleShadow;
      node.style.background = 'transparent';
      node.style.boxShadow = 'none';
      node.dataset.activeBg = look.activeBg;
      node.dataset.activeColor = look.activeColor;
      node.dataset.idleColor = look.idleColor;
      node.dataset.idleShadow = look.idleShadow;
      node.dataset.activeShadow = look.activeShadow || '0 8px 22px rgba(217, 70, 239, 0.35)';
    });
  }

  // --- Живой Memoji: только idle/talk/blink + мягкий 2D lerp (без резких смен поз) ---
  function createMemojiController(rig) {
    if (!rig) return null;
    const frames = Array.from(rig.querySelectorAll('.memoji-frame'));
    let pose = 'idle';
    let x = 0;
    let y = 0;
    let rot = 0;
    let scale = 1;
    let targetX = 0;
    let targetY = 0;
    let targetRot = 0;
    let targetScale = 1;
    let raf = 0;
    let blinkTimer = 0;
    let mouthCloseTimer = 0;
    let talking = false;
    let turnDir = 1;
    const t0 = performance.now();
    let lastTs = t0;

    const smooth = (a, b, speed, dt) => a + (b - a) * (1 - Math.exp(-speed * dt));

    const setPose = (next) => {
      if (pose === next) return;
      // left/right кадры отключены — только мягкий рот/моргание
      if (next === 'left' || next === 'right') next = 'talk';
      pose = next;
      frames.forEach((img) => img.classList.toggle('is-on', img.dataset.pose === next));
    };

    const render = (now) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const t = (now - t0) / 1000;

      // Медленное сглаживание — без рывков
      x = smooth(x, targetX, 2.8, dt);
      y = smooth(y, targetY, 3.2, dt);
      rot = smooth(rot, targetRot, 2.6, dt);
      scale = smooth(scale, targetScale, 3.0, dt);

      const liveX = x + Math.sin(t * 0.35) * 3.2 + Math.sin(t * 0.9) * 1.1;
      const liveY = y + Math.sin(t * 0.55 + 0.3) * 2.4;
      const liveRot = rot + Math.sin(t * 0.4) * 1.4;
      const liveScale = scale * (1 + Math.sin(t * 1.05) * 0.006);

      rig.style.transform = [
        `translate3d(${liveX.toFixed(2)}px, ${liveY.toFixed(2)}px, 0)`,
        `rotate(${liveRot.toFixed(2)}deg)`,
        `scale(${liveScale.toFixed(4)})`
      ].join(' ');
      raf = requestAnimationFrame(render);
    };

    const scheduleBlink = () => {
      window.clearTimeout(blinkTimer);
      blinkTimer = window.setTimeout(() => {
        if (!talking) {
          setPose('blink');
          window.setTimeout(() => {
            if (!talking) setPose('idle');
          }, 180);
        }
        scheduleBlink();
      }, 3200 + Math.random() * 3600);
    };

    const speakWord = () => {
      talking = true;
      turnDir *= -1;
      setPose('talk');
      targetX = turnDir * (4 + Math.random() * 5);
      targetY = -1.5 - Math.random() * 2.5;
      targetRot = turnDir * (2 + Math.random() * 2.5);
      targetScale = 1.018;

      window.clearTimeout(mouthCloseTimer);
      mouthCloseTimer = window.setTimeout(() => {
        talking = false;
        setPose('idle');
        targetX *= 0.2;
        targetY *= 0.2;
        targetRot *= 0.2;
        targetScale = 1;
      }, 520);
    };

    setPose('idle');
    scheduleBlink();
    raf = requestAnimationFrame(render);

    return {
      speakWord,
      destroy() {
        cancelAnimationFrame(raf);
        window.clearTimeout(blinkTimer);
        window.clearTimeout(mouthCloseTimer);
      }
    };
  }

  function startHighlight(nodes, controllers, intervalMs = 780) {
    if (!nodes.length) return () => {};
    let index = 0;

    const tick = () => {
      nodes.forEach((node, i) => {
        const on = i === index;
        node.classList.toggle('active', on);
        if (on) {
          node.style.background = node.dataset.activeBg || '';
          node.style.color = node.dataset.activeColor || '';
          node.style.textShadow = 'none';
          node.style.boxShadow = node.dataset.activeShadow || '';
        } else {
          node.style.background = 'transparent';
          node.style.color = node.dataset.idleColor || '';
          node.style.textShadow = node.dataset.idleShadow || '';
          node.style.boxShadow = 'none';
        }
      });

      controllers.forEach((c) => c?.speakWord());
      index = (index + 1) % nodes.length;
    };

    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }

  const heroCaption = document.getElementById('heroCaption');
  const heroControllers = Array.from(
    heroCaption?.closest('.phone-screen')?.querySelectorAll('[data-talk-avatar]') || []
  ).map(createMemojiController);

  let heroNodes = buildCaption(heroCaption, 'EVERY WORD COUNTS');
  applyStyle(heroNodes, 'bold');
  let stopHero = startHighlight(heroNodes, heroControllers, 780);

  const playCaption = document.getElementById('playCaption');
  const playFrame = document.getElementById('playFrame');
  const playControllers = Array.from(
    playFrame?.querySelectorAll('[data-talk-avatar]') || []
  ).map(createMemojiController);

  let playNodes = buildCaption(playCaption, STYLE_WORDS.bold);
  applyStyle(playNodes, 'bold');
  let stopPlay = startHighlight(playNodes, playControllers, 780);

  const styleRail = document.getElementById('styleRail');
  styleRail?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-style]');
    if (!btn) return;
    styleRail.querySelectorAll('.chip').forEach((el) => el.classList.toggle('active', el === btn));
    const key = btn.dataset.style;
    stopPlay();
    playNodes = buildCaption(playCaption, STYLE_WORDS[key] || STYLE_WORDS.bold);
    applyStyle(playNodes, key);
    stopPlay = startHighlight(playNodes, playControllers, 780);
  });

  const formatRail = document.getElementById('formatRail');
  formatRail?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-ratio]');
    if (!btn || !playFrame) return;
    formatRail.querySelectorAll('.chip').forEach((el) => el.classList.toggle('active', el === btn));
    playFrame.style.setProperty('--frame-ratio', btn.dataset.ratio);
    playFrame.style.setProperty('--frame-w', btn.dataset.w);
  });

  const visual = document.querySelector('.hero-visual');
  visual?.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visual.querySelectorAll('.float-chip').forEach((chip, i) => {
      const depth = (i + 1) * 8;
      chip.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });

  window.addEventListener('beforeunload', () => {
    stopHero();
    stopPlay();
    [...heroControllers, ...playControllers].forEach((c) => c?.destroy());
  });
})();
