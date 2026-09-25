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
    rates: {
      src: "images/finance-poster-rates.png",
      alt: "Watched rates and widgets",
      title: "Widgets and watched rates",
      copy: "Home Screen widgets show what is left, spending, and a quick way to add an expense. Watch the currency pairs you care about and see the rate move, including on the widget.",
      points: ["Home Screen widgets", "Remaining and spending", "Quick expense input", "Live rates", "Pairs you choose to watch"]
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
