export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string; // Optional ISO date string (YYYY-MM-DD)
}
