import { SchemaKind, WeightTicketV1, EPODV1, InventoryV1 } from '../schemas/json-schemas';

export function validate(kind: SchemaKind, payload: any) {
  const messages: { ok: boolean; message: string }[] = [];
  try {
    switch (kind) {
      case 'WeightTicket.v1': {
        const p = WeightTicketV1.parse(payload);
        if (p.weighOut.value <= p.weighIn.value)
          messages.push({ ok: false, message: 'weighOut must be > weighIn' });
        const computed = +(p.weighOut.value - p.weighIn.value).toFixed(1);
        if (Math.abs(computed - p.netWeight.value) > 1)
          messages.push({ ok: false, message: 'netWeight != out - in (±1)' });
        break;
      }
      case 'EPOD.v1': {
        EPODV1.parse(payload);
        break;
      }
      case 'Inventory.v1': {
        const p = InventoryV1.parse(payload);
        if (!p.items || p.items.length === 0)
          messages.push({ ok: false, message: 'Inventory has no items' });
        break;
      }
    }
  } catch (e: any) {
    messages.push({ ok: false, message: `Schema validation failed: ${e.message}` });
  }
  if (messages.length === 0) messages.push({ ok: true, message: 'ok' });
  return messages;
}
