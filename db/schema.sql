-- D1 schema for scan entries (replaces Firestore)

CREATE TABLE IF NOT EXISTS scan_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  naam TEXT,
  email TEXT,
  functie TEXT,
  website TEXT,
  sector TEXT,
  commercieel_team TEXT,
  lead_kanalen TEXT,
  classification TEXT,
  summary_line TEXT,
  score_commercieel REAL DEFAULT 0,
  score_digitaal REAL DEFAULT 0,
  score_ai REAL DEFAULT 0,
  score_groei REAL DEFAULT 0,
  report_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_scan_entries_timestamp ON scan_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_scan_entries_email ON scan_entries(email);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  page_url TEXT,
  source TEXT,
  user_agent TEXT,
  referrer TEXT,
  email_sent INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_timestamp ON contact_submissions(timestamp DESC);
