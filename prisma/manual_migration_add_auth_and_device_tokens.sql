-- =============================================================
-- Migration manuelle Carriere+ : mot de passe oublie, verification
-- email, notifications push. A executer dans Supabase SQL Editor
-- si `npx prisma migrate dev` ou `npx prisma db push` echouent a
-- cause d'un probleme reseau local.
-- =============================================================
-- Idempotent : peut etre relance sans erreur si deja execute.
-- =============================================================

-- Colonne emailVerified sur la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Type enum pour distinguer les deux usages de token (verification / reinitialisation)
DO $$ BEGIN
  CREATE TYPE "AuthTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Table des tokens d'authentification (verification email + reset mot de passe)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token       TEXT UNIQUE NOT NULL,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose     "AuthTokenPurpose" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- Table des tokens d'appareil pour les notifications push (Firebase)
CREATE TABLE IF NOT EXISTS device_tokens (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token       TEXT UNIQUE NOT NULL,
  "userId"    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- =============================================================
-- Fin. Verifie dans Table Editor que auth_tokens et device_tokens
-- existent, et que users possede bien la colonne emailVerified.
-- =============================================================
