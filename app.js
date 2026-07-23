/* ==========================================================================
   GBrem — Googlebook × Rembrand · interactions
   ========================================================================== */

/* ---- Decks: two Google Slides presentations shown in an iframe modal ----
   NOTE: each deck must be shared "Anyone with the link → Viewer" in Google
   Slides, or the embed shows a Google sign-in wall for viewers. Rename freely. */
const DECKS = [
  { label: "REMBRAND CREDS", id: "1TCCxYOP9qCrfejd5EKVk_31X2739PO-n" },
  { label: "GOOGLEBOOK RFP", id: "1-C-ai2sYnoFIYeLc_V5bytikwFm8JA7bB60juoTF0-k" },
];
const embedUrl = (id) => `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`;
const editUrl = (id) => `https://docs.google.com/presentation/d/${id}/edit`;

document.querySelectorAll("[id$='-label']").forEach((el) => {
  const m = el.id.match(/^deck(\d+)-label$/);
  if (m && DECKS[+m[1]]) el.textContent = DECKS[+m[1]].label;
});

const deckModal = document.getElementById("deckModal");
const deckFrame = document.getElementById("deckFrame");
const deckTitle = document.getElementById("deckModalTitle");
const deckOpen = document.getElementById("deckModalOpen");

function openDeck(i) {
  const d = DECKS[i];
  if (!d) return;
  deckTitle.textContent = d.label;
  deckOpen.href = editUrl(d.id);
  deckFrame.src = embedUrl(d.id);
  deckModal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeDeck() {
  deckModal.hidden = true;
  deckFrame.src = "about:blank";
  document.body.style.overflow = "";
}
document.querySelectorAll("[data-open-deck]").forEach((b) =>
  b.addEventListener("click", () => openDeck(+b.dataset.openDeck)));
document.querySelectorAll("[data-close-deck]").forEach((b) =>
  b.addEventListener("click", closeDeck));

/* ---- Product modal: opens when any "Googlebook" word is clicked ---- */
const productModal = document.getElementById("productModal");
function openProduct() { productModal.hidden = false; document.body.style.overflow = "hidden"; }
function closeProduct() { productModal.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll("[data-close-product]").forEach((b) =>
  b.addEventListener("click", closeProduct));

/* ---- Audience interests modal ---- */
const audienceModal = document.getElementById("audienceModal");
function openAudience() { audienceModal.hidden = false; document.body.style.overflow = "hidden"; }
function closeAudience() { audienceModal.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll("[data-open-audience]").forEach((b) => b.addEventListener("click", openAudience));
document.querySelectorAll("[data-close-audience]").forEach((b) => b.addEventListener("click", closeAudience));

/* ---- Videos that play while in view and pause once they leave ----
   Autoplay only works muted; controls stay on so sound is one click away.
   Once a viewer unmutes we stop forcing play, but still pause on exit so the
   audio never follows them down the page. Don't infer intent from "pause" —
   a backgrounded tab pauses too, which would strand the video for good. */
document.querySelectorAll("[data-autoplay-in-view]").forEach((vid) => {
  let userDriven = false, inView = false;
  const tryPlay = () => {
    if (userDriven || !inView || document.hidden) return;
    vid.preload = "auto";
    const p = vid.play();
    if (p) p.catch(() => {}); // autoplay can still be refused; the poster stays up
  };
  vid.addEventListener("volumechange", () => { if (!vid.muted) userDriven = true; });
  new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      inView = en.isIntersecting;
      if (inView) tryPlay();
      else if (!vid.paused) vid.pause();
    });
  }, { threshold: 0.45 }).observe(vid);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tryPlay(); });
});

/* ---- Inventory sheet modal ---- */
const sheetModal = document.getElementById("sheetModal");
function openSheet() { sheetModal.hidden = false; document.body.style.overflow = "hidden"; }
function closeSheet() { sheetModal.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll("[data-open-sheet]").forEach((b) => b.addEventListener("click", openSheet));
document.querySelectorAll("[data-close-sheet]").forEach((b) => b.addEventListener("click", closeSheet));

/* Wrap every on-page "Googlebook" in a clickable button (skips [data-no-gb]) */
(function linkGooglebook() {
  const skip = (el) => {
    while (el) {
      if (el.nodeType === 1 && (el.hasAttribute("data-no-gb") || el.tagName === "SCRIPT" ||
          el.tagName === "STYLE" || (el.classList && el.classList.contains("gb-link")))) return true;
      el = el.parentElement;
    }
    return false;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || n.nodeValue.indexOf("Googlebook") === -1) return NodeFilter.FILTER_REJECT;
      return skip(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    // take the plural too, else the link's underline stops short: "Googlebook‾s"
    node.nodeValue.split(/(Googlebooks?)/g).forEach((part) => {
      if (/^Googlebooks?$/.test(part)) {
        const b = document.createElement("button");
        b.className = "gb-link"; b.type = "button"; b.textContent = part;
        frag.appendChild(b);
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(frag, node);
  });
  document.querySelectorAll(".gb-link").forEach((b) => b.addEventListener("click", openProduct));
})();

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!deckModal.hidden) closeDeck();
  else if (!sheetModal.hidden) closeSheet();
  else if (!productModal.hidden) closeProduct();
  else if (!audienceModal.hidden) closeAudience();
});

/* ---- Hero intro: opens on pitch black, then types the concept name and
   lands each line of the promise on its own beat. ---- */
