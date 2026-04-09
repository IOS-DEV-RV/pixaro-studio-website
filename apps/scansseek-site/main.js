document.addEventListener('DOMContentLoaded', () => {

    /* ─── NAVBAR SCROLL ─── */
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        if (window.scrollY > 40) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ─── SIDE PANEL ─── */
    const menuToggle   = document.getElementById('menuToggle');
    const sidePanel    = document.getElementById('sidePanel');
    const menuOverlay  = document.getElementById('menuOverlay');
    const closePanel   = document.getElementById('closePanel');

    const openMenu = () => {
        sidePanel?.classList.add('open');
        menuOverlay?.classList.add('visible');
        menuToggle?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        sidePanel?.classList.remove('open');
        menuOverlay?.classList.remove('visible');
        menuToggle?.classList.remove('active');
        document.body.style.overflow = '';
    };

    menuToggle?.addEventListener('click', () => {
        sidePanel?.classList.contains('open') ? closeMenu() : openMenu();
    });

    closePanel?.addEventListener('click', closeMenu);
    menuOverlay?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
            closeSupportModal();
        }
    });

    /* ─── SUPPORT MODAL ─── */
    const supportOverlay = document.getElementById('supportOverlay');
    const supportClose   = document.getElementById('supportClose');
    const supportTrigger = document.getElementById('supportTrigger');
    const footerSupport  = document.getElementById('footerSupportLink');

    const openSupportModal = (e) => {
        e?.preventDefault();
        closeMenu();
        setTimeout(() => {
            supportOverlay?.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }, sidePanel?.classList.contains('open') ? 350 : 0);
    };

    const closeSupportModal = () => {
        supportOverlay?.classList.remove('visible');
        document.body.style.overflow = '';
    };

    supportTrigger?.addEventListener('click', openSupportModal);
    footerSupport?.addEventListener('click', openSupportModal);
    supportClose?.addEventListener('click', closeSupportModal);

    supportOverlay?.addEventListener('click', (e) => {
        if (e.target === supportOverlay) closeSupportModal();
    });

    /* ─── SUPPORT FORM SUBMIT ─── */
    const supportForm = document.getElementById('supportForm');
    supportForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput   = document.getElementById('emailInput');
        const messageInput = document.getElementById('messageInput');
        const email   = emailInput?.value.trim() || '';
        const message = messageInput?.value.trim() || '';

        if (!email || !message) return;

        const subject = encodeURIComponent(`Support Request from ${email}`);
        const body    = encodeURIComponent(message);
        window.location.href = `mailto:admin@terasms.ru?subject=${subject}&body=${body}`;

        showFormSuccess();
    });

    const showFormSuccess = () => {
        const btn = supportForm?.querySelector('.form-submit-btn');
        if (!btn) return;
        const original = btn.innerHTML;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Sent!`;
        btn.style.background = 'linear-gradient(135deg, #34C759, #248A3D)';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = '';
            closeSupportModal();
            if (document.getElementById('emailInput')) document.getElementById('emailInput').value = '';
            if (document.getElementById('messageInput')) document.getElementById('messageInput').value = '';
        }, 2000);
    };

    /* ─── SCROLL REVEAL ─── */
    const animatedEls = document.querySelectorAll('[data-animate]');

    if (animatedEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, Number(delay));
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        animatedEls.forEach((el, i) => {
            el.dataset.delay = i * 80;
            revealObserver.observe(el);
        });
    }

    /* ─── STAGGERED FEATURE ROWS ─── */
    const featureRows = document.querySelectorAll('.feature-row');
    featureRows.forEach((row, idx) => {
        row.setAttribute('data-animate', '');
        row.dataset.delay = idx * 100;
    });

    /* ─── SMOOTH HOVER TILT ON PHONE MOCKUPS ─── */
    document.querySelectorAll('.phone-mockup').forEach((mockup) => {
        mockup.addEventListener('mousemove', (e) => {
            const rect = mockup.getBoundingClientRect();
            const cx   = rect.left + rect.width / 2;
            const cy   = rect.top + rect.height / 2;
            const dx   = (e.clientX - cx) / (rect.width / 2);
            const dy   = (e.clientY - cy) / (rect.height / 2);
            mockup.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg) translateY(-8px)`;
            mockup.style.animationPlayState = 'paused';
        });

        mockup.addEventListener('mouseleave', () => {
            mockup.style.transform = '';
            mockup.style.animationPlayState = 'running';
        });
    });

    /* ─── PARALLAX ON HERO ─── */
    const heroImg = document.querySelector('.hero-phone-img');
    if (heroImg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroImg.style.transform = `translateY(${scrollY * 0.12}px)`;
            }
        }, { passive: true });
    }

    /* ─── DESC CARDS STAGGER ─── */
    const descCards = document.querySelectorAll('.desc-card');
    if (descCards.length) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cards = entry.target.querySelectorAll('.desc-card');
                    cards.forEach((card, i) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(30px)';
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, i * 120);
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        const grid = document.querySelector('.desc-grid');
        if (grid) cardObserver.observe(grid);
    }

});
