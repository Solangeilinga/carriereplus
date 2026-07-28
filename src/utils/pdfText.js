const pdfParse = require('pdf-parse');

// Telecharge un PDF depuis une URL (ex: Cloudinary) et en extrait le texte brut.
async function extractTextFromPdfUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossible de telecharger le fichier (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  return data.text;
}

module.exports = { extractTextFromPdfUrl };
