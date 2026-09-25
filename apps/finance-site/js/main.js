(() => {
  const progress = document.getElementById("progress");
  const nav = document.getElementById("nav");
  const glow = document.getElementById("cursorGlow");
  const shot = document.getElementById("featureShot");
  const title = document.getElementById("featureTitle");
  const copy = document.getElementById("featureCopy");
  const list = document.getElementById("featureList");
  const buttons = document.querySelectorAll("[data-feature]");

  const features = {
    money: {
      src: "images/finance-poster-widgets.png",
      alt: "Income and spending on the home screen",
      title: "Follow income and spending",
      copy: "Add income and expenses, sort them into categories, and see where money goes. Keep more than one account, use different currencies, move money between accounts, and set operations that repeat.",
      points: ["Income and spending", "Categories", "Several accounts", "Different currencies", "Transfers between accounts", "Repeating operations"]
    },
    budget: {
      src: "images/finance-poster-budget.png",
      alt: "Budget screen",
      title: "Plan a budget",
      copy: "Set a budget and split money across necessary spending, everyday purchases, and goals. Watch the progress and notice a category when it moves past the plan.",
      points: ["Category limits", "Progress you can see", "A clear period", "Room left in the plan"]
    },
    goals: {
      src: "images/finance-poster-goals.png",
      alt: "Savings goals",
      title: "Create financial goals",
      copy: "A trip, a reserve, or something you want later. Set the amount you need and follow how the savings move.",
      points: ["A target amount", "Progress over time", "A date you can see", "Room left to reach it"]
    },
    analytics: {
      src: "images/finance-poster-analytics.png",
      alt: "Finance analytics",
      title: "See the whole picture",
      copy: "Clear charts show how spending is structured, how income and spending change, how money sits across categories, how the balance moves, and how savings progress.",
      points: ["Spending structure", "Income and spending over time", "Categories", "Balance changes", "Savings progress"]
    },
    reports: {
      src: "images/finance-poster-pdf.png",
      alt: "PDF report export",
      title: "Reports in PDF",
      copy: "Export a period in one step when you want a file you can keep or share.",
      points: ["Any period you choose", "One-step export", "A file you can keep"]
    },
    currencies: {
      src: "images/finance-poster-rates.png",
      alt: "Accounts in different currencies",
      title: "Accounts in different currencies",
      copy: "Each account keeps its own currency. Income, spending, and a transfer stay in that currency, so amounts from different currencies are not mixed into one total.",
      points: ["A currency for each account", "Income and spending in that currency", "Transfers between accounts", "No mixed-currency total"]
    },
    rates: {
      src: "images/finance-poster-rates.png",
      alt: "Watched currency rates",
      title: "Watch the rates you choose",
      copy: "Pick the currency pairs you want to follow. Each pair shows the current rate and a small chart of how it has moved. The rate refreshes about once a minute, and you can turn on a notice when it moves.",
      points: ["Pairs you choose", "A chart of the move", "Refresh about once a minute", "Optional notice when the rate moves", "The same pairs on a widget"]
    },
    widgets: {
      src: "images/finance-poster-widgets.png",
      alt: "Home Screen widgets",
      title: "Widgets on the Home Screen",
      copy: "Widgets show what is left, spending, a quick way to add an expense, and the currency pairs you follow — without opening the app.",
      points: ["Remaining and spending", "Quick expense input", "Watched rates", "A larger layout for the full picture"]
    },
    learn: {
      src: "images/finance-poster-learn.png",
      alt: "Short finance lessons",
      title: "Learn to handle money",
      copy: "Short lessons explain how to split a budget, start setting money aside, build a cushion, cut spending you do not need, pause impulse purchases, plan a large goal, approach debt, and look for ways to raise income. Plain examples, not a lecture.",
      points: ["Short lessons", "Practical examples", "No heavy theory"]
    }
  };

  const paint = (key) => {
    const feature = features[key];
    if (!feature || !shot) return;
    shot.style.opacity = "0.35";
    window.setTimeout(() => {
      shot.src = feature.src;
      shot.alt = feature.alt;
      shot.style.opacity = "1";
    }, 140);
    if (title) title.textContent = feature.title;
    if (copy) copy.textContent = feature.copy;
    if (list) {
      list.innerHTML = feature.points.map((point) => `<li>${point}</li>`).join("");
    }
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.feature === key));
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => paint(button.dataset.feature));
  });

  const board = document.getElementById("pairBoard");
  if (board) {
    const pairs = [
      { lead: "EUR", trail: "USD", rate: 1.0842, tone: "up" },
      { lead: "EUR", trail: "GBP", rate: 0.8426, tone: "down" },
      { lead: "USD", trail: "JPY", rate: 149.32, tone: "up" }
    ];
    const spark = (tone) => {
      const up = tone === "up";
      const points = up ? "2,28 18,24 34,26 50,16 66,18 82,8" : "2,10 18,14 34,12 50,20 66,18 82,28";
      return `<svg viewBox="0 0 84 36" aria-hidden="true"><polyline points="${points}" /></svg>`;
    };
    const paintPairs = () => {
      board.innerHTML = pairs.map((pair) => {
        const digits = pair.trail === "JPY" ? 2 : 4;
        const text = pair.rate.toFixed(digits);
        const mark = pair.tone === "up" ? "↑" : "↓";
        return `<article class="pair ${pair.tone}"><div><b>${pair.lead} → ${pair.trail}</b><span>Watching</span></div><div class="pair-rate"><strong>${text}</strong><em>${mark}</em>${spark(pair.tone)}</div></article>`;
      }).join("");
    };
    paintPairs();
    window.setInterval(() => {
      pairs.forEach((pair) => {
        const step = (pair.trail === "JPY" ? 0.04 : 0.0004) * (Math.random() > 0.5 ? 1 : -1);
        pair.rate = Math.max(0.0001, pair.rate + step);
        pair.tone = step >= 0 ? "up" : "down";
      });
      paintPairs();
    }, 1800);
  }

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (glow && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      glow.style.opacity = "1";
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    });
  }
})();
