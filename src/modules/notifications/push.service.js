// Service de notifications push via Firebase Cloud Messaging (FCM).
// N'est actif QUE si les 3 variables FIREBASE_* sont configurees dans .env
// (voir README : cree un projet Firebase, active Cloud Messaging, genere une
// cle de compte de service, et copie les 3 valeurs correspondantes).
let admin = null;
let initialized = false;

function initFirebase() {
  if (initialized) return admin;
  initialized = true;

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('[push.service] Variables FIREBASE_* absentes - notifications push desactivees.');
    return null;
  }

  try {
    admin = require('firebase-admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Les retours a la ligne sont souvent echappes dans les variables d'env : on les restaure.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    return admin;
  } catch (err) {
    console.error('[push.service] Erreur initialisation Firebase:', err.message);
    admin = null;
    return null;
  }
}

// Envoie une notification push a un ou plusieurs tokens d'appareil.
// Ignore silencieusement (avec log) si Firebase n'est pas configure.
async function sendPushNotification({ tokens, title, body, data = {} }) {
  const firebaseAdmin = initFirebase();
  if (!firebaseAdmin || tokens.length === 0) {
    console.warn(`[push.service] Notification ignoree (Firebase non configure ou aucun token) : "${title}"`);
    return { skipped: true };
  }

  try {
    return await firebaseAdmin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
    });
  } catch (err) {
    console.error('[push.service] Echec envoi notification push:', err.message);
    return { error: err.message };
  }
}

module.exports = { sendPushNotification };
