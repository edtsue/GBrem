// GBrem — deck modal system (visual direction TBD; this logic is final)

// The two Google Slides decks. Rename `label` freely; `id` is the presentation ID.
// NOTE: each deck must be shared "Anyone with the link → Viewer" in Google Slides,
// otherwise the embed shows a Google sign-in wall for viewers who aren't signed in.
const DECKS = [
  {
    label: "Presentation One",
    id: "1TCCxYOP9qCrfejd5EKVk_31X2739PO-n",
  },
  {
    label: "Presentation Two",
    id: "1-C-ai2sYnoFIYeLc_V5bytikwFm8JA7bB60juoTF0-k",
  },
];

const embedUrl = (id) =>
  `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`;
const editUrl = (id) =>
  `https://docs.google.com/presentation/d/${id}/edit`;

// Apply labels to buttons
DECKS.forEach((d, i) => {
  const el = document.getElementById(`deck${i}-label`);
  if (el) el.textContent = d.label;
});

const modal = document.getElementById("deckModal");
const frame = document.getElementById("deckFrame");
const titleEl = document.getElementById("deckModalTitle");
const openLink = document.getElementById("deckModalOpen");

function openDeck(index) {
  const deck = DECKS[index];
  if (!deck) return;
  titleEl.textContent = deck.label;
  openLink.href = editUrl(deck.id);
  frame.src = embedUrl(deck.id); // set on open so iframe loads lazily
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeDeck() {
  modal.hidden = true;
  frame.src = "about:blank"; // stop the presentation & free the iframe
  document.body.style.overflow = "";
}

// Wire up any element that opens a deck. data-open-deck="0" opens the first deck.
// The nav "Decks ▾" button (index 0) is a simple default; adjust as sections grow.
document.querySelectorAll("[data-open-deck]").forEach((btn) => {
  btn.addEventListener("click", () => openDeck(Number(btn.dataset.openDeck)));
});

document.querySelectorAll("[data-close-deck]").forEach((el) => {
  el.addEventListener("click", closeDeck);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeDeck();
});
