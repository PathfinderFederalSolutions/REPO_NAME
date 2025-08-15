import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const DATA_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
const DB_DIR = path.join(DATA_DIR, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, 'docnorm.sqlite');

export const db = new Database(DB_PATH);

// Create tables if not exist
db.exec(`
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS jobs (
  jobNumber TEXT PRIMARY KEY,
  taskOrderId TEXT,
  serviceMemberId TEXT,
  primeTspId TEXT,
  status TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  jobNumber TEXT NOT NULL,
  providerId TEXT,
  type TEXT,
  filePath TEXT NOT NULL,
  originalName TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  uploadedByRole TEXT NOT NULL,
  uploadedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artifacts_job ON artifacts(jobNumber);

CREATE TABLE IF NOT EXISTS extracts (
  id TEXT PRIMARY KEY,
  artifactId TEXT NOT NULL,
  schemaType TEXT NOT NULL,
  jsonPayload TEXT NOT NULL,     -- stored as JSON string
  confidence REAL NOT NULL,
  validations TEXT NOT NULL,     -- JSON string array
  evidenceIndex TEXT,            -- JSON string array
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_extracts_artifact ON extracts(artifactId);
`);
