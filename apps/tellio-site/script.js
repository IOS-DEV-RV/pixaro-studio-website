// ==============================
// MENU
// ==============================
const menuBtn     = document.getElementById('menuBtn');
const menuClose   = document.getElementById('menuClose');
const fullMenu    = document.getElementById('slideMenu');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu() {
  fullMenu.classList.add('active');
  menuBtn.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  fullMenu.classList.remove('active');
  menuBtn.classList.remove('active');
  document.body.style.overflow = '';
}

if (menuBtn)   menuBtn.addEventListener('click', openMenu);
if (menuClose) menuClose.addEventListener('click', closeMenu);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ==============================
// NAVBAR SCROLL
// ==============================
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ==============================
// SCROLL REVEAL
// ==============================
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings inside the same parent
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      let delay = 0;
      siblings.forEach(sib => {
        if (sib === entry.target || entry.target.contains(sib)) {
          sib.style.transitionDelay = delay + 'ms';
          sib.classList.add('visible');
          delay += 80;
        }
      });
      entry.target.style.transitionDelay = '0ms';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ==============================
// SUPPORT FORM
// ==============================
const supportForm    = document.getElementById('supportForm');
const supportSuccess = document.getElementById('supportSuccess');
const submitBtn      = document.getElementById('submitBtn');

if (supportForm) {
  supportForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!email || !message) return;

    // Animate button
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit-text').textContent = 'Sending…';

    // Build mailto
    const subjectEncoded = encodeURIComponent(subject || 'Tellio Support Request');
    const bodyEncoded    = encodeURIComponent(`From: ${email}\n\n${message}`);
    const mailto         = `mailto:admin@terasms.ru?subject=${subjectEncoded}&body=${bodyEncoded}`;

    // Open mail client
    setTimeout(() => {
      window.location.href = mailto;

      // Show success
      setTimeout(() => {
        supportForm.style.display = 'none';
        supportSuccess.style.display = 'flex';
        supportSuccess.classList.add('visible');
      }, 800);
    }, 600);
  });
}

// ==============================
// SMOOTH HOVER PARALLAX on screenshots (desktop only)
// ==============================
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.phone-screen img').forEach(img => {
    const wrap = img.closest('.feature-phone') || img.parentElement;
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      img.style.transform = `rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
    });
    wrap.addEventListener('mouseleave', () => {
      img.style.transform = '';
    });
    img.style.transition = 'transform 0.3s ease';
    img.style.transformStyle = 'preserve-3d';
  });
}
