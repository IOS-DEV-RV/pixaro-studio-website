/* ── MENU ──────────────────────────────────────────────────── */
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const slideMenu = document.getElementById('slideMenu');

function openMenu() {
    menuBtn.classList.add('active');
    menuOverlay.classList.add('open');
    slideMenu.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeMenu() {
    menuBtn.classList.remove('active');
    menuOverlay.classList.remove('open');
    slideMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

menuBtn?.addEventListener('click', () => {
    slideMenu.classList.contains('open') ? closeMenu() : openMenu();
});

menuOverlay?.addEventListener('click', closeMenu);

/* ── PANELS ────────────────────────────────────────────────── */
function openPanel(panelId) {
    closeMenu();
    const overlay = document.getElementById(panelId + 'Overlay');
    const panel = document.getElementById(panelId + 'Panel');
    if (!overlay || !panel) return;
    overlay.classList.add('open');
    panel.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closePanel(panelId) {
    const overlay = document.getElementById(panelId + 'Overlay');
    const panel = document.getElementById(panelId + 'Panel');
    if (!overlay || !panel) return;
    overlay.classList.remove('open');
    panel.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

document.querySelectorAll('[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => openPanel(btn.dataset.panel));
});

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closePanel(btn.dataset.close));
});

document.querySelectorAll('.panel-overlay').forEach(overlay => {
    overlay.addEventListener('click', function () {
        const id = this.id.replace('Overlay', '');
        closePanel(id);
    });
});

/* ── SUPPORT FORM ──────────────────────────────────────────── */
const supportForm = document.getElementById('supportForm');
const formSuccess = document.getElementById('formSuccess');

supportForm?.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('supportEmail').value.trim();
    const subject = encodeURIComponent('Lens Kit Pro — Support Request');
    const body = encodeURIComponent(document.getElementById('supportMessage').value.trim());

    if (!email || !body) return;

    window.location.href = `mailto:support@lenskitpro.app?subject=${subject}&body=${body}%0A%0AFrom: ${encodeURIComponent(email)}`;

    supportForm.style.display = 'none';
    formSuccess.style.display = 'block';

    setTimeout(() => {
        supportForm.style.display = 'block';
        formSuccess.style.display = 'none';
        supportForm.reset();
    }, 5000);
});

/* ── SCROLL REVEAL ─────────────────────────────────────────── */
function initScrollReveal() {
    const targets = document.querySelectorAll('.feature-block, .fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

/* ── PARALLAX HERO GLOW ────────────────────────────────────── */
function initHeroParallax() {
    const glow = document.querySelector('.hero-glow');
    if (!glow) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        glow.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
    });
}

/* ── NAVBAR SCROLL SHADOW ──────────────────────────────────── */
function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.style.background = window.scrollY > 20
            ? 'rgba(8, 8, 8, 0.92)'
            : 'rgba(8, 8, 8, 0.75)';
    }, { passive: true });
}

/* ── TOAST ─────────────────────────────────────────────────── */
function showToast(msg, icon = '✓') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── ESC KEY ───────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMenu();
        ['support', 'compare', 'privacy'].forEach(id => closePanel(id));
    }
});

/* ── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initHeroParallax();
    initNavScroll();
});
