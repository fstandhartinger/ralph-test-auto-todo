import { Todo, TodoStatus } from '../types/todo';
import { KanbanCard } from './KanbanCard';

const COLUMNS: Array<{ id: TodoStatus; title: string; subtitle: string }> = [
  { id: 'todo', title: 'Todo', subtitle: 'Next up' },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Actively moving' },
  { id: 'done', title: 'Done', subtitle: 'Shipped' },
];

interface KanbanBoardProps {
  todos: Todo[];
  onUpdateStatus: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ todos, onUpdateStatus, onDelete }: KanbanBoardProps) {
  return (
    <section
      data-testid="kanban-board"
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {COLUMNS.map((column, columnIndex) => {
        const columnTodos = todos.filter((todo) => todo.status === column.id);
        return (
          <div
            key={column.id}
            data-testid="kanban-column"
            data-status={column.id}
            style={{
              backgroundColor: 'var(--form-background)',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              minHeight: '240px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '1rem' }}>{column.title}</h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--card-background)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {columnTodos.length}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {column.subtitle}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {columnTodos.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px dashed var(--border-light)',
                    backgroundColor: 'var(--card-background)',
                  }}
                >
                  Nothing here yet.
                </p>
              ) : (
                columnTodos.map((todo) => (
                  <KanbanCard
                    key={todo.id}
                    todo={todo}
                    canMoveLeft={columnIndex > 0}
                    canMoveRight={columnIndex < COLUMNS.length - 1}
                    onMoveLeft={() => {
                      if (columnIndex > 0) {
                        onUpdateStatus(todo.id, COLUMNS[columnIndex - 1].id);
                      }
                    }}
                    onMoveRight={() => {
                      if (columnIndex < COLUMNS.length - 1) {
                        onUpdateStatus(todo.id, COLUMNS[columnIndex + 1].id);
                      }
                    }}
                    onDelete={() => onDelete(todo.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
