export class CreateClaimDto {
  moveId!: string;
  // We store JSON in a TEXT column; accept any JSON-serializable payload
  items?: unknown[];
}
