// Client generique pour appeler un modele d'IA (ex: Claude via l'API Anthropic).
// Isolé dans son propre fichier pour pouvoir changer de fournisseur facilement.
async function callAI(prompt, { maxTokens = 1000 } = {}) {
  const response = await fetch(process.env.AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Appel IA echoue: ${response.status}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

// Aide a extraire un JSON propre depuis une reponse IA (retire les ```json eventuels)
function parseAiJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { callAI, parseAiJson };
