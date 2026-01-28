export type TodoStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  targetDate?: string; // Optional ISO date string (YYYY-MM-DD)
  blockedReason?: string;
  blockedAt?: string; // ISO timestamp with seconds
}
