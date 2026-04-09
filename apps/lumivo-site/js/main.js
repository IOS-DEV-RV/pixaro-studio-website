// ─── NAV SCROLL ────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── SIDE MENU ─────────────────────────────────────────────────
const menuBtn   = null;
const sideMenu  = null;
const overlay   = null;
const closeMenu = null;
const supportLink = document.getElementById('supportLink');

function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('active');
  menuBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenuFn() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('active');
  menuBtn.classList.remove('open');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', () => {
  sideMenu.classList.contains('open') ? closeMenuFn() : openMenu();
});
closeMenu.addEventListener('click', closeMenuFn);
overlay.addEventListener('click', closeMenuFn);

// Close menu + smooth scroll when Support link is clicked
if (supportLink) {
  supportLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeMenuFn();
    setTimeout(() => {
      const el = document.getElementById('support');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  });
}

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenuFn();
});

// ─── SCROLL REVEAL ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── SUPPORT FORM ──────────────────────────────────────────────
const form        = document.getElementById('supportForm');
const formSuccess = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email   = document.getElementById('userEmail').value.trim();
    const message = document.getElementById('userMessage').value.trim();

    if (!email || !message) return;

    const subject = encodeURIComponent('Lumivo App Support');
    const body    = encodeURIComponent(`From: ${email}\n\n${message}`);

    window.location.href = `mailto:admin@terasms.ru?subject=${subject}&body=${body}`;

    form.reset();
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 6000);
  });
}

// ─── NAV SMOOTH SCROLL ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
