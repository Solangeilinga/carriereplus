-- =============================================================
-- Seed Carriere+ - a executer directement dans Supabase
-- SQL Editor (Dashboard Supabase > SQL Editor > New query > Run)
-- =============================================================
-- IMPORTANT : execute ce script SEULEMENT APRES que les migrations
-- Prisma aient deja cree les tables (npx prisma db push / migrate deploy,
-- ou le script manual_migration_add_auth_and_device_tokens.sql).
--
-- Ce script est idempotent : il supprime d'abord les donnees de demo
-- avant de les recreer, donc tu peux le relancer sans erreur.
-- =============================================================

-- Nettoyage (l'ordre respecte les contraintes de cle etrangere)
DELETE FROM test_results;
DELETE FROM interview_sessions;
DELETE FROM saved_offers;
DELETE FROM applications;
DELETE FROM alerts;
DELETE FROM offers;
DELETE FROM recruiter_profiles;
DELETE FROM candidate_profiles;
DELETE FROM refresh_tokens;
DELETE FROM auth_tokens;
DELETE FROM device_tokens;
DELETE FROM users;
DELETE FROM test_questions;
DELETE FROM library_resources;

-- =============================================================
-- Utilisateurs
-- Mot de passe pour TOUS les comptes ci-dessous : password123
-- =============================================================
INSERT INTO users (id, email, "passwordHash", role, "isActive", "createdAt", "updatedAt") VALUES
  ('11111111-1111-1111-1111-111111111111', 'recruteur@example.com', '$2b$10$r8TV95YNEyakwf/m/vgQNeSj3xLCDigOwj0DAid.FOglJDl/QhMkC', 'RECRUITER', true, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'recruteur2@example.com', '$2b$10$r8TV95YNEyakwf/m/vgQNeSj3xLCDigOwj0DAid.FOglJDl/QhMkC', 'RECRUITER', true, now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'candidat@example.com', '$2b$10$r8TV95YNEyakwf/m/vgQNeSj3xLCDigOwj0DAid.FOglJDl/QhMkC', 'CANDIDATE', true, now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'admin@example.com', '$2b$10$r8TV95YNEyakwf/m/vgQNeSj3xLCDigOwj0DAid.FOglJDl/QhMkC', 'ADMIN', true, now(), now());

-- Profils recruteurs
INSERT INTO recruiter_profiles (id, "userId", "companyName", "organizationType", city, "createdAt", "updatedAt") VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Tech Burkina SARL', 'Entreprise privee', 'Ouagadougou', now(), now()),
  ('aaaaaaaa-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Fonction Publique - Ministere de l''Education', 'Administration publique', 'Ouagadougou', now(), now());

-- Profil candidat
INSERT INTO candidate_profiles (id, "userId", "firstName", "lastName", skills, "createdAt", "updatedAt") VALUES
  ('aaaaaaaa-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Awa', 'Ouedraogo', ARRAY['JavaScript', 'Flutter', 'Node.js'], now(), now());

-- =============================================================
-- Offres (emploi, stage, concours)
-- =============================================================
INSERT INTO offers (id, "recruiterId", title, type, "contractType", description, location, remote, deadline, "isPublished", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'aaaaaaaa-1111-1111-1111-111111111111', 'Developpeur Flutter Junior', 'EMPLOI', 'CDI',
    'Recherche un developpeur Flutter motive pour rejoindre notre equipe mobile. Vous travaillerez sur Carriere+ et d''autres produits internes.',
    'Ouagadougou', false, NULL, true, now(), now()),

  (gen_random_uuid()::text, 'aaaaaaaa-1111-1111-1111-111111111111', 'Stagiaire Developpeur Backend Node.js', 'STAGE', 'STAGE',
    'Stage de 6 mois pour etudiant en fin de cycle informatique. Vous participerez au developpement de nos APIs REST.',
    'Ouagadougou', true, NULL, true, now(), now()),

  (gen_random_uuid()::text, 'aaaaaaaa-1111-1111-1111-111111111111', 'Charge(e) de Marketing Digital', 'EMPLOI', 'CDD',
    'Gestion des reseaux sociaux, creation de contenu et campagnes publicitaires pour nos clients.',
    'Bobo-Dioulasso', false, NULL, true, now(), now()),

  (gen_random_uuid()::text, 'aaaaaaaa-2222-2222-2222-222222222222', 'Concours de recrutement des Professeurs Certifies (CAPES) 2026', 'CONCOURS', 'CONCOURS',
    'Le Ministere de l''Education lance le concours annuel de recrutement des professeurs certifies. Ouvert aux titulaires d''une licence.',
    'National', false, now() + interval '2 months', true, now(), now()),

  (gen_random_uuid()::text, 'aaaaaaaa-2222-2222-2222-222222222222', 'Concours direct des Attaches des Services Financiers', 'CONCOURS', 'CONCOURS',
    'Recrutement d''attaches des services financiers pour les ministeres et institutions publiques.',
    'National', false, now() + interval '3 months', true, now(), now());

-- =============================================================
-- Questions de tests d'entrainement (5 par categorie)
-- =============================================================
INSERT INTO test_questions (id, category, question, choices, "correctIndex", "createdAt") VALUES
  (gen_random_uuid()::text, 'CULTURE_GENERALE', 'Quelle est la capitale du Burkina Faso ?', ARRAY['Bobo-Dioulasso', 'Ouagadougou', 'Koudougou', 'Banfora'], 1, now()),
  (gen_random_uuid()::text, 'CULTURE_GENERALE', 'En quelle annee le Burkina Faso a-t-il pris son nom actuel ?', ARRAY['1960', '1984', '1991', '2000'], 1, now()),
  (gen_random_uuid()::text, 'CULTURE_GENERALE', 'Quel est le plus long fleuve d''Afrique ?', ARRAY['Le Congo', 'Le Niger', 'Le Nil', 'Le Zambeze'], 2, now()),
  (gen_random_uuid()::text, 'CULTURE_GENERALE', 'Combien de pays composent la CEDEAO actuellement ?', ARRAY['12', '15', '18', '20'], 1, now()),
  (gen_random_uuid()::text, 'CULTURE_GENERALE', 'Quelle organisation a son siege a Addis-Abeba ?', ARRAY['ONU', 'Union Africaine', 'CEDEAO', 'UEMOA'], 1, now()),

  (gen_random_uuid()::text, 'LOGIQUE', 'Quel nombre complete la suite : 2, 4, 8, 16, ... ?', ARRAY['24', '32', '20', '18'], 1, now()),
  (gen_random_uuid()::text, 'LOGIQUE', 'Si tous les A sont des B, et tous les B sont des C, alors :', ARRAY['Tous les C sont des A', 'Tous les A sont des C', 'Aucun A n''est C', 'On ne peut rien conclure'], 1, now()),
  (gen_random_uuid()::text, 'LOGIQUE', 'Quel est l''intrus : Carre, Triangle, Cercle, Rouge ?', ARRAY['Carre', 'Triangle', 'Cercle', 'Rouge'], 3, now()),
  (gen_random_uuid()::text, 'LOGIQUE', 'Complete la serie : A, C, E, G, ... ?', ARRAY['H', 'I', 'J', 'F'], 1, now()),
  (gen_random_uuid()::text, 'LOGIQUE', 'Un train part a 8h et roule a 60 km/h. A quelle heure a-t-il parcouru 180 km ?', ARRAY['10h', '11h', '10h30', '9h30'], 1, now()),

  (gen_random_uuid()::text, 'INFORMATIQUE', 'Que signifie le sigle HTML ?', ARRAY['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Modern Link', 'Home Tool Markup Language'], 0, now()),
  (gen_random_uuid()::text, 'INFORMATIQUE', 'Quel langage est utilise pour le developpement de ce backend Carriere+ ?', ARRAY['Python', 'Java', 'Node.js', 'PHP'], 2, now()),
  (gen_random_uuid()::text, 'INFORMATIQUE', 'Que signifie SQL ?', ARRAY['Structured Query Language', 'Simple Query Language', 'Standard Question Language', 'System Query Logic'], 0, now()),
  (gen_random_uuid()::text, 'INFORMATIQUE', 'Quel protocole est utilise pour securiser les echanges web ?', ARRAY['FTP', 'HTTP', 'HTTPS', 'SMTP'], 2, now()),
  (gen_random_uuid()::text, 'INFORMATIQUE', 'Que signifie l''acronyme API ?', ARRAY['Application Programming Interface', 'Automated Program Install', 'Applied Programming Index', 'Application Process Integration'], 0, now()),

  (gen_random_uuid()::text, 'FRANCAIS', 'Quel est le pluriel correct de "cheval" ?', ARRAY['Chevals', 'Chevaux', 'Chevos', 'Chevales'], 1, now()),
  (gen_random_uuid()::text, 'FRANCAIS', 'Identifiez la faute : "Il faut que je parte tout de suite"', ARRAY['Aucune faute', '"parte" est incorrect', '"faut" est incorrect', '"suite" est incorrect'], 0, now()),
  (gen_random_uuid()::text, 'FRANCAIS', 'Quel est le synonyme de "perspicace" ?', ARRAY['Naif', 'Perceptif', 'Distrait', 'Timide'], 1, now()),
  (gen_random_uuid()::text, 'FRANCAIS', 'Conjuguez "venir" a la premiere personne du futur simple :', ARRAY['Je viendrais', 'Je viens', 'Je viendrai', 'Je venais'], 2, now()),
  (gen_random_uuid()::text, 'FRANCAIS', 'Quel mot est un adverbe ?', ARRAY['Rapide', 'Rapidement', 'Rapidite', 'Rapidifier'], 1, now()),

  (gen_random_uuid()::text, 'ANGLAIS', 'Choose the correct form: "She ___ to work every day."', ARRAY['go', 'goes', 'going', 'gone'], 1, now()),
  (gen_random_uuid()::text, 'ANGLAIS', 'What is the synonym of "happy"?', ARRAY['Sad', 'Joyful', 'Angry', 'Tired'], 1, now()),
  (gen_random_uuid()::text, 'ANGLAIS', 'Complete: "I have been working here ___ 2020."', ARRAY['since', 'for', 'from', 'at'], 0, now()),
  (gen_random_uuid()::text, 'ANGLAIS', 'What is the past tense of "go"?', ARRAY['Goed', 'Gone', 'Went', 'Going'], 2, now()),
  (gen_random_uuid()::text, 'ANGLAIS', 'Choose the correct question: "___ is your name?"', ARRAY['What', 'Who', 'Where', 'When'], 0, now());

-- =============================================================
-- Ressources de bibliotheque
-- =============================================================
INSERT INTO library_resources (id, title, category, description, "fileUrl", "correctionUrl", "createdAt") VALUES
  (gen_random_uuid()::text, 'Annales concours CAPES 2024 - Epreuve ecrite', 'ANCIEN_SUJET_CONCOURS',
    'Sujets et corriges du concours CAPES de l''annee precedente.',
    'https://example.com/documents/capes-2024.pdf', 'https://example.com/documents/capes-2024-corrige.pdf', now()),

  (gen_random_uuid()::text, 'Sujets d''entretien - Poste de Developpeur', 'ANCIEN_SUJET_RECRUTEMENT',
    'Questions frequemment posees lors d''entretiens pour des postes techniques.',
    'https://example.com/documents/entretien-developpeur.pdf', NULL, now()),

  (gen_random_uuid()::text, 'Guide de redaction de CV professionnel', 'CONSEIL_CV',
    'Modele et conseils pour structurer un CV efficace.',
    'https://example.com/documents/guide-cv.pdf', NULL, now()),

  (gen_random_uuid()::text, '10 conseils pour reussir un entretien d''embauche', 'CONSEIL_ENTRETIEN',
    'Bonnes pratiques a adopter avant, pendant et apres un entretien.',
    'https://example.com/documents/conseils-entretien.pdf', NULL, now()),

  (gen_random_uuid()::text, 'Fiche de preparation - Tests de logique', 'DOCUMENT_PREPARATION',
    'Methodes et astuces pour resoudre rapidement les tests de logique.',
    'https://example.com/documents/preparation-logique.pdf', NULL, now());

-- =============================================================
-- Fin du script. Verifie dans Table Editor que les tables
-- users / offers / test_questions / library_resources sont peuplees.
-- =============================================================
