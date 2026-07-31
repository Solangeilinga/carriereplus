// Client generique pour appeler un modele d'IA - Supporte Groq et Gemini
// Isole dans son propre fichier pour pouvoir changer de fournisseur facilement plus tard.

// =============================================
// FOURNISSEUR : GROQ (recommandé, gratuit)
// =============================================
async function callGroq(prompt, { maxTokens = 1000 } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY manquante. Obtenez une clé gratuite sur https://console.groq.com');
  }

  const model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Appel Groq echoue: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// =============================================
// FOURNISSEUR : GEMINI (fallback)
// =============================================
async function callGemini(prompt, { maxTokens = 1000 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY manquante');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
    throw new Error(`Appel Gemini echoue: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('');
}

// =============================================
// FOURNISSEUR : OLLAMA (local, 100% gratuit)
// =============================================
async function callOllama(prompt, { maxTokens = 1000 } = {}) {
  const model = process.env.OLLAMA_MODEL || 'llama3.2';
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Appel Ollama echoue: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data.response || '';
}

// =============================================
// FONCTION PRINCIPALE (choisit automatiquement)
// =============================================
async function callAI(prompt, options = {}) {
  const provider = process.env.AI_PROVIDER || 'groq'; // 'groq', 'gemini', 'ollama'

  switch (provider.toLowerCase()) {
    case 'groq':
      return callGroq(prompt, options);
    case 'gemini':
      return callGemini(prompt, options);
    case 'ollama':
      return callOllama(prompt, options);
    default:
      throw new Error(`Fournisseur AI non reconnu: ${provider}`);
  }
}

// =============================================
// UTILITAIRE : Extraire JSON
// =============================================
function parseAiJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { callAI, parseAiJson };