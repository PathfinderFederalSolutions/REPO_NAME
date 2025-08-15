import fs from 'fs';
import { execFileSync } from 'child_process';
import { hasMeaningfulText, ocrPdfToPages } from './ocr';

/**
 * Load pdfjs in a way that works across versions:
 * - v5+ (ESM builds): import('pdfjs-dist'), worker at build/pdf.worker.mjs (or .js)
 * - v2 "legacy" (CJS builds): require('pdfjs-dist/legacy/build/pdf.js'), worker at legacy/build/pdf.worker.js
 */
async function loadPdfjs(): Promise<any> {
  // Try modern ESM distribution first (v3/v4/v5)
  try {
    const mod: any = await import('pdfjs-dist');
    // Try to locate worker (mjs first, then js)
    let workerSrc: string | undefined;
    try {
      // v5 path
      // @ts-ignore
      workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.mjs');
    } catch {
      try {
        // v3/v4 path
        // @ts-ignore
        workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');
      } catch {
        workerSrc = undefined;
      }
    }
    if (workerSrc) {
      mod.GlobalWorkerOptions.workerSrc = workerSrc;
    }
    return mod;
  } catch {
    // Fallback to legacy CJS (v2.x)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const legacy = require('pdfjs-dist/legacy/build/pdf.js');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const worker = require('pdfjs-dist/legacy/build/pdf.worker.js');
      legacy.GlobalWorkerOptions.workerSrc = worker;
      return legacy;
    } catch (e) {
      throw new Error(
        '[layout] Failed to load pdfjs-dist (neither modern nor legacy builds are available). ' +
          'If you prefer the legacy build, install: npm i pdfjs-dist@2.16.105'
      );
    }
  }
}

/**
 * Extract text from each page of a PDF file.
 * 1) Try pdfjs text extraction (fast, for text PDFs)
 * 2) If not meaningful, fallback to OCR (pdftoppm + tesseract)
 * 3) If all fails, fallback to system pdftotext (last resort)
 */
export async function extractTextPerPage(filePath: string): Promise<string[]> {
  // Pass A: pdfjs
  try {
    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjs.getDocument({ data });
    const doc = (loadingTask && loadingTask.promise) ? await loadingTask.promise : loadingTask;

    const numPages: number = doc.numPages;
    const pages: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
      pages.push(text);
    }

    // If text looks empty/garbled, try OCR
    const joined = pages.join('\n');
    if (hasMeaningfulText(joined)) {
      return pages;
    }
  } catch {
    // Ignore and try OCR next
  }

  // Pass B: OCR
  try {
    const ocrPages = ocrPdfToPages(filePath);
    const joined = ocrPages.join('\n');
    if (hasMeaningfulText(joined)) {
      return ocrPages;
    }
  } catch {
    // Ignore and try last resort
  }

  // Pass C: last-resort pdftotext (if installed)
  try {
    const out = execFileSync('pdftotext', ['-layout', '-q', filePath, '-'], { encoding: 'utf8' });
    return [out];
  } catch {
    return [''];
  }
}

/**
 * Locate a value in the per-page text and return a snippet as evidence.
 */
export function findEvidence(value: string | number, perPage: string[]) {
  const needle = String(value).replace(/[, ]/g, '').toLowerCase();
  for (let i = 0; i < perPage.length; i++) {
    const hay = perPage[i].toLowerCase();
    const idx = hay.indexOf(needle);
    if (idx >= 0) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(hay.length, idx + needle.length + 30);
      return { page: i + 1, snippet: perPage[i].slice(start, end) };
    }
  }
  return undefined;
}