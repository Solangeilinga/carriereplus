// Script CLI pour creer un compte admin : node src/modules/admin/create-admin.script.js email motdepasse
require('dotenv').config();
const adminService = require('./admin.service');

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node create-admin.script.js <email> <password>');
  process.exit(1);
}

adminService.createAdmin({ email, password })
  .then((admin) => {
    console.log(`Compte admin cree: ${admin.email}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Erreur lors de la creation du compte admin:', err.message);
    process.exit(1);
  });
