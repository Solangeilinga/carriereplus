const nodemailer = require('nodemailer');

// Transporteur SMTP generique (fonctionne avec Gmail, SendGrid, Mailtrap, Brevo, etc.)
// Configure via les variables d'environnement SMTP_*.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    return null; // pas de config email : les envois seront simplement ignores (log uniquement)
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Envoie un email simple. Si aucune config SMTP n'est presente, log un avertissement
// au lieu de planter (utile en developpement sans compte email configure).
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn(`[email.service] SMTP non configure - email a "${to}" ignore (sujet: "${subject}")`);
    return { skipped: true };
  }

  return t.sendMail({
    from: process.env.EMAIL_FROM || 'Carrière+ <no-reply@carriereplus.app>',
    to,
    subject,
    html,
  });
}

// Construit et envoie l'email recapitulatif d'une alerte candidate (nouvelles offres correspondantes)
async function sendAlertMatchEmail({ to, candidateName, offers }) {
  const offersHtml = offers
    .map((o) => `<li><strong>${o.title}</strong> — ${o.location || 'Lieu non precise'} (${o.type})</li>`)
    .join('');

  const html = `
    <p>Bonjour ${candidateName || ''},</p>
    <p>De nouvelles offres correspondant à votre alerte viennent d'être publiées sur Carrière+ :</p>
    <ul>${offersHtml}</ul>
    <p>Connectez-vous à l'application pour postuler.</p>
    <p>— L'équipe Carrière+</p>
  `;

  return sendEmail({ to, subject: `Carrière+ : ${offers.length} nouvelle(s) offre(s) pour vous`, html });
}

module.exports = { sendEmail, sendAlertMatchEmail };
