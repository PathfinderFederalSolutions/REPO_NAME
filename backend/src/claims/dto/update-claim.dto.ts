export class UpdateClaimDto {
  status?: 'FILED' | 'IN_REVIEW' | 'RESOLVED';
  items?: unknown[]; // optional re-submission edits
}
