import { z } from 'zod';

// Shared primitives
const isoDate = () => z.string().datetime().or(z.string());
const unit = z.enum(['lb','kg']);

export const WeightTicketV1 = z.object({
  ticketNo: z.string().nullable().optional(),
  scaleName: z.string().nullable().optional(),
  dateTime: isoDate().nullable().optional(),
  vehicleId: z.string().nullable().optional(),
  weighIn: z.object({ value: z.number(), unit }),
  weighOut: z.object({ value: z.number(), unit }),
  tareMethod: z.string().nullable().optional(),
  netWeight: z.object({ value: z.number(), unit }),
});
export type WeightTicketV1 = z.infer<typeof WeightTicketV1>;

export const EPODV1 = z.object({
  signerName: z.string().nullable().optional(),
  signedAt: isoDate().nullable().optional(),
  itemsDelivered: z.number().nullable().optional(),
  exceptions: z.array(z.object({ code: z.string(), notes: z.string().optional() })).default([]),
});
export type EPODV1 = z.infer<typeof EPODV1>;

export const InventoryItemV1 = z.object({
  tagId: z.string().nullable().optional(),
  description: z.string(),
  room: z.string().nullable().optional(),
  conditionIn: z.string().nullable().optional(),
  conditionOut: z.string().nullable().optional(),
});
export const InventoryV1 = z.object({ items: z.array(InventoryItemV1) });
export type InventoryV1 = z.infer<typeof InventoryV1>;

export type SchemaKind = 'WeightTicket.v1' | 'EPOD.v1' | 'Inventory.v1';
export function getSchema(kind: SchemaKind) {
  switch (kind) {
    case 'WeightTicket.v1': return WeightTicketV1;
    case 'EPOD.v1': return EPODV1;
    case 'Inventory.v1': return InventoryV1;
  }
}
