import { nanoid } from 'nanoid';
import { db } from './sqlite';

export type Job = {
  jobNumber: string;
  taskOrderId?: string;
  serviceMemberId?: string;
  primeTspId?: string;
  status?: string;
  createdAt: string;
};

export type Artifact = {
  id: string;
  jobNumber: string;
  providerId?: string;
  type?: string;
  filePath: string;
  originalName: string;
  sha256: string;
  uploadedByRole: string;
  uploadedAt: string;
};

export type ExtractRecord = {
  id: string;
  artifactId: string;
  schemaType: string;
  jsonPayload: any;
  confidence: number;
  validations: { ok: boolean; message: string }[];
  evidenceIndex?: any[];
  createdAt: string;
};

// ---------- Jobs ----------
export function createJob(jobNumber?: string): Job {
  const num = jobNumber || `JOB-${nanoid(8)}`;
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO jobs (jobNumber, createdAt)
    VALUES (?, ?)
  `).run(num, createdAt);
  return { jobNumber: num, createdAt };
}

export function getJob(jobNumber: string): Job | undefined {
  const row = db.prepare(`SELECT * FROM jobs WHERE jobNumber = ?`).get(jobNumber);
  return row as Job | undefined;
}

// ---------- Artifacts ----------
export function addArtifact(a: Omit<Artifact, 'id'>): Artifact {
  const id = nanoid(12);
  const rec: Artifact = { id, ...a } as Artifact;
  db.prepare(`
    INSERT INTO artifacts (id, jobNumber, providerId, type, filePath, originalName, sha256, uploadedByRole, uploadedAt)
    VALUES (@id, @jobNumber, @providerId, @type, @filePath, @originalName, @sha256, @uploadedByRole, @uploadedAt)
  `).run(rec as any);
  return rec;
}

export function listJobArtifacts(jobNumber: string): Artifact[] {
  const rows = db.prepare(`SELECT * FROM artifacts WHERE jobNumber = ? ORDER BY uploadedAt ASC`).all(jobNumber);
  return rows as Artifact[];
}

export function getArtifact(artifactId: string): Artifact | undefined {
  const row = db.prepare(`SELECT * FROM artifacts WHERE id = ?`).get(artifactId);
  return row as Artifact | undefined;
}

// ---------- Extracts ----------
export function addExtract(e: Omit<ExtractRecord, 'id' | 'createdAt'>): ExtractRecord {
  const id = nanoid(12);
  const createdAt = new Date().toISOString();
  const rec: ExtractRecord = {
    id,
    createdAt,
    ...e,
  };
  db.prepare(`
    INSERT INTO extracts (id, artifactId, schemaType, jsonPayload, confidence, validations, evidenceIndex, createdAt)
    VALUES (@id, @artifactId, @schemaType, @jsonPayload, @confidence, @validations, @evidenceIndex, @createdAt)
  `).run({
    ...rec,
    jsonPayload: JSON.stringify(rec.jsonPayload),
    validations: JSON.stringify(rec.validations),
    evidenceIndex: rec.evidenceIndex ? JSON.stringify(rec.evidenceIndex) : null,
  });
  return rec;
}

export function latestExtractForArtifact(artifactId: string): ExtractRecord | undefined {
  const row = db.prepare(`
    SELECT * FROM extracts WHERE artifactId = ? ORDER BY createdAt DESC LIMIT 1
  `).get(artifactId);
  if (!row) return undefined;
  return {
    ...(row as any),
    jsonPayload: JSON.parse((row as any).jsonPayload),
    validations: JSON.parse((row as any).validations),
    evidenceIndex: (row as any).evidenceIndex ? JSON.parse((row as any).evidenceIndex) : undefined,
  } as ExtractRecord;
}