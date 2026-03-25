-- Sahayak Pustak - Initial Migration
-- Run with: npm run db:migrate

-- Enums
CREATE TYPE book_condition AS ENUM ('new', 'good', 'fair');

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMP,
  image TEXT,
  karma_points INTEGER NOT NULL DEFAULT 0,
  total_books_donated INTEGER NOT NULL DEFAULT 0,
  total_notes_uploaded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NextAuth Tables
CREATE TABLE IF NOT EXISTS accounts (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  session_token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,
  condition book_condition NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_donation BOOLEAN NOT NULL DEFAULT false,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS books_seller_idx ON books(seller_id);
CREATE INDEX IF NOT EXISTS books_semester_idx ON books(semester);
CREATE INDEX IF NOT EXISTS books_donation_idx ON books(is_donation);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester INTEGER NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_uploader_idx ON notes(uploader_id);
CREATE INDEX IF NOT EXISTS notes_semester_idx ON notes(semester);
