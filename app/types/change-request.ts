export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export type CreateChangeRequestInput = Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'status'>;
export type UpdateChangeRequestInput = Partial<Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at'>>;
