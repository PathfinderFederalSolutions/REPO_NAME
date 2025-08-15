import OpenAI from 'openai';
import fs from 'fs';
import pdf from 'pdf-parse';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { SchemaKind } from '../schemas/json-schemas';
import { getSchema } from '../schemas/json-schemas';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Robust text extractor: try PDF -> fallback to UTF-8 text
export async function extractTextFromPdf(filePath: string) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const isPdf = dataBuffer.length >= 5 && dataBuffer.slice(0, 5).toString() === '%PDF-';

    if (isPdf) {
      try {
        const data = await pdf(dataBuffer);
        if (data.text && data.text.trim().length > 0) {
          return data.text;
        }
      } catch (e) {
        console.error('[extractTextFromPdf] pdf-parse failed, will fallback:', e);
      }
    }

    // Fallback: treat as plain text
    try {
      const asText = fs.readFileSync(filePath, 'utf8');
      return asText || '';
    } catch {
      // ignore
    }

    return '';
  } catch (e) {
    console.error('[extractTextFromPdf] unexpected error:', e);
    return '';
  }
}

// LLM Pass A: choose schema(s)
export async function selectSchemasLLM(textSample: string): Promise<SchemaKind[]> {
  const prompt =
    'You are a logistics document classifier. Decide which canonical schemas apply to this document. Options: [WeightTicket.v1, EPOD.v1, Inventory.v1]. Return a JSON array of strings from these options only.';

  const res = await client.chat.completions.create({
    model: 'gpt-5',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: textSample.slice(0, 8000) },
    ],
    response_format: { type: 'json_object' },
  });

  try {
    const content = res.choices[0].message?.content || '[]';
    const parsed = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : parsed.schemas || [];
    return (arr as string[]).filter((k) =>
      ['WeightTicket.v1', 'EPOD.v1', 'Inventory.v1'].includes(k),
    ) as SchemaKind[];
  } catch {
    return [];
  }
}

// LLM Pass B: structured extraction using JSON Schema derived from Zod
export async function extractToSchemaLLM(kind: SchemaKind, fullText: string): Promise<any> {
  const schema = getSchema(kind);
  const jsonSchemaDraft = zodToJsonSchema(schema, { name: kind.replace('.', '_') });

  const system = `You extract fields for ${kind} from noisy text of a PDF. Return STRICT JSON matching the JSON Schema provided. If unknown, use null or empty arrays. Do not invent values.`;

  const res = await client.chat.completions.create({
    model: 'gpt-5',
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `JSON Schema for ${kind}:\n${JSON.stringify(jsonSchemaDraft)}\n\nDocument text:\n${fullText.slice(
          0,
          60000,
        )}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = res.choices[0].message?.content || '{}';
  return JSON.parse(content);
}