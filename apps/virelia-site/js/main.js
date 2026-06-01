const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const cursorGlow = document.getElementById('cursorGlow');

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${amount * 100}%`;
  nav.classList.toggle('scrolled', window.scrollY > 32);
  document.documentElement.style.setProperty('--scroll', amount.toFixed(3));
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

document.addEventListener('pointermove', event => {
  cursorGlow.style.opacity = '1';
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

document.addEventListener('pointerleave', () => {
  cursorGlow.style.opacity = '0';
});

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

const signalRows = document.querySelectorAll('.signal-row');
let activeSignalIndex = 0;

setInterval(() => {
  if (!signalRows.length) return;
  signalRows[activeSignalIndex]?.classList.remove('active');
  activeSignalIndex = (activeSignalIndex + 1) % signalRows.length;
  signalRows[activeSignalIndex]?.classList.add('active');
}, 1700);
