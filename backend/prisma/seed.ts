import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // --- Create a demo Move ---
  const move = await prisma.move.create({
    data: {
      taskOrderId: 'TO-0001',
      origin: 'Fort Belvoir, VA',
      destination: 'Scott AFB, IL',
      status: 'CREATED', // per your schema comment: CREATED, ASSIGNED, IN_TRANSIT, DELIVERED
      // assignedCarrierId: null, // optional per schema (commented)
    },
  });

  // --- Messages on the move (fromOrgId/toOrgId are optional per schema snippet) ---
  await prisma.message.createMany({
    data: [
      {
        moveId: move.id,
        text: 'Welcome to your PCS move. We will coordinate pickup dates shortly.',
      },
      {
        moveId: move.id,
        text: 'Please upload any special handling documents if needed.',
      },
    ],
  });

  // --- Claim tied to the move (items is a String in SQLite; store JSON as string) ---
  await prisma.claim.create({
    data: {
      moveId: move.id,
      filedAt: new Date(),
      items: JSON.stringify([
        { description: 'Damaged lamp', amount: 75.0 },
        { description: 'Scratched dresser', amount: 120.0 },
      ]),
      // status defaults to "FILED" per schema
    },
  });

  // --- Notification for a (placeholder) user ---
  // NOTE: Replace "user_demo_1" with a real user id if/when you have users seeded.
  await prisma.notification.create({
    data: {
      userId: 'user_demo_1',
      type: 'MOVE_UPDATE',
      payload: JSON.stringify({ moveId: move.id, message: 'Your move was created.' }),
      // readAt?: null
    },
  });

  // --- AuditEvent (actor fields are optional per schema snippet) ---
  await prisma.auditEvent.create({
    data: {
      type: 'MOVE_CREATED',
      entityType: 'Move',
      entityId: move.id,
      data: JSON.stringify({ taskOrderId: 'TO-0001' }),
      // actorOrgId?: null, actorUserId?: null
    },
  });

  // --- Scorecard (store JSON as string) ---
  await prisma.scorecard.create({
    data: {
      orgId: 'org_prime_demo',
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date(new Date().getFullYear(), 11, 31),
      data: JSON.stringify({
        onTimePickup: 0.98,
        onTimeDelivery: 0.96,
        claimsPerMove: 0.12,
      }),
    },
  });

  // ----- Optional blocks (uncomment + adjust once you confirm required fields) -----

  // // Users (needs your actual fields—e.g., email/name/role if present in schema)
  // await prisma.user.createMany({
  //   data: [
  //     { id: 'user_demo_1' /* , email: 'member@example.mil', name: 'Demo Member', role: 'MEMBER' */ },
  //     { id: 'user_admin_1' /* , email: 'admin@example.mil', name: 'Admin', role: 'ADMIN' */ },
  //   ],
  // });

  // // Preference (likely userId/key/value)
  // await prisma.preference.createMany({
  //   data: [
  //     { /* userId: 'user_demo_1', key: 'notifications.email', value: 'true' */ },
  //   ],
  // });

  // // Exception (depends on your schema)
  // // await prisma.exception.create({ data: { /* ... */ } });

  // // Document (likely moveId/type/url or blob reference)
  // // await prisma.document.create({ data: { /* moveId: move.id, type: 'ORDERS', url: 'https://...' */ } });

  // // PriceBenchmark (we only saw `lane` in your snippet; add required fields if any)
  // // await prisma.priceBenchmark.createMany({
  // //   data: [
  // //     { lane: 'DC->IL' /* , rate: 3000, effectiveFrom: new Date() */ },
  // //   ],
  // // });

  // // AllocationPolicy / AllocationShare (enable when you know required fields)
  // // const policy = await prisma.allocationPolicy.create({
  // //   data: { /* name: 'Default', active: true */ },
  // // });
  // // await prisma.allocationShare.createMany({
  // //   data: [
  // //     { /* policyId: policy.id, orgId: 'org_prime_demo', share: 0.7 */ },
  // //     { /* policyId: policy.id, orgId: 'org_prime_other', share: 0.3 */ },
  // //   ],
  // // });
}

main()
  .then(async () => {
    console.log('Seed complete.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
