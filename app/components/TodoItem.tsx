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
        padding: '0.75rem 0.5rem',
        borderBottom: '1px solid var(--border-light)',
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
        style={{ cursor: 'pointer', flexShrink: 0, width: '18px', height: '18px' }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <span
          style={{
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? 'var(--text-muted)' : 'inherit',
            wordBreak: 'break-word',
          }}
        >
          {todo.title}
        </span>
        {todo.targetDate && (
          <span
            data-testid="target-date-display"
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Due: {new Date(todo.targetDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <button
        data-testid="delete-todo-button"
        onClick={() => onDelete(todo.id)}
        style={{
          backgroundColor: 'var(--accent)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1rem',
          padding: '0.25rem 0.5rem',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label={`Delete ${todo.title}`}
      >
        ×
      </button>
    </li>
  );
}
