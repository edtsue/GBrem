// GBrem — Placement Finder generator (Gemini)
// Reads GEMINI_KEY (or GBREM_KEY). If absent or the call fails, returns a
// tasteful sample concept flagged { sample:true } so the demo never hard-fails.

const SAMPLE = {
  scene: "A dim dorm room at 1am; textbooks everywhere, one lamp on.",
  whyItFits:
    "The late-night grind is a pure speed-of-thought moment — the mind racing to connect ideas before the deadline.",
  googlebookRole:
    "The Googlebook is open on the desk, keeping pace with the character's thinking — the quiet co-pilot of the breakthrough.",
  renderNote:
    "Place on the desk angled to camera; screen glow as the key light; keep it native, never hero-lit.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const { show = "a premium drama", moment = "a moment of quick thinking" } =
    (req.body && typeof req.body === "object" ? req.body : {}) || {};

  const key = process.env.GEMINI_KEY || process.env.GBREM_KEY;
  if (!key) {
    res.status(200).json({ concept: SAMPLE, sample: true });
    return;
  }

  const prompt = `You are a contextual product-placement strategist for the "Googlebook", Google's first AI-first laptop — a new category of "thinking machine". You use Rembrand's in-content AI, which composites products natively into already-shot premium TV scenes.

Draft ONE plausible, premium, brand-safe placement concept for the show "${show}" during "${moment}". Center the "speed of thought" thesis: the Googlebook belongs inside scenes of fast, creative thinking. Keep it realistic to the show's tone. Do not disparage the show or use real logos.

Return ONLY a compact JSON object, no markdown, with keys:
{"scene": one vivid sentence describing the exact scene/setting,
 "whyItFits": one sentence on why this is a speed-of-thought moment,
 "googlebookRole": one sentence on how the Googlebook naturally appears in the moment,
 "renderNote": one short practical note for the compositing render}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
      }
    );
    if (!r.ok) throw new Error("gemini " + r.status);
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const concept = JSON.parse(text);
    res.status(200).json({ concept });
  } catch (err) {
    res.status(200).json({ concept: SAMPLE, sample: true, error: String(err) });
  }
}
