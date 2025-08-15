import { addExtract, type Artifact } from '../common/db';
import { extractTextFromPdf, selectSchemasLLM, extractToSchemaLLM } from './openai';
import { validate } from './validate';
import { extractTextPerPage, findEvidence } from './layout';

export async function runExtractionForArtifact(artifact: Artifact) {
  // Full text for LLM
  const fullText = await extractTextFromPdf(artifact.filePath);
  // Per-page text for evidence hints
  const perPage = await extractTextPerPage(artifact.filePath);

  let kinds = await selectSchemasLLM(fullText);
  if (kinds.length === 0) kinds = ['WeightTicket.v1']; // default guess

  for (const kind of kinds) {
    const jsonPayload = await extractToSchemaLLM(kind, fullText);
    const validations = validate(kind, jsonPayload);
    const ok = validations.every(v => v.ok);
    const confidence = ok ? 0.9 : 0.6;

    // Add minimal evidence (page + snippet) for known fields
    const evidenceIndex: any[] = [];

    if (kind === 'WeightTicket.v1') {
      if (jsonPayload.ticketNo) {
        const ev = findEvidence(jsonPayload.ticketNo, perPage);
        if (ev) evidenceIndex.push({ field: 'ticketNo', ...ev });
      }
      if (jsonPayload.scaleName) {
        const ev = findEvidence(jsonPayload.scaleName, perPage);
        if (ev) evidenceIndex.push({ field: 'scaleName', ...ev });
      }
      if (jsonPayload.vehicleId) {
        const ev = findEvidence(jsonPayload.vehicleId, perPage);
        if (ev) evidenceIndex.push({ field: 'vehicleId', ...ev });
      }
      if (jsonPayload.weighIn?.value) {
        const ev = findEvidence(jsonPayload.weighIn.value, perPage);
        if (ev) evidenceIndex.push({ field: 'weighIn.value', ...ev });
      }
      if (jsonPayload.weighOut?.value) {
        const ev = findEvidence(jsonPayload.weighOut.value, perPage);
        if (ev) evidenceIndex.push({ field: 'weighOut.value', ...ev });
      }
      if (jsonPayload.netWeight?.value) {
        const ev = findEvidence(jsonPayload.netWeight.value, perPage);
        if (ev) evidenceIndex.push({ field: 'netWeight.value', ...ev });
      }
    }

    addExtract({
      artifactId: artifact.id,
      schemaType: kind,
      jsonPayload,
      confidence,
      validations,
      evidenceIndex,
    });
  }
}
