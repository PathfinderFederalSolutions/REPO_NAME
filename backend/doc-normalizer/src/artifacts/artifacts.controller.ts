import { Router } from 'express';
import path from 'path';
import { requireRole, Role } from '../common/roles';
import { getArtifact } from '../common/db';
import { buildPreview } from './preview.service';

const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
const router = Router();

// GET preview (role-aware)
router.get('/:artifactId/preview', requireRole(['USTRANSCOM', 'PRIME', 'MEMBER', 'PROVIDER']), async (req, res) => {
  const { artifactId } = req.params as { artifactId: string };
  const role = (req as any).role as Role;
  const artifact = getArtifact(artifactId);
  if (!artifact) return res.status(404).json({ error: 'Artifact not found' });

  const preview = await buildPreview(artifact, role);
  res.json(preview);
});

// Legacy example stays removed for clarity
export default router;