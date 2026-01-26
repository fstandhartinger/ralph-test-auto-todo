'use client';

import { useState, useEffect } from 'react';
import { Todo } from './types/todo';
import { ChangeRequest, ChangeRequestComment } from './types/change-request';
import { TodoList } from './components/TodoList';
import { AddTodo } from './components/AddTodo';
import { ThemeToggle } from './components/ThemeToggle';
import {
  READ_STORAGE_KEY,
  getTotalUnread,
  loadReadState,
} from './lib/change-request-read';

const LOCAL_STORAGE_KEY = 'ralph-todos';
const CHANGE_REQUESTS_POLL_INTERVAL_MS = 6000;

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
  const [todos, setTodos] = useState<Todo[]>(() => {
    const storedTodos = loadTodosFromStorage();
    return storedTodos ?? defaultTodos;
  });
  const [unreadCommentCount, setUnreadCommentCount] = useState(0);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    saveTodosToStorage(todos);
  }, [todos]);

  useEffect(() => {
    let isMounted = true;

    const refreshUnreadComments = async () => {
      try {
        const response = await fetch('/api/change-requests');
        if (!response.ok) throw new Error('Failed to fetch');
        const changeRequests = (await response.json()) as ChangeRequest[];
        const commentLists = await Promise.all(
          changeRequests.map(async (cr) => {
            const commentResponse = await fetch(`/api/change-requests/${cr.id}/comments`);
            if (!commentResponse.ok) return [];
            return (await commentResponse.json()) as ChangeRequestComment[];
          })
        );

        const commentsByRequest: Record<string, ChangeRequestComment[]> = {};
        changeRequests.forEach((cr, index) => {
          commentsByRequest[cr.id] = commentLists[index] ?? [];
        });

        const totalUnread = getTotalUnread(commentsByRequest, loadReadState());
        if (isMounted) {
          setUnreadCommentCount(totalUnread);
        }
      } catch {
        if (isMounted) {
          setUnreadCommentCount(0);
        }
      }
    };

    refreshUnreadComments();
    const interval = setInterval(refreshUnreadComments, CHANGE_REQUESTS_POLL_INTERVAL_MS);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === READ_STORAGE_KEY) {
        refreshUnreadComments();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <a href="/change-requests" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem' }}>Change Requests</a>
            {unreadCommentCount > 0 && (
              <span
                data-testid="change-requests-unread-count"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.05rem 0.4rem',
                  minWidth: '1.2rem',
                  textAlign: 'center',
                }}
              >
                {unreadCommentCount}
              </span>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
      <AddTodo onAdd={handleAddTodo} />
      <TodoList todos={todos} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} />
    </main>
  );
}
