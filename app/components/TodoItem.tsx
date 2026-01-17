import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li
      data-testid="todo-item"
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#888' : 'inherit',
        }}
      >
        {todo.title}
      </span>
    </li>
  );
}
