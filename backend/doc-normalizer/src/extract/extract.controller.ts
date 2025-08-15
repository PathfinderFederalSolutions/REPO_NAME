import { Router } from 'express';
import { getArtifact, latestExtractForArtifact } from '../common/db';
import { runExtractionForArtifact } from './extract.service';
import { requireRole } from '../common/roles';

const router = Router();

// Kick off extraction (USTRANSCOM/PRIME can force; PROVIDER may run for own uploads)
router.post('/:artifactId', requireRole(['USTRANSCOM', 'PRIME', 'PROVIDER']), async (req, res) => {
  const { artifactId } = req.params as { artifactId: string };
const art = getArtifact(artifactId);
  if (!art) return res.status(404).json({ error: 'Artifact not found' });
  // Fire and forget (MVP runs inline for simplicity)
  await runExtractionForArtifact(art);
  res.status(202).json({ message: 'Extraction complete (MVP inline). Check latest extract.' });
});

// Get latest extract (Member can read normalized output)
router.get('/:artifactId/latest', requireRole(['USTRANSCOM', 'PRIME', 'PROVIDER', 'MEMBER']), (req, res) => {
  const { artifactId } = req.params as { artifactId: string };
  const latest = latestExtractForArtifact(artifactId);
  if (!latest) return res.status(404).json({ error: 'No extracts yet' });
  res.json(latest);
});

export default router;
