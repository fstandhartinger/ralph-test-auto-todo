import { Todo } from '../types/todo';

interface KanbanCardProps {
  todo: Todo;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onDelete: () => void;
}

export function KanbanCard({
  todo,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  onDelete,
}: KanbanCardProps) {
  return (
    <div
      data-testid="todo-item"
      data-status={todo.status}
      style={{
        border: '1px solid var(--card-border)',
        borderRadius: '10px',
        padding: '0.75rem',
        backgroundColor: 'var(--card-background)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              color: 'var(--text-secondary)',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {todo.title}
          </p>
          {todo.targetDate && (
            <p
              data-testid="target-date-display"
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Due: {new Date(todo.targetDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          type="button"
          data-testid="delete-todo-button"
          onClick={onDelete}
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1rem',
            padding: '0.15rem 0.5rem',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label={`Delete ${todo.title}`}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <button
          type="button"
          data-testid="todo-move-left"
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--input-border)',
            backgroundColor: canMoveLeft ? 'transparent' : 'var(--form-background)',
            color: canMoveLeft ? 'var(--text-secondary)' : 'var(--text-muted)',
            cursor: canMoveLeft ? 'pointer' : 'not-allowed',
          }}
          aria-label="Move left"
        >
          ◀
        </button>
        <button
          type="button"
          data-testid="todo-move-right"
          onClick={onMoveRight}
          disabled={!canMoveRight}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--input-border)',
            backgroundColor: canMoveRight ? 'var(--accent)' : 'var(--form-background)',
            color: canMoveRight ? 'white' : 'var(--text-muted)',
            cursor: canMoveRight ? 'pointer' : 'not-allowed',
          }}
          aria-label="Move right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
