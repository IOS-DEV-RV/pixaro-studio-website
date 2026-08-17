const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const cursorGlow = document.getElementById('cursorGlow');

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max > 0 ? window.scrollY / max : 0;
  if (progress) progress.style.width = `${amount * 100}%`;
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 32);
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

if (cursorGlow) {
  document.addEventListener('pointermove', event => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });

  document.addEventListener('pointerleave', () => {
    cursorGlow.style.opacity = '0';
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1100px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

const formatTabs = document.querySelectorAll('.format-tab');
const formatFrame = document.getElementById('formatFrame');

const formatSizes = {
  story: { width: 180, height: 320 },
  post: { width: 240, height: 240 },
  portrait: { width: 220, height: 275 },
  video: { width: 320, height: 180 }
};

formatTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    formatTabs.forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.dataset.format;
    const size = formatSizes[key];
    if (formatFrame && size) {
      formatFrame.style.width = `${size.width}px`;
      formatFrame.style.height = `${size.height}px`;
    }
  });
});

document.querySelectorAll('.collage-tile').forEach((tile, index) => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('.collage-tile').forEach(item => item.style.zIndex = '1');
    tile.style.zIndex = '6';
    tile.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.08)' },
      { transform: 'scale(1)' }
    ], { duration: 420, easing: 'ease-out' });
  });
});

const emojiFloaters = document.querySelectorAll('.emoji-float');
emojiFloaters.forEach((item, index) => {
  item.style.animationDelay = `${index * 0.6}s`;
});
