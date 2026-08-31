(() => {
  const progress = document.getElementById("scrollProgress");
  const nav = document.getElementById("nav");
  const cursorGlow = document.getElementById("cursorGlow");

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", (event) => {
      cursorGlow.style.opacity = "1";
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    });
    document.addEventListener("pointerleave", () => {
      cursorGlow.style.opacity = "0";
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealItems.forEach((el) => io.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("in"));
  }

  const SHOTS = {
    editor: {
      kicker: "Timeline",
      title: "A real editor when you want one.",
      copy: "Trim, split, speed, volume, crop, filters, effects, and transitions live on a multi-track timeline. Video, photos, original audio, music, text, and stickers each keep their own lane."
    },
    recipes: {
      kicker: "Recipes",
      title: "A mood in one tap. A cut that already breathes.",
      copy: "Cinematic holds the shot. Retro leans film. Dynamic changes plans on the fly. Recap strings photos together. Beat Pop and Beat Rhythm cut to the kick. Flow and Story keep the handoff soft."
    },
    beat: {
      kicker: "Beat Sync",
      title: "Stick to the beat of the music.",
      copy: "MOTION maps BPM and hits, then syncs stickers, movement, and speed. Smooth, Energetic, or Cinematic styles change how sharp the cut feels. Rhythm offset stays in milliseconds if you need a nudge."
    },
    depth: {
      kicker: "3D Photo",
      title: "Volume and depth from a single still.",
      copy: "Tap the subject, then ride Depth and Camera. Soft, Cinematic, 3D, and Dynamic presets set how much air sits around the object — export as video or GIF when the parallax feels right."
    },
    device: {
      kicker: "On-device",
      title: "Full processing right on your iPhone.",
      copy: "Import, montage, beat analysis, 3D Photo, and export stay on the device. Projects keep titles, clip counts, and frames such as 9:16 or 4:5 — without a cloud render queue."
    }
  };

  const shotRail = document.getElementById("shotRail");
  const playStage = document.getElementById("playStage");
  const playKicker = document.getElementById("playKicker");
  const playTitle = document.getElementById("playTitle");
  const playCopy = document.getElementById("playCopy");

  const applyShot = (key) => {
    const shot = SHOTS[key];
    if (!shot) return;
    playStage?.querySelectorAll("img").forEach((img) => {
      img.classList.toggle("is-on", img.dataset.shot === key);
    });
    shotRail?.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.shot === key);
    });
    if (playKicker) playKicker.textContent = shot.kicker;
    if (playTitle) playTitle.textContent = shot.title;
    if (playCopy) playCopy.textContent = shot.copy;
  };

  shotRail?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-shot]");
    if (!btn) return;
    applyShot(btn.dataset.shot);
  });

  const visual = document.querySelector(".hero-visual");
  visual?.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    visual.querySelectorAll(".float-chip").forEach((chip, i) => {
      const depth = (i + 1) * 8;
      chip.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
})();
