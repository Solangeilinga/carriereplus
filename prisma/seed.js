// Script de seed : jeu de donnees minimal pour tester rapidement l'API
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruteur@example.com',
      passwordHash,
      role: 'RECRUITER',
      recruiterProfile: {
        create: { companyName: 'Tech Burkina SARL', organizationType: 'Entreprise privee' },
      },
    },
    include: { recruiterProfile: true },
  });

  await prisma.user.create({
    data: {
      email: 'candidat@example.com',
      passwordHash,
      role: 'CANDIDATE',
      candidateProfile: {
        create: { firstName: 'Awa', lastName: 'Ouedraogo', skills: ['JavaScript', 'Flutter'] },
      },
    },
  });

  await prisma.offer.create({
    data: {
      recruiterId: recruiterUser.recruiterProfile.id,
      title: 'Developpeur Flutter Junior',
      type: 'EMPLOI',
      contractType: 'CDI',
      description: 'Recherche un developpeur Flutter motive pour rejoindre notre equipe mobile.',
      location: 'Ouagadougou',
    },
  });

  console.log('Seed termine.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
