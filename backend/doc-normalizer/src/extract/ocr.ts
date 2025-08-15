import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

/**
 * Check if text looks meaningful (heuristic).
 * We use this to decide whether to fall back to OCR.
 */
export function hasMeaningfulText(txt: string): boolean {
  if (!txt) return false;
  const cleaned = txt.replace(/\s+/g, '');
  if (cleaned.length < 50) return false; // too little content
  // contains at least a few letters or numbers
  return /[A-Za-z0-9]{6,}/.test(cleaned);
}

/**
 * Render a PDF to PNG images using `pdftoppm`, return the list of PNG paths.
 * We use a temp directory so we can clean up afterwards.
 */
function pdfToPngPages(pdfPath: string): string[] {
  // temp dir for images
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));
  const outBase = path.join(tmp, 'page');
  // -png => PNGs, -r 300 => 300 DPI, which helps OCR quality
  execFileSync('pdftoppm', ['-png', '-r', '300', pdfPath, outBase], { stdio: 'ignore' });
  // collect files: page-1.png, page-2.png, ...
  const files = fs.readdirSync(tmp)
    .filter((f) => f.startsWith('page-') && f.endsWith('.png'))
    .sort((a, b) => {
      // numeric sort by page index
      const ai = parseInt(a.replace(/[^\d]/g, ''), 10);
      const bi = parseInt(b.replace(/[^\d]/g, ''), 10);
      return ai - bi;
    })
    .map((f) => path.join(tmp, f));
  return files;
}

/**
 * Run tesseract OCR on a single image and return the recognized text.
 */
function ocrPngToText(pngPath: string): string {
  // Use stdout output ("stdout"), English language (-l eng)
  // --psm 6 works well for uniform blocks of text; adjust if needed
  const out = execFileSync('tesseract', [pngPath, 'stdout', '-l', 'eng', '--psm', '6'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return out || '';
}

/**
 * OCR the entire PDF (page by page) into an array of page texts.
 */
export function ocrPdfToPages(pdfPath: string): string[] {
  try {
    const pngs = pdfToPngPages(pdfPath);
    const pages: string[] = [];
    for (const img of pngs) {
      const text = ocrPngToText(img);
      pages.push(text);
    }
    return pages;
  } catch (e) {
    // If OCR fails (missing tools, etc.), return a single empty page
    return [''];
  }
}