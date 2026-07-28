const cron = require('node-cron');
const alertsService = require('../modules/alerts/alerts.service');

// Execute le matching des alertes tous les jours a 8h00 (heure du serveur)
function startDailyAlertsCron() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[cron] Demarrage du matching quotidien des alertes...');
    try {
      const results = await alertsService.runDailyAlertMatching();
      console.log(`[cron] Matching termine : ${results.length} alerte(s) avec de nouvelles offres.`);
    } catch (err) {
      console.error('[cron] Erreur lors du matching des alertes:', err);
    }
  });

  console.log('[cron] Planificateur des alertes quotidiennes demarre (tous les jours a 8h00).');
}

module.exports = { startDailyAlertsCron };
