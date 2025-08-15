import fs from 'fs';
import { extractTextFromPdf } from '../extract/openai';

function redactPII(text: string) {
  let out = text;

  // SSN-like patterns
  out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');

  // Emails
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (m) => {
    const [user, domain] = m.split('@');
    return `${user[0]}***@${domain}`;
    });

  // US phone numbers (very permissive)
  out = out.replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '(***) ***-****');

  // Simple names line (if labeled)
  out = out.replace(/(Name\s*:\s*)([A-Za-z][A-Za-z\s'-]{1,40})/gi, '$1[REDACTED]');

  return out;
}

export async function buildPreview(artifact: { filePath: string }, role: 'USTRANSCOM'|'PRIME'|'PROVIDER'|'MEMBER') {
  if (role === 'MEMBER') {
    const text = await extractTextFromPdf(artifact.filePath);
    const redacted = redactPII(text).slice(0, 8000); // cap preview size
    return { previewType: 'text', role, content: redacted };
  }
  // Others see original path (in prod, serve via signed URL)
  return { previewType: 'original', role, path: artifact.filePath };
}
