// Client generique pour appeler un modele d'IA - Google Gemini via l'API Google AI Studio.
// Isole dans son propre fichier pour pouvoir changer de fournisseur facilement plus tard.
async function callAI(prompt, { maxTokens = 1000 } = {}) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Appel IA echoue: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('');
}

// Aide a extraire un JSON propre depuis une reponse IA (retire les ```json eventuels)
function parseAiJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { callAI, parseAiJson };
