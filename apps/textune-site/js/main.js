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

  function startHighlight(nodes, intervalMs = 520) {
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
      index = (index + 1) % nodes.length;
    };
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }

  const heroCaption = document.getElementById('heroCaption');
  let heroNodes = buildCaption(heroCaption, 'EVERY WORD COUNTS');
  applyStyle(heroNodes, 'bold');
  let stopHero = startHighlight(heroNodes, 560);

  const playCaption = document.getElementById('playCaption');
  const playFrame = document.getElementById('playFrame');
  let playNodes = buildCaption(playCaption, STYLE_WORDS.bold);
  applyStyle(playNodes, 'bold');
  let stopPlay = startHighlight(playNodes, 560);

  const styleRail = document.getElementById('styleRail');
  styleRail?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-style]');
    if (!btn) return;
    styleRail.querySelectorAll('.chip').forEach((el) => el.classList.toggle('active', el === btn));
    const key = btn.dataset.style;
    stopPlay();
    playNodes = buildCaption(playCaption, STYLE_WORDS[key] || STYLE_WORDS.bold);
    applyStyle(playNodes, key);
    stopPlay = startHighlight(playNodes, 560);
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
  });
})();
