export type MoveStatus = 'NEW'|'ASSIGNED'|'SCHEDULED'|'PICKED_UP'|'DELIVERED'|'CLOSED';
export interface Move {
  id: string;
  jobNumber: string;
  memberId: string;
  providerId?: string;
  origin: string;
  destination: string;
  region: string;
  scheduledPickupDate?: string;
  status: MoveStatus;
  createdAt: string;
  updatedAt: string;
}
export interface CreateMoveDto {
  jobNumber: string;
  memberId: string;
  origin: string;
  destination: string;
  region: string;
}
export interface UpdateMoveDto {
  providerId?: string;
  scheduledPickupDate?: string;
  status?: MoveStatus;
}
