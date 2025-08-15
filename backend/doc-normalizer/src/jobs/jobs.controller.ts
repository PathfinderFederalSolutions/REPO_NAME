import { Router } from 'express';
import {
  createJob,
  getJob,
  listJobArtifacts,
  latestExtractForArtifact,
  addArtifact,
} from '../common/db';
import { requireRole } from '../common/roles';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Create job (USTRANSCOM or PRIME)
router.post('/', requireRole(['USTRANSCOM', 'PRIME']), (req, res) => {
  const { jobNumber, taskOrderId, serviceMemberId, primeTspId } = req.body || {};
  const job = createJob(jobNumber);
  // NOTE: createJob persists jobNumber/createdAt. We return a merged view for now.
  const out = { ...job, taskOrderId, serviceMemberId, primeTspId };
  res.status(201).json(out);
});

// Get job timeline (Member, Provider, TRANSCOM)
router.get(
  '/:jobNumber/timeline',
  requireRole(['USTRANSCOM', 'MEMBER', 'PROVIDER', 'PRIME']),
  (req, res) => {
    const { jobNumber } = req.params as { jobNumber: string };
    const job = getJob(jobNumber);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const artifacts = listJobArtifacts(jobNumber).map((a) => ({
      artifactId: a.id,
      type: a.type || 'UNKNOWN',
      originalName: a.originalName,
      uploadedAt: a.uploadedAt,
      latestExtract: latestExtractForArtifact(a.id)?.schemaType || null,
    }));
    res.json({ job, artifacts });
  }
);

// ---------- Upload artifact to a job (Provider or Prime) ----------
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
const upload = multer({ dest: path.join(STORAGE_DIR, 'incoming') });

router.post(
  '/:jobNumber/artifacts',
  requireRole(['PROVIDER', 'PRIME']),
  upload.single('file'),
  (req, res) => {
    const { jobNumber } = req.params as { jobNumber: string };
    const job = getJob(jobNumber);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    // Move to permanent path and compute sha256
    const destDir = path.join(STORAGE_DIR, jobNumber);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, req.file.filename + '.pdf');
    fs.renameSync(req.file.path, destPath);
    const sha256 = crypto
      .createHash('sha256')
      .update(fs.readFileSync(destPath))
      .digest('hex');

    const providerId = (req.body?.providerId as string) || 'UNKNOWN';
    const art = addArtifact({
      jobNumber,
      providerId,
      type: (req.body?.type as string) || undefined,
      filePath: destPath,
      originalName: req.file.originalname,
      sha256,
      uploadedByRole: (req as any).role,
      uploadedAt: new Date().toISOString(),
    });

    res
      .status(201)
      .json({ artifactId: art.id, sha256, originalName: art.originalName });
  }
);

export default router;
