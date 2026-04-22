// ── MENU ─────────────────────────────────────────

const menuBtn     = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuDrawer  = document.getElementById('menuDrawer');
const menuClose   = document.getElementById('menuClose');

function openMenu() {
  menuOverlay.classList.add('open');
  menuDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOverlay.classList.remove('open');
  menuDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

menuBtn?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);
menuOverlay?.addEventListener('click', closeMenu);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ── SCROLL REVEAL ────────────────────────────────

const revealEls = document.querySelectorAll('.feature-row, .reveal');

if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
}

// ── NAV SCROLL EFFECT ────────────────────────────

const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(3, 9, 18, 0.85)';
    } else {
      nav.style.background = 'rgba(8, 18, 36, 0.55)';
    }
  }, { passive: true });
}

// ── CONTACT FORM ─────────────────────────────────

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailVal   = document.getElementById('senderEmail').value.trim();
    const subjectVal = document.getElementById('subject').value.trim() || 'Message from Lumora website';
    const messageVal = document.getElementById('message').value.trim();

    if (!emailVal || !messageVal) return;

    const body = `From: ${emailVal}\n\n${messageVal}`;
    const mailto = `mailto:admin@terasms.ru?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    document.getElementById('formFields').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  });
}

// ── ACTIVE MENU LINK ─────────────────────────────

const currentPath = window.location.pathname.split('/').pop();
document.querySelectorAll('.menu-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.style.background = 'rgba(91,200,250,0.1)';
    link.style.color = 'var(--cyan-light)';
  }
});
