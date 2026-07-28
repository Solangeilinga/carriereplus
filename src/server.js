const app = require('./app');
const { startDailyAlertsCron } = require('./cron/dailyAlerts.cron');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Carriere+ API demarree sur le port ${PORT}`);
  startDailyAlertsCron();
});
