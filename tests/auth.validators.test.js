const { validationResult } = require('express-validator');
const { registerRules } = require('../src/modules/auth/auth.validators');

// Petite fonction utilitaire pour executer les regles express-validator hors requete HTTP
async function runValidation(rules, body) {
  const req = { body };
  await Promise.all(rules.map((rule) => rule.run(req)));
  return validationResult(req);
}

describe('registerRules', () => {
  it('rejette un email invalide', async () => {
    const result = await runValidation(registerRules, {
      email: 'pas-un-email',
      password: '123456',
      role: 'CANDIDATE',
      firstName: 'A',
      lastName: 'B',
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('accepte des donnees candidat valides', async () => {
    const result = await runValidation(registerRules, {
      email: 'test@example.com',
      password: '123456',
      role: 'CANDIDATE',
      firstName: 'Awa',
      lastName: 'Ouedraogo',
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('rejette un recruteur sans nom entreprise', async () => {
    const result = await runValidation(registerRules, {
      email: 'test@example.com',
      password: '123456',
      role: 'RECRUITER',
    });
    expect(result.isEmpty()).toBe(false);
  });
});
