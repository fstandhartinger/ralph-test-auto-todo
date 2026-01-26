'use client';

import { useState, useEffect } from 'react';
import { Todo } from './types/todo';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import { ThemeToggle } from './components/ThemeToggle';

const LOCAL_STORAGE_KEY = 'ralph-todos';

const defaultTodos: Todo[] = [
  { id: '1', title: 'Learn React', completed: false },
  { id: '2', title: 'Build a todo app', completed: false },
  { id: '3', title: 'Deploy to production', completed: false },
];

function loadTodosFromStorage(): Todo[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed as Todo[];
  } catch {
    return null;
  }
}

function saveTodosToStorage(todos: Todo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = loadTodosFromStorage();
    if (storedTodos !== null) {
      setTodos(storedTodos);
    } else {
      setTodos(defaultTodos);
    }
    setIsInitialized(true);
  }, []);

  // Save todos to localStorage whenever they change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveTodosToStorage(todos);
    }
  }, [todos, isInitialized]);

  const handleAddTodo = (title: string, targetDate?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      targetDate,
    };
    setTodos([...todos, newTodo]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main
      style={{
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' }}>ralph-test-auto-todo</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/change-requests" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>Change Requests</a>
          <ThemeToggle />
        </div>
      </div>
      <AddTodo onAdd={handleAddTodo} />
      <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </main>
  );
}
