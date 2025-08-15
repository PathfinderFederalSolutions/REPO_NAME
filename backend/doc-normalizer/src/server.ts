import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import jobsRouter from './jobs/jobs.controller';
import artifactsRouter from './artifacts/artifacts.controller';
import extractRouter from './extract/extract.controller';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Ensure storage dir exists
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

app.use('/jobs', jobsRouter);
app.use('/artifacts', artifactsRouter);
app.use('/extract', extractRouter);

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[doc-normalizer] listening on :${PORT}`));
