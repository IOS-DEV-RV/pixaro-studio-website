const showcaseTabs = Array.from(document.querySelectorAll('[data-tab]'));
const showcasePreview = document.getElementById('showcasePreview');
const showcaseTitle = document.getElementById('showcaseTitle');
const showcaseDescription = document.getElementById('showcaseDescription');
const showcaseList = document.getElementById('showcaseList');

const showcaseData = {
  round: {
    image: 'images/feature-round.png',
    title: 'Start a fast round',
    description: 'Explain words with changing rules and keep the momentum of every turn.',
    bullets: [
      'Clear timer and player focus',
      'Big word card for quick glance',
      'One-tap actions: Skip or Next',
      'Perfect for game nights and trips'
    ]
  },
  setup: {
    image: 'images/feature-setup.png',
    title: 'Customize each match',
    description: 'Set categories, conditions, pace, and team format in seconds.',
    bullets: [
      'Classic, cinema, and music packs',
      'Flexible difficulty and round pace',
      'Dynamic rule rotation',
      'Balanced team mode from one device'
    ]
  },
  clues: {
    image: 'images/feature-clues.png',
    title: 'Give smart clues',
    description: 'Describe creatively while avoiding the hidden term and adapting to constraints.',
    bullets: [
      'Rule-specific prompts every turn',
      'Coach hints for smooth gameplay',
      'Clear forbidden-word guidance',
      'Designed for quick team understanding'
    ]
  },
  results: {
    image: 'images/feature-results.png',
    title: 'Track team progress',
    description: 'Compare scores, streaks, and round outcomes to keep sessions engaging.',
    bullets: [
      'Round summary with team comparison',
      'Visible streak moments',
      'Session history-ready flow',
      'Built for replay value and fun rivalry'
    ]
  }
};

function renderShowcase(key) {
  const payload = showcaseData[key];
  if (!payload) {
    return;
  }

  showcaseTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === key);
  });

  showcasePreview.src = payload.image;
  showcasePreview.alt = payload.title;
  showcaseTitle.textContent = payload.title;
  showcaseDescription.textContent = payload.description;

  showcaseList.innerHTML = '';
  payload.bullets.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    showcaseList.appendChild(li);
  });
}

showcaseTabs.forEach((tab) => {
  tab.addEventListener('click', () => renderShowcase(tab.dataset.tab));
});

renderShowcase('round');

const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (!nav) {
    return;
  }
  nav.style.background = window.scrollY > 20 ? 'rgba(8, 18, 64, 0.95)' : 'rgba(10, 20, 70, 0.86)';
}, { passive: true });
