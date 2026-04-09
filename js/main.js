/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Mobile nav drawer ── */
const hamburger = document.getElementById('navHamburger');
const drawerOverlay = document.getElementById('navDrawerOverlay');
const navDrawer = document.getElementById('navDrawer');
const drawerClose = document.getElementById('navDrawerClose');

function openDrawer() {
  hamburger?.classList.add('open');
  drawerOverlay?.classList.add('open');
  navDrawer?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  hamburger?.classList.remove('open');
  drawerOverlay?.classList.remove('open');
  navDrawer?.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
drawerOverlay?.addEventListener('click', closeDrawer);

/* ── Nav scroll effect ── */
const siteNav = document.querySelector('.site-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    siteNav?.classList.add('scrolled');
  } else {
    siteNav?.classList.remove('scrolled');
  }
}, { passive: true });

/* ── Contact form ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cName')?.value || '';
    const email = document.getElementById('cEmail')?.value || '';
    const subject = document.getElementById('cSubject')?.value || 'Message from Pixaro Studio site';
    const message = document.getElementById('cMessage')?.value || '';
    const mailto = `mailto:admin@terasms.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    const successMsg = document.getElementById('formSuccessMsg');
    if (successMsg) { successMsg.style.display = 'block'; }
    contactForm.reset();
  });
}

/* ── Active nav link ── */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link, .nav-drawer-link').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (href && href.includes(currentPage) && currentPage !== '') {
    link.classList.add('active');
  }
  if ((currentPage === '' || currentPage === 'index.html') && href === 'index.html') {
    link.classList.add('active');
  }
});
