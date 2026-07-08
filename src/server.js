const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Carriere+ API demarree sur le port ${PORT}`);
});
