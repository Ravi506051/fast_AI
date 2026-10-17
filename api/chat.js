const MODEL = "gemini-2.5-flash";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Add it in Vercel Project Settings → Environment Variables, then redeploy." });
  }

  try {
    const body = req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) return res.status(400).json({ error: "Please send a message." });

    // Keep a bounded recent history and map it to Gemini's expected conversation format.
    const recent = messages.slice(-20);
    const contents = recent.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "").slice(0, 12000) }]
    })).filter((m) => m.parts[0].text.trim());

    // Gemini requires alternating user/model messages; collapse consecutive messages of the same role.
    const normalized = [];
    for (const item of contents) {
      const last = normalized[normalized.length - 1];
      if (last && last.role === item.role) last.parts[0].text += "\n\n" + item.parts[0].text;
      else normalized.push(item);
    }
    while (normalized.length && normalized[0].role !== "user") normalized.shift();
    if (!normalized.length) return res.status(400).json({ error: "Please send a user message." });

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are Nova AI, a helpful, friendly, clear assistant. Answer in the language the user uses. For coding questions, give correct, practical explanations. Be honest about uncertainty." }] },
        contents: normalized,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    });

    const result = await upstream.json();
    if (!upstream.ok) {
      const message = result?.error?.message || "Gemini API request failed.";
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({ error: message });
    }
    const reply = (result.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
    if (!reply) return res.status(502).json({ error: "Gemini returned an empty response. Please try again." });
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error. Please try again." });
  }
};
