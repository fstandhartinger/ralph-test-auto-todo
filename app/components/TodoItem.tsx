import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
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
      <input
        type="checkbox"
        data-testid="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ cursor: 'pointer' }}
      />
      <span
        style={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#888' : 'inherit',
          flex: 1,
        }}
      >
        {todo.title}
      </span>
      <button
        data-testid="delete-todo-button"
        onClick={() => onDelete(todo.id)}
        style={{
          backgroundColor: '#722F37',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1rem',
          padding: '0.25rem 0.5rem',
          lineHeight: 1,
        }}
        aria-label={`Delete ${todo.title}`}
      >
        ×
      </button>
    </li>
  );
}
