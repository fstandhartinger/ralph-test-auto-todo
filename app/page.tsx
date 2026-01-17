'use client';

import { useState } from 'react';
import { Todo } from './types/todo';
import { TodoList } from './components/TodoList';

const initialTodos: Todo[] = [
  { id: '1', title: 'Learn React', completed: false },
  { id: '2', title: 'Build a todo app', completed: false },
  { id: '3', title: 'Deploy to production', completed: false },
];

export default function Home() {
  const [todos] = useState<Todo[]>(initialTodos);

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ marginBottom: '1.5rem' }}>ralph-test-auto-todo</h1>
      <TodoList todos={todos} />
    </main>
  );
}
