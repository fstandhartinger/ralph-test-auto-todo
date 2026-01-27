export type TodoStatus = 'todo' | 'in_progress' | 'done';

export interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  targetDate?: string; // Optional ISO date string (YYYY-MM-DD)
}
