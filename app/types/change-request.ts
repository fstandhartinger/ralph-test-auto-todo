export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  comments?: ChangeRequestComment[];
}

export interface ChangeRequestComment {
  id: string;
  change_request_id: string;
  author: string;
  content: string;
  created_at: string;
}

export type CreateChangeRequestInput = Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'comments'>;
export type UpdateChangeRequestInput = Partial<Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'comments'>>;
export type CreateCommentInput = Omit<ChangeRequestComment, 'id' | 'created_at' | 'change_request_id'>;