(function typeConcept() {
  const l1 = document.getElementById("conceptL1");
  const l2 = document.getElementById("conceptL2");
  if (!l1 || !l2) return;
  const CARET = '<span class="caret"></span>';
  const tagL1 = document.querySelector(".tag__l1");
  const tagL2 = document.querySelector(".tag__l2");
  const ledeEl = document.querySelector(".hero__lede");
  const heroVid = document.getElementById("heroVid");
  const show = (el) => el && el.classList.add("show");

  if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
    l1.textContent = "AS SEEN"; l2.textContent = "IN SCENES.";
    [tagL1, tagL2, ledeEl, heroVid].forEach(show);
    return;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function typeInto(el, text, speed) {
    for (let i = 1; i <= text.length; i++) {
      el.innerHTML = text.slice(0, i) + CARET;
      await wait(speed);
    }
  }
  let resolveTitle;
  const titleLanded = new Promise((r) => { resolveTitle = r; });
  const runIntro = () => (async () => {
    await wait(250);                       // short beat, then it types
    await typeInto(l1, "AS SEEN", 90);
    l1.innerHTML = "AS SEEN";              // drop caret from line 1
    await wait(550);                       // ...beat...
    await typeInto(l2, "IN SCENES.", 90);  // caret keeps blinking at the end
    resolveTitle();                        // title has landed — releases the scroll hold
    show(heroVid);                         // the scene fades up behind the name
    await wait(900);                       // ...beat...
    show(tagL1);                           // "Google's first AI laptop deserves"
    await wait(850);                       // ...beat...
    show(tagL2);                           // "...first AI product placement." in Glowbar colours
    await wait(850);                       // ...beat...
    show(ledeEl);                          // then the body copy lands last
  })();

  let introStarted = false;
  const startIntro = () => { if (introStarted) return; introStarted = true; runIntro(); };

  const heroEl = document.getElementById("top");
  if (!heroEl || !("IntersectionObserver" in window)) { startIntro(); return; }

  // start typing as the hero scrolls into view (it sits below the cover screen)
  const introIo = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { introIo.disconnect(); startIntro(); } });
  }, { threshold: 0.2 });
  introIo.observe(heroEl);

  // ...and briefly lock the scroll so the client can't blow past the title
  // reveal — released the moment the title lands (or a safety timeout)
  const keys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"]);
  const block = (e) => e.preventDefault();
  const blockKey = (e) => { if (keys.has(e.key)) e.preventDefault(); };
  const lock = () => {
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKey, { passive: false });
  };
  const unlock = () => {
    window.removeEventListener("wheel", block, { passive: false });
    window.removeEventListener("touchmove", block, { passive: false });
    window.removeEventListener("keydown", blockKey, { passive: false });
  };
  let held = false;
  const holdIo = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting && !held) {
        held = true; holdIo.disconnect();
        startIntro();
        lock();
        Promise.race([titleLanded, wait(4000)]).then(unlock);
      }
    });
  }, { threshold: 0.6 });
  holdIo.observe(heroEl);
})();

/* ---- Scroll reveals ---- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal, .stagger").forEach((el) => io.observe(el));

/* ---- Background: pure black at the top, prism fades in as you scroll ---- */
(function bgScroll() {
  const bd = document.getElementById("backdrop");
  if (!bd) return;
  // the nav is held offscreen behind the cover and fades in once you scroll into the site
  const nav = document.querySelector(".nav");
  const hasCover = !!document.getElementById("cover");
  if (nav && hasCover) nav.classList.add("nav--intro");
  let raf = 0;
  function update() {
    raf = 0;
    const vh = window.innerHeight;
    // with a cover screen, the prism starts fading only after the first viewport
    const base = hasCover ? vh : 0;
    const p = Math.min(1, Math.max(0, (window.scrollY - base) / (vh * 0.85)));
    bd.style.opacity = p.toFixed(3);
    if (nav && hasCover) nav.classList.toggle("nav--intro", window.scrollY < vh * 0.6);
  }
  window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
})();

/* ---- Stat count-up ---- */
function animateCount(el) {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const dur = 1200, t0 = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.classList.add("counted");
  }
  requestAnimationFrame(tick);
}
const statIo = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { animateCount(en.target); statIo.unobserve(en.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll(".stat__n[data-count]").forEach((el) => statIo.observe(el));

/* ---- Hero spotlight follows cursor ---- */
const spot = document.getElementById("spotlight");
if (spot && window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    spot.style.left = e.clientX + "px";
    spot.style.top = e.clientY + "px";
    spot.style.opacity = e.clientY < window.innerHeight * 0.9 ? "1" : "0";
  });
}

/* ---- Modal accessibility: move focus into the panel on open, trap Tab while
   open, and return focus to the trigger on close. Driven off the `hidden`
   attribute so it works no matter which button opened the modal. ---- */
(function modalA11y() {
  const modals = ["deckModal", "productModal", "audienceModal", "sheetModal"]
    .map((id) => document.getElementById(id)).filter(Boolean);
  const SELECTOR = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const panelOf = (m) => m.querySelector(".pmodal__panel,.deck-modal__panel");
  const visibleFocusables = (panel) =>
    [...panel.querySelectorAll(SELECTOR)].filter((el) => el.offsetParent !== null);
  let returnFocus = null;

  modals.forEach((m) => {
    new MutationObserver(() => {
      const panel = panelOf(m);
      if (!m.hidden) {
        returnFocus = document.activeElement;
        const first = panel && panel.querySelector(SELECTOR);
        if (first) first.focus();
        else if (panel) { panel.tabIndex = -1; panel.focus(); }
      } else if (returnFocus) {
        if (typeof returnFocus.focus === "function") returnFocus.focus();
        returnFocus = null;
      }
    }).observe(m, { attributes: true, attributeFilter: ["hidden"] });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const open = modals.find((m) => !m.hidden);
    if (!open) return;
    const panel = panelOf(open);
    const f = panel && visibleFocusables(panel);
    if (!f || !f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
